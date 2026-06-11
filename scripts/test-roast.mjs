// Harness for /api/roast.js — invokes the handler directly with mock req/res.
// Run: node --env-file=.env.local scripts/test-roast.mjs
import handler from '../api/roast.js'

function mockReq({ method = 'POST', body, ip = '203.0.113.1' } = {}) {
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

const validPicks = {
  championId: 'brazil',
  runnerUpId: 'argentina',
  topScorer: 'Haaland',
  darkHorseId: 'japan',
  firstBigOutId: 'england',
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

// 1. method gate
let r = await call({ method: 'GET', ip: '10.0.0.1' })
check('GET returns 405', r.statusCode === 405)

// 2. missing fields
r = await call({ body: { championId: 'brazil' }, ip: '10.0.0.2' })
check('missing fields return 400', r.statusCode === 400, JSON.stringify(r.body))

// 3. unknown team id
r = await call({ body: { ...validPicks, championId: 'atlantis' }, ip: '10.0.0.3' })
check('unknown championId returns 400', r.statusCode === 400)

// 4. firstBigOut must be a big team
r = await call({ body: { ...validPicks, firstBigOutId: 'qatar' }, ip: '10.0.0.4' })
check('non-big firstBigOutId returns 400', r.statusCode === 400)

// 5. champion ≠ runner-up
r = await call({ body: { ...validPicks, runnerUpId: 'brazil' }, ip: '10.0.0.5' })
check('champion == runner-up returns 400', r.statusCode === 400)

// 6. topScorer length cap
r = await call({ body: { ...validPicks, topScorer: 'x'.repeat(41) }, ip: '10.0.0.6' })
check('41-char topScorer returns 400', r.statusCode === 400)

// 7. HTML strips to empty -> 400
r = await call({ body: { ...validPicks, topScorer: '<b></b>' }, ip: '10.0.0.7' })
check('HTML-only topScorer returns 400', r.statusCode === 400)

// 8. throttle: 6 rapid requests from one IP (invalid bodies, so no API calls burned)
const throttleIp = '10.0.0.99'
let last
for (let i = 0; i < 6; i++) {
  last = await call({ body: {}, ip: throttleIp })
}
check('6th rapid request returns 429', last.statusCode === 429, `got ${last.statusCode}`)

// 9. live call (only if a real key is present)
const key = process.env.ANTHROPIC_API_KEY
if (key && key.trim()) {
  console.log('\nLive API test (claude-haiku-4-5)...')
  r = await call({ body: { ...validPicks, topScorer: '<b>Haaland</b>' }, ip: '10.0.1.1' })
  check('live request returns 200', r.statusCode === 200, JSON.stringify(r.body))
  check('roast is a non-empty string', typeof r.body?.roast === 'string' && r.body.roast.length > 0)
  check(
    'courageRating is 0-10 number',
    typeof r.body?.courageRating === 'number' && r.body.courageRating >= 0 && r.body.courageRating <= 10,
  )
  console.log('\n--- roast ---')
  console.log(JSON.stringify(r.body, null, 2))
} else {
  console.log('\n(live API test SKIPPED — no ANTHROPIC_API_KEY in .env.local)')
}

console.log(`\n${pass} passed, ${fail} failed`)
process.exit(fail ? 1 : 0)
