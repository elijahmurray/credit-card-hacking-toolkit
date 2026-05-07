# Credit Card Hacker — Web App

Next.js 15 SaaS frontend for the credit-card-hacker AI assistant. Wraps the Claude Code plugin's skills + data into a chat-based web app with auth, payments, and tier-based rate limiting.

Sister to `../` (the Claude Code plugin). Both ship from the same monorepo.

## Stack

- **Next.js 15** (App Router, Turbopack, React 19)
- **Supabase** — auth + Postgres + RLS
- **Vercel AI SDK** with `@ai-sdk/anthropic` provider
- **Stripe** — subscriptions + webhooks
- **Tailwind CSS** — styling
- **TypeScript** — strict mode

## Local development

```bash
# 1. Install deps
npm install

# 2. Copy env
cp .env.example .env.local
# Edit .env.local with your Supabase, Anthropic, Stripe keys

# 3. Set up Supabase (one-time)
npx supabase init
npx supabase start                           # local Postgres + auth
npx supabase db push                         # apply migrations
npm run db:types                             # generate TS types

# 4. Run
npm run dev                                  # localhost:3000

# 5. Stripe webhook (separate terminal)
npm run stripe:listen                        # forwards Stripe events to local
```

## Deploy to Vercel

```bash
# Push monorepo to GitHub (already done)
# Then in Vercel dashboard:
# 1. Import the repo
# 2. Set root directory to `web/`
# 3. Add all env vars from .env.example as Vercel env vars
# 4. Deploy
# 5. Configure Stripe webhook endpoint:
#    https://your-app.vercel.app/api/stripe/webhook
#    using the STRIPE_WEBHOOK_SECRET from Vercel env
```

## Architecture

```
web/
├── app/
│   ├── (auth)/              # signup, login, password reset
│   ├── (marketing)/         # landing, pricing
│   ├── (dashboard)/         # chat, profile, settings (auth-required)
│   ├── api/
│   │   ├── chat/            # POST → streamed assistant response
│   │   ├── stripe/
│   │   │   ├── checkout/    # POST → Stripe Checkout session
│   │   │   ├── portal/      # POST → Customer Portal session
│   │   │   └── webhook/     # Stripe → us (subscription events)
│   │   └── usage/           # GET → current user's daily/monthly usage
│   ├── layout.tsx
│   └── page.tsx
├── lib/
│   ├── ai/                  # Claude prompt loader + AI SDK config
│   ├── billing/             # Stripe helpers + tier resolution
│   ├── pricing.ts           # Tier config (single source of truth)
│   ├── rate-limit/          # Daily quota enforcement
│   ├── supabase/            # client/server/middleware/service clients
│   ├── types.ts             # Cross-cutting types
│   └── utils.ts             # cn, small helpers
├── supabase/migrations/     # SQL migrations
└── middleware.ts            # session refresh on every request
```

## Pricing

| Tier | Price | Quota | Model |
|---|---|---|---|
| Free | $0 | 10 Sonnet msgs/day → unlimited Haiku | Sonnet 4.6 / Haiku 4.5 |
| Pro | $15/mo | Effectively unlimited | Sonnet 4.6 |

Power tier ($39/mo, Opus on-demand) is configured in `lib/pricing.ts` but not yet shown on the pricing page. Enable when Pro user signal supports it.

Pricing logic + research notes: see `lib/pricing.ts`.

## How the chat agent works

On every chat request:
1. **Load system prompt** = compiled from `../CLAUDE.md` + selected `../plugins/credit-card-hacker/skills/*/SKILL.md` based on user's question
2. **Load user profile** from `profiles.data` (jsonb) — gives the agent the same `./profile.json` content the plugin uses
3. **Cache** the system prompt via Anthropic prompt caching (`cache_control: ephemeral`) so repeat queries cost ~$0.0015 instead of ~$0.015
4. **Stream** response via Vercel AI SDK back to the client

The system prompt is the source of truth in `../CLAUDE.md`. Updates to the plugin propagate to the web app on the next deploy (or on dev refresh).
