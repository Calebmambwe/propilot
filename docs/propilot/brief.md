# ProPilot — AI Proposal Intelligence for Service Businesses

## Feature Name
ProPilot

## One-Line Pitch
Win more deals by knowing what works — AI-powered proposal analytics and closed-loop learning for consultants and agencies.

## Problem Statement
Independent consultants, freelancers, and small agencies (1-15 people) send 10-50 proposals per month with a 30-40% win rate. They have zero data on WHY proposals win or lose — which sections resonate, which pricing structures convert, which language performs. Enterprise tools (Gong at $100+/seat, Seismic at $60+/seat) solve this for large sales teams but are inaccessible to SMBs. Current affordable tools (Proposify, PandaDoc, Better Proposals) are template editors with no intelligence layer.

## Target User
- **Primary**: Solo consultants and freelancers sending 5+ proposals/month ($50K-$500K annual revenue)
- **Secondary**: Small agency owners (2-15 people) managing proposal pipelines
- **Verticals**: Digital marketing, software development, accounting, architecture/design, recruiting

## Proposed Solution

### Core Features (MVP)
1. **AI Proposal Generator** — Create proposals from meeting notes + template. LLM fills sections, maintains brand voice.
2. **Smart Tracking** — Pixel tracking for open rates, section read time, link clicks within sent proposals.
3. **Outcome Capture** — Mark proposals won/lost with optional client feedback. Integrates with Stripe for automatic win detection.
4. **Win/Loss Intelligence** — Weekly digest showing which proposal sections, pricing formats, case studies, and CTAs correlate with closed deals.
5. **Next Proposal Coach** — Before sending, AI suggests specific edits based on historical win data for that deal size/industry.

### Viral Mechanic
"Powered by ProPilot" footer on every sent proposal (removable at Team tier). Every prospect who receives a proposal is a potential user. Identical to Calendly's viral scheduling loop.

### Differentiator
Not a template editor. Not a document tool. ProPilot is the **intelligence layer** — it learns from your outcomes and tells you what to change. No competitor under $500/month offers closed-loop proposal analytics.

## Pricing Model
- **Solo**: $49/month (1 user, unlimited proposals, basic analytics)
- **Team**: $99/month (up to 5 users, full analytics, AI coaching, white-label)
- **Agency**: $199/month (up to 15 users, CRM sync, custom branding)

## Revenue Target
$10K MRR within 90 days (102 customers at $99 avg)

## Tech Stack (Proposed)
- **Frontend**: Next.js 15 + React 19 + Tailwind CSS + shadcn/ui
- **Backend**: Next.js API Routes + tRPC
- **Database**: PostgreSQL via Supabase
- **Auth**: Supabase Auth (Google, email/password)
- **AI**: Claude API for proposal generation and coaching
- **Tracking**: Custom pixel tracking (1x1 transparent gif + event API)
- **Payments**: Stripe Subscriptions
- **Email**: Resend for proposal delivery
- **Hosting**: Vercel

## Competition
| Competitor | Price | Intelligence Layer |
|---|---|---|
| Proposify | $65-$100+/mo | None |
| PandaDoc | $35-$65/seat/mo | Basic open tracking only |
| Better Proposals | $19-$49/mo | None |
| Gong | $100+/seat/mo | Full, but enterprise-only |
| Qwilr | $35+/mo | Basic analytics |

## Success Metrics
- Proposal win rate improvement: target +15% within 3 months of use
- Weekly active proposal senders (leading indicator)
- Viral conversion rate from powered-by footer: target 2-5%
- Time-to-first-proposal: target < 10 minutes

## Out of Scope (V1)
- CRM integrations (Salesforce, HubSpot) — V2
- E-signatures — V2
- Multi-language support — V2
- Mobile app — V2
- Custom domain for proposal links — V2
