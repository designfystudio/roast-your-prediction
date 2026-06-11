# CLAUDE.md — AI Roasts Your Predictions

## What this is
A viral single-page web tool for World Cup 2026. User picks their tournament predictions (champion, runner-up, top scorer, dark horse, first big team eliminated), an AI pundit roasts their picks with affection, and the result renders as a downloadable/shareable image card. Zero signup, mobile-first, must load fast on cheap phones. Launch deadline: 3 days from project start.

## Stack
- Vite + React (JavaScript, no TypeScript — speed over ceremony for this project)
- Tailwind CSS for styling
- Vercel for hosting; Vercel serverless functions in `/api` for the backend
- Anthropic Messages API, model `claude-haiku-4-5-20251001` (cheap + fast; jokes don't need a bigger model)
- html2canvas-pro for share-card image rendering (maintained fork of html2canvas; vanilla crashes on Tailwind v4's oklch() colors)

## Architecture — non-negotiable
- The frontend NEVER calls the Anthropic API directly. All AI calls go through `/api/roast.js` (Vercel serverless function). The API key lives ONLY in the `ANTHROPIC_API_KEY` environment variable on Vercel / in `.env.local` locally.
- `.env.local` is in `.gitignore`. Never commit keys. Never log the key.
- `/api/roast.js` validates input (team IDs must be from the known 48-team list, free-text fields max 40 chars, strip HTML), sets `max_tokens: 300`, and returns JSON `{ roast: string, courageRating: number }`.
- Basic abuse protection in the API route: reject requests missing required fields; simple per-IP throttle (in-memory Map with timestamps is acceptable for v1; note its limits on serverless cold starts in a comment).

## Project structure
```
/src
  /components   TeamPicker, PredictionForm, RoastCard, ShareCard, Footer
  /data         teams.js (48 teams: id, name, flag emoji, primary/secondary hex colors)
  /lib          api.js (frontend fetch wrapper), shareCard.js (html2canvas logic)
  App.jsx       single-page flow: form → loading → result
/api
  roast.js      serverless function, owns the system prompt
```

## User flow (keep it to 3 steps)
1. Pick champion + runner-up from a flag grid
2. Pick top scorer (free text, 40 chars), dark horse (flag grid), first big team out (flag grid)
3. "Roast me" button → typing-effect roast text → share card below with Courage Rating

## The roast prompt (lives in /api/roast.js — this is the product)
Persona: a smug, world-weary football pundit who has seen every tournament since 1970, roasting with affection, never cruelty.
Hard rules enforced IN the system prompt:
- Output strict JSON: `{ "roast": "...", "courageRating": N }` — nothing else
- Roast is 2–3 sentences MAX (share cards die over ~50 words)
- courageRating: 0–10, one decimal. Safe picks (Brazil/France to win) score LOW with mockery for cowardice; chaotic picks score HIGH with mockery for delusion
- Mock the PICKS, the safety, the delusion, the bandwagon — never nationalities, never players as people, no injuries/tragedies, no profanity, no betting language
- Include 6–8 few-shot examples in the system prompt covering: ultra-safe slate, hipster slate, homer slate (picks own country for everything), chaos slate. These examples define the voice — they get hand-tuned, do not rewrite them without being asked.

## Share card spec
- 1080×1350 px (4:5) rendered off-screen, exported via html2canvas
- Layout: "MY WORLD CUP 2026 PREDICTIONS" header → user's picks as flag chips → roast text in large type → Courage Rating as a big stamped score → site URL watermark bottom-right (always present, non-removable)
- Background uses the champion pick's team colors from teams.js
- Buttons: Download PNG + native share via `navigator.share` when available (mobile), clipboard fallback on desktop

## Page furniture (below the card)
- "Roast me again" button (re-rolls with same picks)
- Cross-link slot to the Fan Excuse Generator (placeholder href for now)
- One-line VPN affiliate placement: "Watching from abroad? →" (href from `VITE_VPN_AFFILIATE_URL` env var, hidden if unset)
- Email capture embed slot (provider TBD; render a styled placeholder component)
- Footer: Ko-fi link placeholder + "Not affiliated with FIFA" disclaimer

## Brand/legal guardrails — never violate
- No FIFA logos, marks, mascots, official fonts, or the word "FIFA" anywhere in UI, code comments shipped to client, metadata, or generated images. Say "World Cup 2026" sparingly in body text; prefer "the tournament."
- Flag emojis are fine. Real crests/badges are NOT — team identity = name + flag + colors only.
- Nothing betting-related: no odds, no "locks," no gambling vocabulary anywhere including the roast prompt.

## Design direction
- Mobile-first (most traffic = WhatsApp/Instagram referrals on phones)
- Bold, loud, terrace-banter energy: dark background, electric accent colors, big condensed display type for headlines. NOT corporate, NOT minimal-startup-clean.
- The share card must look good as a thumbnail in a WhatsApp chat — test at small sizes.

## Commands
- `npm run dev` — local dev (use `vercel dev` when testing /api routes)
- `npm run build` — production build
- `vercel --prod` — deploy

## Working agreements
- Ship v1 ugly-but-funny over pretty-but-late. Deadline beats polish.
- Ask before adding any dependency beyond: react, tailwindcss, html2canvas-pro, @anthropic-ai/sdk (server-side only).
- After completing each feature, run the dev server and confirm it renders before moving on.
- Keep all copy in a single `/src/data/copy.js` so non-code text edits are trivial.
