# Deploying the web app

Step-by-step from a fresh GitHub clone to a live production URL.

## Prerequisites

- Supabase account (free tier works for launch)
- Stripe account (test mode for staging, live for prod)
- Anthropic console account with API key
- Vercel account linked to your GitHub
- (Optional) Google Cloud or GitHub OAuth app for social sign-in

## 1. Supabase setup (10 min)

1. Create a new Supabase project at [supabase.com](https://supabase.com).
2. From `Project Settings → API`, copy:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_ROLE_KEY` (server-only, never expose)
3. Apply migrations:
   ```bash
   cd web
   npx supabase login
   npx supabase link --project-ref YOUR_PROJECT_REF
   npx supabase db push
   ```
4. Enable auth providers (`Authentication → Providers`):
   - Email (magic link) — enabled by default
   - Google — paste your Google OAuth client ID + secret
   - GitHub — paste your GitHub OAuth app client ID + secret
5. Set the Site URL + Redirect URLs (`Authentication → URL Configuration`):
   - Site URL: `https://your-app.vercel.app`
   - Redirect URLs: `https://your-app.vercel.app/auth/callback`, `http://localhost:3000/auth/callback`

## 2. Stripe setup (10 min)

1. Create products + prices in `https://dashboard.stripe.com/products`:
   - **Pro** — $15/mo recurring → copy the `price_...` id → `STRIPE_PRICE_ID_PRO`
   - **Power** — $39/mo recurring (optional, only if launching with Power) → `STRIPE_PRICE_ID_POWER`
2. Get API keys from `Developers → API keys`:
   - `Secret key` → `STRIPE_SECRET_KEY` (server-only)
   - `Publishable key` → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
3. Webhook endpoint (after Vercel deploy):
   - `Developers → Webhooks → Add endpoint`
   - URL: `https://your-app.vercel.app/api/stripe/webhook`
   - Events: `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`
   - Copy the signing secret → `STRIPE_WEBHOOK_SECRET`

## 3. Anthropic API key

1. Go to [console.anthropic.com](https://console.anthropic.com) → API Keys → Create Key.
2. Copy → `ANTHROPIC_API_KEY`.
3. Add billing — set a monthly cap. Recommended start: **$50/mo** while you're validating sign-up volume.

## 4. Deploy to Vercel (5 min)

1. In Vercel dashboard, import the GitHub repo `credit-card-hacking-toolkit`.
2. **Important:** set **Root Directory** to `web` (Project Settings → General → Root Directory).
3. Framework Preset: Next.js (auto-detected).
4. Add all env vars from `.env.example` to Vercel (`Project Settings → Environment Variables`):
   - All `NEXT_PUBLIC_*` vars
   - All server-only vars (`SUPABASE_SERVICE_ROLE_KEY`, `ANTHROPIC_API_KEY`, `STRIPE_*`)
   - Set `NEXT_PUBLIC_APP_URL` to your Vercel deployment URL (e.g. `https://credit-card-hacker.vercel.app`)
5. Deploy. First build will take ~2 min.

## 5. Post-deploy

1. Go back to Stripe webhooks and update the endpoint URL to your live Vercel URL.
2. Test the flow:
   - Sign up via the live URL
   - Run through `/onboarding`
   - Send a chat message — should stream back from Claude
   - Click `Upgrade` → Stripe Checkout (use test card `4242 4242 4242 4242` if in test mode)
   - Verify webhook fired in Stripe dashboard, check `subscriptions` table in Supabase
3. Monitor Anthropic spend in console.anthropic.com daily for the first week.

## 6. Custom domain (optional)

1. In Vercel: Project Settings → Domains → Add `creditcardhacker.com` (or whatever).
2. Update DNS records as Vercel instructs.
3. Update Supabase redirect URLs + Stripe webhook URL + `NEXT_PUBLIC_APP_URL` env var.

## Cost expectations at launch

| Service | Free tier | When you'll outgrow |
|---|---|---|
| Vercel | Hobby tier free | If you exceed 100GB bandwidth/mo |
| Supabase | Free tier (500MB DB, 1GB storage, 50K MAU) | At ~5K active users |
| Anthropic | Pay-per-token | ~$5/mo per active free user (cap your spend!) |
| Stripe | 2.9% + $0.30 per transaction | n/a, scales with revenue |

**Realistic month-1 budget: $100–300** assuming 50–200 sign-ups, mostly Anthropic API spend.
