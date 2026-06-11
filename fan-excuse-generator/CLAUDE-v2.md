# CLAUDE.md — The Banter Toolbox (World Cup 2026)

## What this is
A single-domain suite of viral single-page AI tools for World Cup 2026. Currently two tools sharing one codebase, one design system, one share-card engine:
1. **AI Roasts Your Predictions** (`/roast`) — LIVE. User picks tournament predictions, an AI pundit roasts them, output renders as a shareable card with a Courage Rating.
2. **Fan Excuse Generator** (`/excuse`) — IN BUILD. User picks their team + what happened (lost / drew / humiliated / ref robbery / didn't even qualify) + optional opponent, an AI superfan-lawyer generates an unhinged excuse, output renders as a shareable card with a Denial Level meter.

Zero signup, mobile-first, fast on cheap phones. Tools cross-link to each other on every results screen.

## Stack
- Vite + React (JavaScript), Tailwind CSS, react-router-dom for the two tool routes + homepage
- Vercel hosting; serverless functions in `/api`
- Anthropic Messages API, model `claude-haiku-4-5-20251001`, via server-side routes ONLY
- html2canvas share-card rendering (shared engine)

## Architecture — non-negotiable
- Frontend NEVER calls the Anthropic API directly. Each tool has its own serverless route: `/api/roast.js` (exists) and `/api/excuse.js` (new). API key lives ONLY in `ANTHROPIC_API_KEY` env var. `.env.local` stays gitignored.
- Both API routes follow the same hardening pattern (already implemented in roast.js — replicate it exactly in excuse.js): input validation against known team IDs, free-text capped at 40 chars and HTML-stripped, `max_tokens: 300`, strip-to-outermost-braces before JSON.parse, retry once, canned fallback on second failure, simple per-IP throttle.
- excuse.js returns JSON: `{ "excuse": string, "denialLevel": number }` (denialLevel 0–100 integer).

## Routes & structure
```
/               Homepage hub: toolbox brand, two big tool cards, email capture, footer
/roast          Predictions Roaster (existing, unchanged)
/excuse         Fan Excuse Generator (new)

/src
  /components   shared: ShareCard engine, TeamPicker, Footer, Nav
                roast-specific: PredictionForm, RoastCard
                excuse-specific: ExcuseForm, ExcuseCard
  /data         teams.js (exists, shared), copy.js (all UI text)
  /lib          api.js (add excuse endpoint wrapper), shareCard.js (shared)
/api
  roast.js      exists — do not modify while building the excuse tool
  excuse.js     new — owns the excuse system prompt
```

## Excuse Generator user flow (3 taps max)
1. Pick your team (existing TeamPicker / flag grid)
2. Pick what happened: Lost / Drew with a minnow / Got humiliated / Ref robbery / Didn't even qualify — plus optional opponent picker
3. "Defend my team" button → typing-effect excuse → share card below

## Excuse share card spec
- Same 1080×1350 engine as the roast card. Differences:
- Header: "OFFICIAL EXCUSE — [TEAM NAME]"
- The excuse in large type, styled like a legal notice / certificate (stamp graphic: "CERTIFIED COPE")
- Denial Level rendered as a meter/gauge graphic (0–100)
- Team primary/secondary colors as background, watermark URL bottom-right, non-removable

## Tool cross-linking (required on both results screens)
- Roast results screen: "Team already breaking your heart? Get your official excuse →" (/excuse)
- Excuse results screen: "Brave enough to predict the rest? Get roasted →" (/roast)

## Page furniture (both tools, below the card)
- Regenerate button, VPN affiliate one-liner (env `VITE_VPN_AFFILIATE_URL`, hidden if unset), email capture slot, Ko-fi link, "Not affiliated with FIFA" footer disclaimer

## Brand/legal guardrails — never violate
- No FIFA logos, marks, mascots, official fonts, or the word "FIFA" anywhere in UI, metadata, or generated images. Team identity = name + flag emoji + colors only, never crests.
- AI outputs mock situations, federations, tactics, grass, cosmic forces — never nationalities, never players as human beings, no injuries/tragedies/medical/legal/doping references, no profanity, no betting language. The full forbidden list lives inside each system prompt.
- The excuse system prompt and its few-shot examples are hand-tuned (see excuse-system-prompt.md). Paste verbatim. Never paraphrase, shorten, or "improve" prompt text without explicit instruction.

## Design direction
- Same terrace-banter design system as the roaster: dark background, electric accents, big condensed display type, mobile-first.
- The excuse tool gets a visual twist within the system: mock-official / legal-document energy (certificate borders, stamps, serif accents on the card) — the joke is bureaucratic seriousness applied to cope.
- Homepage hub is simple: brand mark, one-line promise, two tool cards with sample outputs, email capture. No bloat.

## Commands
- `vercel dev` — local dev with API routes
- `npm run build` — production build
- `vercel --prod` — deploy

## Working agreements
- Ship fast; deadline beats polish. Reuse existing components before writing new ones.
- Do not modify /api/roast.js or roast components while building the excuse tool.
- Ask before adding dependencies beyond: react, react-router-dom, tailwindcss, html2canvas, @anthropic-ai/sdk (server-side only).
- All user-facing text lives in /src/data/copy.js.
- After each feature: run vercel dev, confirm both tools still render, then proceed.
