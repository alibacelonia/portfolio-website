# Deployment

Nothing in this repository provisions AWS resources or changes DNS automatically. Every step below is run deliberately by the owner.

## Overview

| Piece          | Where                                                                                                        |
| -------------- | ------------------------------------------------------------------------------------------------------------ |
| Infrastructure | `infra/terraform` (S3, CloudFront, ACM, OIDC role)                                                           |
| CI             | `.github/workflows/ci.yml`: lint, typecheck, format, unit tests, build, Playwright + axe, Terraform validate |
| CD             | `.github/workflows/deploy.yml`: on push to `main`, reruns CI, then publishes with `scripts/deploy.sh`        |
| DNS            | `alibacelonia.dev` is on **Cloudflare** (not Route 53)                                                       |

## 1. Prerequisites

- AWS account with permission to create S3, CloudFront, ACM, and IAM resources (admin for the first apply).
- Terraform ≥ 1.10, AWS CLI v2, Node 22.
- This code pushed to `github.com/alibacelonia/portfolio-website` (currently empty). Update that repository's description; it still describes an older API Gateway/Lambda/SES design.

## 2. Terraform state (one time)

```bash
aws s3api create-bucket --bucket <state-bucket> --region ap-southeast-1 \
  --create-bucket-configuration LocationConstraint=ap-southeast-1
aws s3api put-bucket-versioning --bucket <state-bucket> --versioning-configuration Status=Enabled
aws s3api put-public-access-block --bucket <state-bucket> \
  --public-access-block-configuration BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true
```

```bash
cd infra/terraform
cp backend.hcl.example backend.hcl        # set the state bucket
cp terraform.tfvars.example terraform.tfvars
terraform init -backend-config=backend.hcl
```

## 3. First apply: no custom domain

Keep `domain_names = []`. The site is then served at the `*.cloudfront.net` hostname.

```bash
terraform plan -out=tfplan
terraform apply tfplan
terraform output
```

If the account already has the GitHub OIDC provider (`token.actions.githubusercontent.com`), set `create_github_oidc_provider = false` and pass `github_oidc_provider_arn`.

## 4. GitHub configuration

1. **Settings → Environments → New environment `production`.**
   - Deployment branches: _Selected branches_ → `main`.
   - Optional: _Required reviewers_ (yourself) for a manual approval gate.
2. **Settings → Secrets and variables → Actions → Variables** (no secrets are needed):

| Variable                     | Value                                                              |
| ---------------------------- | ------------------------------------------------------------------ |
| `AWS_DEPLOY_ROLE_ARN`        | `terraform output -raw deploy_role_arn`                            |
| `AWS_REGION`                 | `ap-southeast-1` (or your `aws_region`)                            |
| `S3_BUCKET`                  | `terraform output -raw bucket_name`                                |
| `CLOUDFRONT_DISTRIBUTION_ID` | `terraform output -raw cloudfront_distribution_id`                 |
| `SITE_URL`                   | `https://alibacelonia.dev` (canonical origin baked into the build) |
| `CONTACT_API_URL`            | Contact API endpoint (see Contact API)                             |
| `TURNSTILE_SITE_KEY`         | Cloudflare Turnstile site key (public)                             |
| `CAL_LINK`                   | Cal.com `user/event` for the Book a call tab (optional)            |

The deploy job is **skipped** until `AWS_DEPLOY_ROLE_ARN` is set, so CI stays green before AWS exists.

### How OIDC works here

GitHub issues a short-lived token for each job. The role's trust policy accepts it only when:

- `aud` = `sts.amazonaws.com`, and
- `sub` = `repo:alibacelonia/portfolio-website:environment:production`

So only jobs in that repository that target the protected `production` environment (which is restricted to `main`) can assume the role. The role can list and write objects in one bucket and invalidate one distribution. No access keys exist.

## 5. Deploy

Push to `main` (or run **Actions → Deploy → Run workflow**). The deploy job:

1. downloads the `out/` artifact built and tested by CI in the same run;
2. uploads `_next/static/**` with `Cache-Control: public, max-age=31536000, immutable`;
3. uploads everything else with `public, max-age=0, must-revalidate` and deletes files no longer in the build (old hashed assets are kept on purpose);
4. uploads `/opengraph-image` as `image/png`;
5. invalidates `/*` and waits for completion.

Manual deploy from a workstation (same script):

```bash
npm ci && NEXT_PUBLIC_SITE_URL=https://alibacelonia.dev npm run build
S3_BUCKET=... CLOUDFRONT_DISTRIBUTION_ID=... scripts/deploy.sh out
```

Verify at the `cloudfront_domain_name` output before touching DNS.

## 6. Custom domain (Cloudflare DNS)

`alibacelonia.dev` currently points at an existing Vercel deployment through Cloudflare. Switching DNS replaces that live site, so do this only when ready.

1. In `terraform.tfvars`: `domain_names = ["alibacelonia.dev", "www.alibacelonia.dev"]` (first = canonical; `www` 301-redirects to it).
2. Request the certificate first, then add its validation records:

   ```bash
   terraform apply -target='aws_acm_certificate.site[0]'
   terraform output acm_validation_records
   ```

   In Cloudflare, create each record as **CNAME, Proxy status: DNS only** (grey cloud). Validation records must not be proxied.

3. Finish the apply. It waits (up to 60 minutes) until ACM issues the certificate, then adds the aliases to CloudFront:

   ```bash
   terraform apply
   terraform output dns_records_to_create
   ```

4. In Cloudflare, replace the existing apex and `www` records with **CNAME → `<cloudfront_domain_name>`**, **DNS only**. Cloudflare flattens the apex CNAME automatically. Keeping the records proxied (orange cloud) would put Cloudflare's TLS and cache in front of CloudFront; DNS only keeps a single CDN and the CloudFront security headers authoritative.
5. Check `https://alibacelonia.dev`, `https://www.alibacelonia.dev` (should redirect), and the certificate.

### Changing the domain later

`NEXT_PUBLIC_SITE_URL` (GitHub variable `SITE_URL`) is the single source for canonical URLs, sitemap, robots, Open Graph and JSON-LD. To move domains: put the new name first in `domain_names` (older names after it redirect), validate the new certificate, update `SITE_URL`, redeploy, then switch DNS. Do not change `SITE_URL` before the new domain serves the site.

After go-live, update `src/data/projects.ts`: remove `status: "planned"` from the Website Portfolio's provisioning and custom-domain items.

## Contact API (API Gateway, Lambda, DynamoDB, SES) — needs owner approval

```
Visitor → alibacelonia.dev (static form + Cloudflare Turnstile)
        → API Gateway HTTP API  POST /contact  (CORS: site origin; throttle 2 rps, burst 5)
        → Lambda (Node.js 22, arm64)  infra/lambda/contact
            validate → verify Turnstile → per-IP hourly limit → duplicate check → daily quota
            ↕ DynamoDB  (counters and fingerprints with TTL)
        → Amazon SES  noreply@alibacelonia.dev → alibacelonia1234@gmail.com  (Reply-To: visitor)
```

Everything is in `infra/terraform/modules/contact-api`, created only when `enable_contact_api = true`. All of these are chargeable AWS resources (low cost at portfolio volume: pay-per-request DynamoDB, Lambda and HTTP API free tiers, SES about $0.10 per 1,000 emails), so nothing here has been applied.

1. **Turnstile:** in Cloudflare, create a Turnstile widget for `alibacelonia.dev` (and `localhost` for testing). The site key is public; the secret key is not.
2. **Store the secret in SSM** (never in Terraform, code or GitHub):
   ```sh
   aws ssm put-parameter --region ap-southeast-1 --type SecureString \
     --name /alibacelonia-portfolio/turnstile-secret --value '<secret key>'
   ```
3. **Apply** with `enable_contact_api = true` in `terraform.tfvars` (and `domain_names` set, which also supplies the allowed origin). Applying sends an SES verification email to the recipient inbox; click it.
4. **SES domain (DNS change, needs approval):** add the three `contact_ses_dkim_records` CNAMEs in Cloudflare as _DNS only_. Optionally add an SPF/DMARC record for the domain.
5. **Leave the SES sandbox:** request production access in the SES console. In the sandbox, only verified addresses can receive mail (the recipient is verified in step 3, so the form works for you either way).
6. **GitHub variables:** `CONTACT_API_URL` = `contact_api_endpoint` output, `TURNSTILE_SITE_KEY` = the site key. Redeploy. The form then sends through the API; until `CONTACT_API_URL` is set it tells visitors sending isn't available and shows the email address.

The CloudFront CSP already allows `challenges.cloudflare.com` (Turnstile) and Cal.com (`https://app.cal.com` for the embed script and frame, `https://cal.com` for the plain-iframe fallback), and adds the API origin automatically when the module is enabled.

Limits (variables in the module): 5 messages per IP per hour, 50 per day overall, identical messages from the same address rejected for 24 hours, API Gateway throttled to 2 requests/second (burst 5). Reserved Lambda concurrency is off by default (`reserved_concurrency = -1`) because new AWS accounts have a concurrency limit of 10, all of which must stay unreserved. Logs contain no names, emails, messages or raw IPs.

## Booking (Cal.com)

Set the GitHub **repository** variable `CAL_LINK` (e.g. `alibacelonia/30min` or the full `https://cal.com/…` link) to show the **Book a call** tab on `/connect/`. Without it the tab is hidden in production.

The tab uses Cal.com's inline embed (`embed.js`, loaded only on `/connect/`, preconnected and preloaded from the static HTML): a transparent calendar in the site's colors, no event-details panel, height that follows the calendar, and a skeleton until Cal.com reports it's ready. If the script is blocked (e.g. a CSP without `https://app.cal.com`) or not ready within 15 s, the plain Cal.com iframe is shown instead. The "Cal.com" mark below the calendar is Cal.com's free-plan branding; it can only be removed in Cal.com (paid plan), not from the site.

## Rollback

- **Preferred:** `git revert <bad-commit>` and push to `main`. CI rebuilds and redeploys a known state.
- **Emergency (bypasses CI):** the bucket is versioned. Rebuild the last good commit locally and run `scripts/deploy.sh`, or restore objects to their previous versions:

  ```bash
  aws s3api list-object-versions --bucket <bucket> --prefix index.html
  aws s3api copy-object --bucket <bucket> --key index.html \
    --copy-source "<bucket>/index.html?versionId=<version>" \
    --cache-control "public, max-age=0, must-revalidate" --metadata-directive REPLACE \
    --content-type text/html
  aws cloudfront create-invalidation --distribution-id <id> --paths "/*"
  ```

  Previous versions are kept for 30 days (`noncurrent_version_retention_days`).

- **Infrastructure:** revert the Terraform change and `terraform apply`.

## Cleanup

```bash
aws s3 rm s3://<bucket> --recursive            # current objects
# versioned buckets also need old versions removed (or set force_destroy = true and apply first)
terraform destroy
```

Remove the Cloudflare records and GitHub variables afterwards. The ACM certificate is deleted by `destroy` once CloudFront no longer uses it.

## Cost

For a personal portfolio, expect low single-digit USD per month or less:

- **CloudFront:** the always-free tier covers 1 TB transfer and 10 M requests per month. Invalidations: first 1,000 paths/month free (each deploy uses one `/*` path). CloudFront Functions: 2 M invocations/month free.
- **S3:** a few MB of storage plus versions; requests are mostly served from cache.
- **ACM** public certificates: free. **Route 53** (only if used): about USD 0.50 per hosted zone per month.
- **IAM/OIDC:** free.

Set an AWS Budget alert (for example USD 5) on the account.

## Local production preview

```bash
npm run build && npm run preview     # http://localhost:4173
```

`serve` does not apply the CloudFront security headers or cache rules; those exist only in AWS.
