# Deploy on Vercel (free, no AWS needed)

This guide puts the portfolio online with [Vercel](https://vercel.com), step by step. You don't need an AWS account, a credit card, or any cloud experience. If you can use GitHub in a browser, you can do this. Plan for about 20–30 minutes the first time.

> The main deployment for alibacelonia.dev uses AWS S3 and CloudFront ([deployment.md](deployment.md)). Vercel is the simpler alternative. You only need one of the two.

## What you get

|                       | Vercel (this guide)                                                           | AWS S3 + CloudFront ([deployment.md](deployment.md)) |
| --------------------- | ----------------------------------------------------------------------------- | ---------------------------------------------------- |
| Cost                  | Free on the Hobby plan (personal, non-commercial sites)                       | A few dollars a month, pay as you go                 |
| Setup                 | Click through a website, ~20 minutes                                          | Terraform, IAM, DNS; ~1–2 hours                      |
| Updates               | Automatic on every push to `main`                                             | Automatic through GitHub Actions                     |
| Previews              | Every branch and pull request gets its own link                               | Not included                                         |
| HTTPS, custom domain  | Included                                                                      | Included                                             |
| Security headers      | Same headers (from `vercel.json`)                                             | From CloudFront                                      |
| Contact form          | Not available without the AWS contact API (see [Contact form](#contact-form)) | Available (optional AWS module)                      |
| Book a call (Cal.com) | Works                                                                         | Works                                                |

Check [vercel.com/pricing](https://vercel.com/pricing) for the current free-plan limits. A personal portfolio normally stays well inside them. If the site is for a business or you earn money from it, Vercel requires a paid plan.

## Words you'll see

- **Repository (repo):** the project's folder on GitHub.
- **Fork:** your own copy of someone else's repository, under your GitHub account.
- **Deploy / deployment:** one published version of the site. Vercel makes a new one every time you push.
- **Environment variable:** a setting (name + value) that Vercel passes to the build, such as your site's address.
- **Redeploy:** build and publish again. Needed after you change an environment variable.
- **Domain:** a web address like `yourname.dev`. Vercel gives you a free one ending in `.vercel.app`.

## Before you start

You need:

1. A **GitHub account**. Sign up at [github.com](https://github.com) if you don't have one.
2. A **Vercel account**. Go to [vercel.com/signup](https://vercel.com/signup), choose the **Hobby** plan and **Continue with GitHub**. Using GitHub to sign in lets Vercel see your repositories later.
3. _(Optional)_ A **Cal.com** account if you want visitors to book calls ([cal.com](https://cal.com), free).
4. _(Optional)_ Your **own domain** (around 10–15 USD a year from a registrar such as Cloudflare, Namecheap or Porkbun). You can skip this and use the free `.vercel.app` address.

You do **not** need Node.js, a terminal or any installs on your computer for this guide. Everything happens in the browser.

## Step 1: Get your own copy of the code

1. Open the repository on GitHub: [github.com/alibacelonia/portfolio-website](https://github.com/alibacelonia/portfolio-website).
2. Click **Fork** (top right), keep the defaults and click **Create fork**. You now have `github.com/<your-username>/portfolio-website`.
3. Make it yours. The content lives in a few files you can edit right on GitHub (open a file, click the pencil icon, edit, then **Commit changes**):
   - `src/lib/site.ts`: your name, roles, email, GitHub and LinkedIn links, location.
   - `src/data/`: experience, projects, skills and certifications. Only list things that are true about you.
   - `public/images/`: your portrait (replace the file, keep the same name, or update the path in `src/components/sections/Hero.tsx`).
   - `public/documents/`: your CV as a PDF (update `resume` in `src/lib/site.ts` if you rename it).

   You can also do this after the site is online; every change you commit goes live automatically.

## Step 2: Import the project into Vercel

1. Go to your Vercel dashboard ([vercel.com/dashboard](https://vercel.com/dashboard)).
2. Click **Add New…** → **Project**.
3. Under **Import Git Repository**, find `portfolio-website` and click **Import**.
   - Don't see it? Click **Adjust GitHub App Permissions** (or **Configure GitHub App**), allow access to the repository, and come back.
4. On the **Configure Project** screen:
   - **Framework Preset:** Vercel detects **Next.js**. Leave it.
   - **Root Directory:** leave as `./`.
   - **Build and Output Settings:** leave them alone. The project's `vercel.json` already sets the install command (`npm ci`) and build command (`npm run build`).
5. Open **Environment Variables** on the same screen and add the settings from Step 3 before you click **Deploy**. (You can also add them later; then redeploy.)

## Step 3: Environment variables

Add each one as **Key** and **Value**, then click **Add**. Every variable here is public by design (it ends up in the website's code), so none of them are passwords.

| Key                              | Required?   | What to put                                                                                                                                                                                                         | Example                          |
| -------------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| `NEXT_PUBLIC_SITE_URL`           | Recommended | Your site's address, starting with `https://`, no slash at the end. On your first deploy you can leave it out: the site then uses its Vercel production address automatically. Set it once you add your own domain. | `https://yourname.dev`           |
| `NEXT_PUBLIC_CAL_LINK`           | Optional    | Your Cal.com booking link. Shows the **Book a call** tab on the Connect page. Leave it out to hide the tab.                                                                                                         | `https://cal.com/yourname/30min` |
| `NEXT_PUBLIC_CONTACT_API_URL`    | No          | Only if you also set up the AWS contact API. Leave it out on Vercel.                                                                                                                                                | —                                |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | No          | Only together with the contact API. Leave it out.                                                                                                                                                                   | —                                |

Important things to know:

- **Variables are read when the site is built.** After you add or change one, you must **redeploy** (Step 6) before you see the change.
- Leave the environment checkboxes (Production, Preview, Development) all ticked unless you know you want different values per environment.

## Step 4: Deploy

1. Click **Deploy**.
2. Wait 1–3 minutes. Vercel installs the packages, builds the site and publishes it. You can click the build to watch the log.
3. When you see the confetti / **Congratulations!** screen, click **Continue to Dashboard**, then **Visit**.

Your site is live at an address like `https://portfolio-website-yourname.vercel.app`.

### Check that everything works

Open the site and go through this list:

- [ ] The home page loads in **dark mode** (the default). The sun/moon button in the top bar switches to light and remembers your choice.
- [ ] Your name, photo and projects are yours (if you edited them in Step 1).
- [ ] Links in the top bar scroll to each section; **View all projects** opens `/projects/`.
- [ ] A made-up address such as `/does-not-exist` shows the site's own **Page not found** page.
- [ ] If you set `NEXT_PUBLIC_CAL_LINK`: `/connect/` shows **Book a call** with your calendar.
- [ ] Optional: paste your address into [securityheaders.com](https://securityheaders.com). It should report the headers from `vercel.json` (Content-Security-Policy, Strict-Transport-Security, X-Frame-Options and others).

## Step 5: Use your own domain (optional)

1. In Vercel, open your project → **Settings** → **Domains**.
2. Type your domain (e.g. `yourname.dev`) and click **Add**. Choose the recommended option that also adds `www.yourname.dev` and redirects it to the main address.
3. Vercel now shows the **DNS records** your domain needs (usually an **A** record for `yourname.dev` and a **CNAME** record for `www`). Keep this page open.
4. In another tab, sign in where you bought the domain, open its **DNS** settings, and add exactly the records Vercel shows: same **Type**, **Name** and **Value**. Delete any old A/CNAME records for the same names that point somewhere else.
   - Using **Cloudflare** DNS? Set those records to **DNS only** (grey cloud), not proxied.
5. Back in Vercel, wait until both domains show **Valid Configuration** (usually minutes, sometimes up to a few hours). Vercel issues the HTTPS certificate automatically.
6. Set `NEXT_PUBLIC_SITE_URL` to `https://yourname.dev` (Step 3), then **redeploy** (Step 6). This makes search engines, link previews and the sitemap use your domain.

## Step 6: Redeploy after changing settings

1. Open your project → **Deployments**.
2. On the newest deployment, click the **⋯** menu → **Redeploy** → **Redeploy**.

Code changes don't need this: every commit to `main` deploys by itself.

## Updating your site

- **Edit and commit to `main`** (on GitHub or from your computer): Vercel builds and publishes it automatically, usually within two minutes.
- **Try changes safely:** commit to a new branch or open a pull request. Vercel builds a **preview** with its own link and comments it on the pull request. `main` stays untouched until you merge.
- **Undo a bad release:** **Deployments** → pick the last good one → **⋯** → **Promote to Production** (or **Instant Rollback**). It takes seconds.

## GitHub Actions in your fork

The repository includes two workflows:

- **CI** (`.github/workflows/ci.yml`) runs the checks and tests on every push and pull request. Keep it: it catches mistakes before they go live. If GitHub asks, click **I understand my workflows, go ahead and enable them** on your fork's **Actions** tab.
- **Deploy** (`.github/workflows/deploy.yml`) publishes to AWS. On Vercel you don't need it, and you don't have to change anything: its publish step is **skipped automatically** while the repository variable `AWS_DEPLOY_ROLE_ARN` is not set.

Want Vercel to publish only when CI passes? In GitHub, open your fork → **Settings** → **Branches** → **Add branch ruleset** (or protection rule) for `main`, require the CI checks, and make changes through pull requests.

## Book a call (Cal.com)

1. Create a free account at [cal.com](https://cal.com) and an event type (for example "30 Minute Meeting").
2. Copy the event's public link, such as `https://cal.com/yourname/30min`.
3. Add it in Vercel as `NEXT_PUBLIC_CAL_LINK` (Step 3) and redeploy (Step 6).

The calendar appears in the **Book a call** tab on `/connect/`. The small "Cal.com" mark under it is part of Cal.com's free plan.

## Contact form

The **Send a message** form posts to a small AWS service (API Gateway, Lambda, DynamoDB and SES). Without it, which is the normal case on Vercel, the form is still shown but answers "Sending isn't available right now." when submitted. Visitors can still reach you through:

- the **email** box with its **Copy** button on the Connect page,
- the **LinkedIn**, **GitHub** and **CV** buttons,
- **Book a call**, if you set up Cal.com.

If you later want the form to send email, you can create only the contact API on AWS (see "Contact API" in [deployment.md](deployment.md)), set `NEXT_PUBLIC_CONTACT_API_URL` and `NEXT_PUBLIC_TURNSTILE_SITE_KEY` in Vercel, and add the API's address to `connect-src` in `vercel.json` (see the next section).

## Security headers (`vercel.json`)

`vercel.json` sends the same security headers as the AWS setup: HTTPS-only (HSTS), no framing, no MIME sniffing, a strict referrer policy, disabled camera/microphone/location, and a Content-Security-Policy (CSP) that only allows the site itself plus Cloudflare Turnstile and Cal.com. A unit test (`tests/vercel.test.ts`) keeps it in line with the CloudFront policy.

Change it only if you add another outside service. For example, with the contact API, add its origin to `connect-src`:

```text
connect-src 'self' https://challenges.cloudflare.com https://abc123.execute-api.ap-southeast-1.amazonaws.com;
```

On **preview** deployments, Vercel's feedback toolbar may log CSP warnings in the browser console because the policy doesn't allow its scripts. The site itself works. Turn the toolbar off under **Settings** → **General** → **Vercel Toolbar** if the warnings bother you.

## Troubleshooting

| What you see                                        | What to do                                                                                                                                                                  |
| --------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| The build fails with a Node.js version error        | **Settings** → **Build and Deployment** → **Node.js Version** → choose **22.x** (or newer), then redeploy.                                                                  |
| The build fails in `npm ci`                         | The `package-lock.json` must be committed with `package.json`. If you changed packages, run `npm install` locally and commit both files.                                    |
| I changed a variable but nothing changed            | Variables apply at build time: redeploy (Step 6).                                                                                                                           |
| Link previews or the sitemap show the wrong address | Set `NEXT_PUBLIC_SITE_URL` to your exact address with `https://` and no trailing slash, then redeploy.                                                                      |
| The Book a call tab is missing                      | Check `NEXT_PUBLIC_CAL_LINK` (e.g. `https://cal.com/yourname/30min` or `yourname/30min`), then redeploy.                                                                    |
| The calendar stays blank or shows a plain frame     | Open the browser console (F12). A message about **Content Security Policy** means `vercel.json` was changed; restore `https://app.cal.com` in `script-src` and `frame-src`. |
| The domain shows **Invalid Configuration**          | Compare your DNS records with what Vercel shows, letter by letter; remove old records for the same name; on Cloudflare use **DNS only**. Wait up to a few hours.            |
| The site is in light mode                           | The site starts dark; light only appears when a visitor chooses it with the sun/moon button (saved in the browser). Clear the site's data in your browser to reset.         |
| My changes on GitHub don't show up                  | Check **Deployments** in Vercel: the newest build should match your latest commit. A failed build keeps the previous version online; open it to read the error.             |

## Moving to AWS later

Nothing in the code ties the site to Vercel. When you're ready, follow [deployment.md](deployment.md); the site builds the same static files either way. Remove the domain from Vercel before pointing its DNS at CloudFront, and delete or pause the Vercel project when you no longer need it.
