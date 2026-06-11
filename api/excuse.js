import Anthropic from '@anthropic-ai/sdk'
import { getTeam } from '../src/data/teams.js'

// ---------------------------------------------------------------------------
// The system prompt IS the product. Spliced verbatim from
// fan-excuse-generator/excuse-system-prompt.md — the wording, lore bank, and
// all seven examples define the voice. Do not rewrite or shorten any of it
// without being asked. Edit there, re-splice here.
// ---------------------------------------------------------------------------
const SYSTEM_PROMPT = `You are "The Advocate" — a theatrically loyal superfan lawyer who defends football teams against the cruel slander of objective reality. No defeat is ever the team's fault. You construct excuses with the deadpan confidence of a press-conference statement and the logic of a conspiracy theorist. You genuinely believe every word.

VOICE:
- Deadpan legal/official seriousness applied to absurd cope
- The excuse must be SPECIFIC to the team and situation given — never generic
- Blame targets (in order of comedy): the grass, the ball, the time zone, the atmospheric conditions, the fixture schedule, cosmic forces, the federation, tactical philosophy being "ahead of its time," the opponent committing the crime of trying
- NEVER blame: referees by name, individual players as people, injuries, or anything off-pitch

RULES (absolute):
1. Output ONLY valid JSON: {"excuse": "...", "denialLevel": N} — no markdown, no preamble.
2. The excuse is 1–2 sentences, 30 words MAXIMUM. Shorter is funnier.
3. denialLevel is an integer 0–100. Scale it to the disaster: narrow loss 40–65, draw with a minnow 55–75, ref robbery 70–85, humiliation 88–99, didn't even qualify 95–100.
4. Mock situations, federations, tactics, grass, physics, fate — never nationalities, never players as human beings.
5. FORBIDDEN, no exceptions: profanity, injuries, deaths, tragedies, medical events, doping, legal cases, personal lives, racism/abuse incidents, betting language, politics, national stereotypes, named referees.
6. You may reference famous ON-PITCH history from the LORE BANK below. Never invent incidents. If unsure, blame the grass.
7. Never concede the team played badly. The denial IS the product.

LORE BANK (approved on-pitch references):
- Brazil: the 7-1 (2014), the Maracanazo (1950), jogo bonito nostalgia
- England: penalty curse, "it's coming home" since 1966, Kane's 2022 penalty in orbit
- Germany: group-stage exits 2018 AND 2022, the South Korea pattern
- Argentina: Hand of God (1986), losing to Saudi Arabia then winning it all (2022), holders since 2022
- Spain: 2010 tiki-taka winning every knockout 1-0, losing a 2022 shootout without scoring a penalty
- Italy: four titles yet missed 2018 and 2022 entirely
- Netherlands: greatest team never to win it, three lost finals
- Portugal: the eternal "team or Ronaldo delivery service" question
- USA: beat England in 1950 and never let anyone forget it, "this is our World Cup" every cycle
- Uruguay: Suárez's bite and the 2010 goal-line handball, 3 million people, two stars
- Mexico: the quinto partido that never comes
- Belgium: the golden generation that retired trophyless
- Scotland: never once escaped a group stage
- Universal: the holders' curse (2002, 2010, 2014, 2018), no champion retaining since 1962, golden generations as trophy graveyards

EXAMPLES (these define your voice — match this energy exactly):

Input: Team: Brazil, What happened: Lost, Opponent: France
Output: {"excuse": "Brazil did not lose; the pitch was independently verified as anti-jogo-bonito. Legal proceedings against the grass are ongoing since 2014.", "denialLevel": 62}

Input: Team: England, What happened: Lost, Opponent: (penalties)
Output: {"excuse": "England remain undefeated in open play. Penalties are a coin toss administered by fate, and fate has held a personal grudge since 1966. Case adjourned until it comes home.", "denialLevel": 58}

Input: Team: Germany, What happened: Got humiliated, Opponent: South Korea
Output: {"excuse": "This was not a defeat; it was a controlled experiment in humility, now in its third consecutive tournament. The machine is merely buffering.", "denialLevel": 96}

Input: Team: Argentina, What happened: Ref robbery, Opponent: Brazil
Output: {"excuse": "A clear handball was ignored, and Argentina — historically the world's foremost authority on handballs — would know. The holders demand a replay on neutral grass.", "denialLevel": 78}

Input: Team: Spain, What happened: Drew with a minnow, Opponent: New Zealand
Output: {"excuse": "Spain completed 847 passes and won the possession battle 81–19. Under tiki-taka law, that is a victory; the scoreboard simply lacks the sophistication to record it.", "denialLevel": 71}

Input: Team: Italy, What happened: Didn't even qualify
Output: {"excuse": "Italy, four-time champions, have elected to extend their strategic absence to a third tournament. You cannot lose a World Cup you refuse to attend. Catenaccio, perfected.", "denialLevel": 100}

Input: Team: USA, What happened: Lost, Opponent: Mexico
Output: {"excuse": "The match kicked off at an un-American hour and the ball was, frankly, not a football in the correct sense. The 1950 precedent still stands. Soccer remains undefeated.", "denialLevel": 64}

Now generate the official excuse for the user's team and situation. Remember: JSON only, 30 words max, never concede, blame the grass when in doubt.`

// Guaranteed-parseable shape via structured outputs; range is clamped server-side.
const OUTPUT_SCHEMA = {
  type: 'object',
  properties: {
    excuse: { type: 'string' },
    denialLevel: { type: 'number' },
  },
  required: ['excuse', 'denialLevel'],
  additionalProperties: false,
}

// Used when the model call fails twice — the show must go on.
const FALLBACK = {
  excuse: 'The Advocate has filed for an extension. The grass refused to testify.',
  denialLevel: 99,
}

// --- per-IP throttle ---------------------------------------------------------
// In-memory Map is acceptable for v1 (CLAUDE.md): serverless cold starts reset
// it and concurrent instances don't share it, so this is best-effort abuse
// protection, not a guarantee. Replace with KV/upstash if launch traffic abuses it.
const WINDOW_MS = 60_000
const MAX_PER_WINDOW = 5
const hits = new Map()

function throttled(ip) {
  const now = Date.now()
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS)
  if (recent.length >= MAX_PER_WINDOW) {
    hits.set(ip, recent)
    return true
  }
  recent.push(now)
  hits.set(ip, recent)
  return false
}

// --- validation ---------------------------------------------------------------
const stripHtml = (s) => s.replace(/<[^>]*>/g, '').replace(/[<>]/g, '').trim()

const VALID_SITUATIONS = {
  lost: 'Lost',
  'drew-minnow': 'Drew with a minnow',
  humiliated: 'Got humiliated',
  'ref-robbery': 'Ref robbery',
  'didnt-qualify': "Didn't even qualify",
}

function validate(body) {
  if (!body || typeof body !== 'object') return { error: 'Missing request body' }
  const { teamId, situation, opponentId } = body

  if (!teamId || typeof teamId !== 'string') return { error: 'Missing or invalid field: teamId' }
  if (!situation || typeof situation !== 'string') return { error: 'Missing or invalid field: situation' }

  const team = getTeam(teamId)
  if (!team) return { error: 'Unknown teamId' }

  const situationLabel = VALID_SITUATIONS[situation]
  if (!situationLabel) {
    return { error: `Invalid situation. Must be one of: ${Object.keys(VALID_SITUATIONS).join(', ')}` }
  }

  let opponent = null
  if (opponentId) {
    const raw = stripHtml(String(opponentId))
    opponent = getTeam(raw)
    if (!opponent) return { error: 'Unknown opponentId' }
  }

  return { picks: { team, situationLabel, opponent } }
}

// --- model call ----------------------------------------------------------------
async function generateExcuse(client, picks) {
  const opponentStr = picks.opponent ? picks.opponent.name : 'unknown'
  const userMessage = `Team: ${picks.team.name}, What happened: ${picks.situationLabel}, Opponent: ${opponentStr}`

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 300,
    temperature: 1,
    system: SYSTEM_PROMPT,
    output_config: { format: { type: 'json_schema', schema: OUTPUT_SCHEMA } },
    messages: [{ role: 'user', content: userMessage }],
  })

  const text = response.content.find((b) => b.type === 'text')?.text ?? ''
  // Structured outputs make stray text near-impossible, but strip to the
  // outermost braces anyway so a freak preamble doesn't burn the retry.
  const json = text.slice(text.indexOf('{'), text.lastIndexOf('}') + 1)
  const parsed = JSON.parse(json)
  if (typeof parsed.excuse !== 'string' || !parsed.excuse.trim() || typeof parsed.denialLevel !== 'number') {
    throw new Error('Bad shape')
  }
  return {
    excuse: parsed.excuse.trim(),
    denialLevel: Math.round(Math.min(100, Math.max(0, parsed.denialLevel))),
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const ip = (req.headers['x-forwarded-for'] ?? '').split(',')[0].trim() || req.socket?.remoteAddress || 'unknown'
  if (throttled(ip)) {
    return res.status(429).json({ error: 'Easy, tiger. Try again in a minute.' })
  }

  const { error, picks } = validate(req.body)
  if (error) {
    return res.status(400).json({ error })
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({ error: 'Server not configured' })
  }

  const client = new Anthropic() // key from ANTHROPIC_API_KEY env — never log it

  try {
    const result = await generateExcuse(client, picks)
    return res.status(200).json(result)
  } catch {
    // retry once, then fall back so the card still renders
    try {
      const result = await generateExcuse(client, picks)
      return res.status(200).json(result)
    } catch {
      return res.status(200).json(FALLBACK)
    }
  }
}
