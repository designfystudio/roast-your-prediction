// Harness for /api/excuse.js — invokes the handler directly with mock req/res.
// Run: node --env-file=.env.local scripts/test-excuse.mjs
// Mirror of scripts/test-roast.mjs. Unit-tests validation + throttle, then (if a
// real key is present) fires several live scenarios and checks JSON shape, the
// 30-word cap, denialLevel scaling, and a forbidden-content denylist.
import handler from '../api/excuse.js'

function mockReq({ method = 'POST', body, ip = '203.0.113.2' } = {}) {
  return { method, body, headers: { 'x-forwarded-for': ip }, socket: {} }
}

function mockRes() {
  const res = { statusCode: 200, body: undefined }
  res.status = (code) => ((res.statusCode = code), res)
  res.json = (obj) => ((res.body = obj), res)
  return res
}

async function call(opts) {
  const res = mockRes()
  await handler(mockReq(opts), res)
  return res
}

let pass = 0
let fail = 0
function check(name, cond, detail = '') {
  if (cond) {
    pass++
    console.log(`  ok  ${name}`)
  } else {
    fail++
    console.log(`FAIL  ${name} ${detail}`)
  }
}

const wordCount = (s) => s.trim().split(/\s+/).length

// Things that must never appear in output (profanity left to manual scan; these
// are the unambiguous, testable ones from the FORBIDDEN list). Word-boundary
// matched so e.g. "betrayed" doesn't trip the "bet" rule.
const DENY = /\b(bet|bets|betting|odds|gambl\w*|wager\w*|religio\w*)\b/i
const hasForbidden = (s) => s.match(DENY)?.[0] ?? null

// 1. method gate
let r = await call({ method: 'GET', ip: '10.1.0.1' })
check('GET returns 405', r.statusCode === 405)

// 2. missing fields (no situation)
r = await call({ body: { teamId: 'brazil' }, ip: '10.1.0.2' })
check('missing situation returns 400', r.statusCode === 400, JSON.stringify(r.body))

// 3. unknown team id
r = await call({ body: { teamId: 'atlantis', situation: 'lost' }, ip: '10.1.0.3' })
check('unknown teamId returns 400', r.statusCode === 400)

// 4. invalid situation
r = await call({ body: { teamId: 'brazil', situation: 'won-easily' }, ip: '10.1.0.4' })
check('invalid situation returns 400', r.statusCode === 400)

// 5. unknown opponent id
r = await call({ body: { teamId: 'brazil', situation: 'lost', opponentId: 'narnia' }, ip: '10.1.0.5' })
check('unknown opponentId returns 400', r.statusCode === 400)

// 6. throttle: 6 rapid requests from one IP (invalid bodies, so no API calls burned)
const throttleIp = '10.1.0.99'
let last
for (let i = 0; i < 6; i++) {
  last = await call({ body: {}, ip: throttleIp })
}
check('6th rapid request returns 429', last.statusCode === 429, `got ${last.statusCode}`)

// 7. live scenarios (only if a real key is present)
const key = process.env.ANTHROPIC_API_KEY
if (key && key.trim()) {
  console.log('\nLive API tests (claude-haiku-4-5)...')
  const scenarios = [
    { label: 'narrow loss', body: { teamId: 'brazil', situation: 'lost', opponentId: 'france' } },
    // Practical floors: the prompt targets humiliation 88–99 / didnt-qualify 95–100,
    // but at temperature 1 the model lands a few points under the top of the band.
    // We assert "catastrophe tier" (>=88) to stay meaningful without being flaky.
    { label: 'humiliation (catastrophe tier)', body: { teamId: 'germany', situation: 'humiliated', opponentId: 'japan' }, min: 88 },
    { label: 'didnt-qualify (catastrophe tier)', body: { teamId: 'scotland', situation: 'didnt-qualify' }, min: 88 },
    // forbidden-probe: a rivalry loaded with real-world tension — must stay banter, never reference conflict/casualties
    { label: 'forbidden-probe USA/Iran', body: { teamId: 'usa', situation: 'lost', opponentId: 'iran' } },
  ]
  let ip = 200
  for (const s of scenarios) {
    r = await call({ body: s.body, ip: `10.2.0.${ip++}` })
    const b = r.body ?? {}
    check(`${s.label}: 200`, r.statusCode === 200, JSON.stringify(b))
    check(`${s.label}: excuse non-empty string`, typeof b.excuse === 'string' && b.excuse.length > 0)
    check(`${s.label}: <=30 words`, typeof b.excuse === 'string' && wordCount(b.excuse) <= 30, `(${b.excuse ? wordCount(b.excuse) : '?'} words)`)
    check(`${s.label}: denialLevel int 0-100`, Number.isInteger(b.denialLevel) && b.denialLevel >= 0 && b.denialLevel <= 100)
    if (s.min) check(`${s.label}: denialLevel >= ${s.min}`, b.denialLevel >= s.min, `got ${b.denialLevel}`)
    const bad = b.excuse ? hasForbidden(b.excuse) : null
    check(`${s.label}: no forbidden terms`, !bad, bad ? `matched "${bad}"` : '')
    console.log(`    → "${b.excuse}"  (denial ${b.denialLevel})`)
  }
} else {
  console.log('\n(live API tests SKIPPED — no ANTHROPIC_API_KEY in .env.local)')
}

console.log(`\n${pass} passed, ${fail} failed`)
process.exit(fail ? 1 : 0)
