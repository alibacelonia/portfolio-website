# Terraform: static hosting for alibacelonia.dev

Single root module. Step-by-step usage, DNS, rollback and cost: [`docs/deployment.md`](../../docs/deployment.md).

## Resources

| File                          | Creates                                                                                                                                                                                                      |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `s3.tf`                       | Private bucket: public access blocked, `BucketOwnerEnforced`, SSE-S3, versioning, 30-day noncurrent-version expiry, policy allowing only this distribution (`AWS:SourceArn`) and denying non-TLS access      |
| `cloudfront.tf`               | Origin Access Control (SigV4), distribution (HTTPS redirect, HTTP/2+3, IPv6, `CachingOptimized`, TLS 1.2 2021 with a custom domain), security headers policy, viewer-request function, 403/404 → `/404.html` |
| `functions/viewer-request.js` | `/path/` → `/path/index.html`; secondary domains 301 to the primary                                                                                                                                          |
| `acm.tf`                      | DNS-validated certificate in **us-east-1** (only when `domain_names` is set and no `acm_certificate_arn` is given)                                                                                           |
| `dns.tf`                      | Route 53 validation and alias records (only when `route53_zone_id` is set)                                                                                                                                   |
| `github-oidc.tf`              | GitHub OIDC provider (optional) and the deploy role: `s3:ListBucket` on the bucket, `Get/Put/DeleteObject` on its objects, `cloudfront:Create/GetInvalidation` on the distribution                           |

## Inputs (main)

| Variable                      | Default                          | Notes                                                 |
| ----------------------------- | -------------------------------- | ----------------------------------------------------- |
| `aws_region`                  | `ap-southeast-1`                 | Bucket and IAM region                                 |
| `domain_names`                | `[]`                             | First is canonical; empty uses `*.cloudfront.net`     |
| `acm_certificate_arn`         | `""`                             | Bring your own us-east-1 certificate                  |
| `route53_zone_id`             | `""`                             | Empty = external DNS (Cloudflare); records are output |
| `price_class`                 | `PriceClass_200`                 | Includes Asia                                         |
| `github_repository`           | `alibacelonia/portfolio-website` | `owner/name` allowed to deploy                        |
| `github_environment`          | `production`                     | Must match the workflow's environment                 |
| `create_github_oidc_provider` | `true`                           | Set `false` if the account already has one            |

## Outputs

`bucket_name`, `cloudfront_distribution_id`, `cloudfront_domain_name`, `deploy_role_arn`, `site_url`, `acm_validation_records`, `dns_records_to_create`.

## Validate locally (no AWS access needed)

```bash
terraform fmt -check -recursive
terraform init -backend=false
terraform validate
```

Not deployed. `terraform plan` and `apply` require AWS credentials and the owner's approval.
