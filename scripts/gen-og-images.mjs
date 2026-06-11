// Generates three static OG images (1200×630) for / , /roast, /excuse.
// Uses headless Chrome CDP — same approach as e2e-regression.mjs, no new deps.
// Anton font is base64-embedded so the script is self-contained (no server needed).
// Run: node scripts/gen-og-images.mjs   (from project root)
// Output: public/og/home.png, public/og/roast.png, public/og/excuse.png

import { spawn } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const PORT = 9230
const TMP = path.resolve('tmp')
const PROFILE = path.join(TMP, 'chrome-og-profile')
const OUT_DIR = path.resolve('public/og')

fs.mkdirSync(OUT_DIR, { recursive: true })
fs.mkdirSync(PROFILE, { recursive: true })

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// ── CDP client ────────────────────────────────────────────────────────────────
let ws
let msgId = 0
const pending = new Map()

function send(method, params = {}, sessionId) {
  const id = ++msgId
  ws.send(JSON.stringify({ id, method, params, sessionId }))
  return new Promise((resolve, reject) => pending.set(id, { resolve, reject }))
}

async function connect() {
  for (let i = 0; i < 60; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/version`)
      const { webSocketDebuggerUrl } = await res.json()
      ws = new WebSocket(webSocketDebuggerUrl)
      await new Promise((resolve, reject) => {
        ws.onopen = resolve
        ws.onerror = reject
      })
      ws.onmessage = (ev) => {
        const msg = JSON.parse(ev.data)
        if (msg.id && pending.has(msg.id)) {
          const { resolve, reject } = pending.get(msg.id)
          pending.delete(msg.id)
          msg.error ? reject(new Error(`${msg.error.message}`)) : resolve(msg.result)
        }
      }
      return
    } catch {
      await sleep(200)
    }
  }
  throw new Error('Chrome did not open debugging port')
}

// ── Font embedding ─────────────────────────────────────────────────────────
// Reads the already-present Anton woff2 from /public/fonts and embeds as data URI
// so the HTML templates are fully self-contained (no server or network needed).
const fontB64 = fs.readFileSync('public/fonts/anton-latin.woff2').toString('base64')
const ANTON_FACE = `@font-face {
  font-family: 'Anton';
  font-style: normal;
  font-weight: 400;
  src: url('data:font/woff2;base64,${fontB64}') format('woff2');
}`

// ── HTML templates ────────────────────────────────────────────────────────────
// Design system: #09090b bg, #a3e635 lime, #fb923c orange, #ffffff text

const BASE_STYLES = `
  ${ANTON_FACE}
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    width: 1200px; height: 630px;
    background: #09090b;
    color: #ffffff;
    font-family: 'Anton', 'Arial Narrow', Arial, sans-serif;
    overflow: hidden;
    position: relative;
  }
`

function homeHtml() {
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>
  ${BASE_STYLES}
  .wrap {
    position: absolute; inset: 0;
    display: flex; flex-direction: column;
    justify-content: center; align-items: flex-start;
    padding: 72px 80px;
    gap: 28px;
  }
  .eyebrow {
    font-family: 'Anton', sans-serif;
    font-size: 18px; letter-spacing: 6px; text-transform: uppercase;
    color: #52525b;
  }
  .brand {
    font-family: 'Anton', sans-serif;
    font-size: 88px; line-height: 0.92; text-transform: uppercase;
    color: #ffffff;
  }
  .brand em { color: #a3e635; font-style: normal; }
  .tagline {
    font-size: 22px; color: #a1a1aa; line-height: 1.4;
    font-family: system-ui, sans-serif; font-weight: 400;
    max-width: 640px;
  }
  .tools {
    display: flex; gap: 16px; margin-top: 8px;
  }
  .pill {
    font-family: 'Anton', sans-serif;
    font-size: 19px; letter-spacing: 2px; text-transform: uppercase;
    padding: 14px 28px; border-radius: 12px;
  }
  .pill-lime { background: #a3e635; color: #09090b; }
  .pill-orange { background: #fb923c; color: #09090b; }
  .watermark {
    position: absolute; right: 72px; bottom: 44px;
    font-family: 'Anton', sans-serif;
    font-size: 22px; letter-spacing: 2px;
    color: rgba(255,255,255,0.25);
  }
  .deco {
    position: absolute; right: 0; top: 0; bottom: 0;
    width: 320px;
    background: linear-gradient(160deg, rgba(163,230,53,0.08) 0%, rgba(251,146,60,0.06) 100%);
    border-left: 1px solid rgba(255,255,255,0.04);
  }
  </style></head><body>
  <div class="deco"></div>
  <div class="wrap">
    <div class="eyebrow">World Cup 2026</div>
    <div class="brand">THE<br>BANTER<br><em>TOOLBOX</em></div>
    <div class="tagline">AI-powered ammunition for the tournament group chat.</div>
    <div class="tools">
      <div class="pill pill-lime">🔥 Roast My Predictions</div>
      <div class="pill pill-orange">📜 Fan Excuse Generator</div>
    </div>
  </div>
  <div class="watermark">bantertoolbox.com</div>
</body></html>`
}

function roastHtml() {
  // Uses the England homer example from the few-shot examples in /api/roast.js
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>
  ${BASE_STYLES}
  .bg-strip {
    position: absolute; inset: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(163,230,53,0.06) 100%);
  }
  .wrap {
    position: absolute; inset: 0;
    display: flex; flex-direction: column;
    justify-content: space-between;
    padding: 52px 72px 48px;
  }
  .badge {
    display: inline-flex; align-items: center; gap: 10px;
    font-family: 'Anton', sans-serif;
    font-size: 17px; letter-spacing: 4px; text-transform: uppercase;
    color: #a3e635;
  }
  .picks {
    display: flex; gap: 12px; flex-wrap: wrap;
  }
  .chip {
    font-size: 14px; padding: 6px 16px; border-radius: 999px;
    background: rgba(255,255,255,0.07); color: #d4d4d8;
    font-family: system-ui, sans-serif;
  }
  .chip span { color: #71717a; margin-right: 4px; font-size: 12px; letter-spacing: 1px; text-transform: uppercase; }
  .roast {
    font-size: 28px; line-height: 1.32; font-style: italic;
    color: #f4f4f5;
    font-family: system-ui, sans-serif; font-weight: 600;
    max-width: 900px;
    flex: 1; display: flex; align-items: center;
    padding: 20px 0;
  }
  .bottom {
    display: flex; align-items: flex-end; justify-content: space-between;
  }
  .stamp {
    background: #a3e635; color: #09090b;
    padding: 14px 48px 18px;
    border-radius: 16px;
    transform: rotate(-3deg);
    text-align: center;
  }
  .stamp-label {
    font-family: 'Anton', sans-serif;
    font-size: 14px; letter-spacing: 4px; text-transform: uppercase;
  }
  .stamp-number {
    font-family: 'Anton', sans-serif;
    font-size: 72px; line-height: 1;
  }
  .stamp-denom { font-size: 28px; color: rgba(9,9,11,0.55); }
  .site {
    font-family: 'Anton', sans-serif;
    font-size: 22px; letter-spacing: 2px;
    color: rgba(255,255,255,0.25);
  }
  .title {
    font-family: 'Anton', sans-serif;
    font-size: 52px; text-transform: uppercase; line-height: 1;
    color: #ffffff; letter-spacing: 1px;
  }
  .title em { color: #a3e635; font-style: normal; }
  </style></head><body>
  <div class="bg-strip"></div>
  <div class="wrap">
    <div>
      <div class="badge">🔥 The Banter Toolbox</div>
      <div class="title" style="margin-top:12px">AI ROASTS YOUR<br><em>PREDICTIONS</em></div>
    </div>
    <div class="picks">
      <div class="chip"><span>Champion</span>🏴󠁧󠁢󠁥󠁮󠁧󠁿 England</div>
      <div class="chip"><span>Runner-up</span>🇫🇷 France</div>
      <div class="chip"><span>Top scorer</span>⚽ Kane</div>
      <div class="chip"><span>Dark horse</span>🏴󠁧󠁢󠁥󠁮󠁧󠁿 England</div>
      <div class="chip"><span>First big exit</span>🇩🇪 Germany</div>
    </div>
    <div class="roast">"England as champion AND dark horse — sixty years of hurt and you've pre-ordered another summer of it. Kane for top scorer is bold from a man whose last penalty is still in orbit."</div>
    <div class="bottom">
      <div class="stamp">
        <div class="stamp-label">Courage Rating</div>
        <div class="stamp-number">7.6<span class="stamp-denom"> /10</span></div>
      </div>
      <div class="site">bantertoolbox.com</div>
    </div>
  </div>
</body></html>`
}

function excuseHtml() {
  // Uses the Italy "didn't qualify" example from /api/excuse.js
  return `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>
  ${BASE_STYLES}
  .bg-strip {
    position: absolute; inset: 0;
    background: linear-gradient(135deg, rgba(255,255,255,0.02) 0%, rgba(251,146,60,0.07) 100%);
  }
  .wrap {
    position: absolute; inset: 0;
    display: flex; flex-direction: column;
    justify-content: space-between;
    padding: 52px 72px 48px;
  }
  .badge {
    font-family: 'Anton', sans-serif;
    font-size: 17px; letter-spacing: 4px; text-transform: uppercase;
    color: #fb923c;
  }
  .title {
    font-family: 'Anton', sans-serif;
    font-size: 52px; text-transform: uppercase; line-height: 1;
    color: #ffffff; letter-spacing: 1px; margin-top: 12px;
  }
  .title em { color: #fb923c; font-style: normal; }
  .header-row {
    display: flex; flex-direction: column; gap: 12px;
  }
  .team-chip {
    display: inline-flex; align-items: center; gap: 10px;
    font-size: 16px; padding: 8px 20px; border-radius: 999px;
    background: rgba(255,255,255,0.07); color: #e4e4e7;
    font-family: system-ui, sans-serif;
    align-self: flex-start;
    margin-top: 16px;
  }
  .situation {
    font-family: system-ui, sans-serif; font-size: 13px;
    padding: 5px 14px; border-radius: 999px;
    background: rgba(251,146,60,0.15); color: #fb923c;
    letter-spacing: 1px; text-transform: uppercase;
    display: inline-block; margin-left: 8px;
  }
  .excuse-box {
    border: 2px solid rgba(251,146,60,0.30);
    border-top: 4px solid #fb923c;
    border-radius: 16px;
    padding: 32px 40px;
    background: rgba(9,9,11,0.6);
    flex: 1; display: flex; flex-direction: column;
    justify-content: center; gap: 20px;
    margin: 20px 0;
  }
  .excuse-text {
    font-size: 27px; line-height: 1.38;
    color: #f4f4f5; text-transform: uppercase;
    font-family: 'Anton', sans-serif; letter-spacing: 0.5px;
  }
  .denial {
    display: flex; align-items: baseline; gap: 12px;
  }
  .denial-label {
    font-family: 'Anton', sans-serif;
    font-size: 14px; letter-spacing: 4px; text-transform: uppercase;
    color: #71717a;
  }
  .denial-number {
    font-family: 'Anton', sans-serif;
    font-size: 56px; color: #fb923c; line-height: 1;
  }
  .denial-denom { font-size: 22px; color: #52525b; }
  .bottom {
    display: flex; justify-content: space-between; align-items: flex-end;
  }
  .cope-stamp {
    border: 3px solid rgba(251,146,60,0.80);
    border-radius: 6px;
    padding: 10px 32px 12px;
    text-align: center;
    color: rgba(251,146,60,0.88);
    transform: rotate(6deg);
    background: rgba(9,9,11,0.7);
  }
  .cope-small { font-family: 'Anton', sans-serif; font-size: 13px; letter-spacing: 5px; }
  .cope-big { font-family: 'Anton', sans-serif; font-size: 44px; line-height: 1; }
  .site {
    font-family: 'Anton', sans-serif;
    font-size: 22px; letter-spacing: 2px;
    color: rgba(255,255,255,0.25);
  }
  </style></head><body>
  <div class="bg-strip"></div>
  <div class="wrap">
    <div class="header-row">
      <div class="badge">📜 The Banter Toolbox</div>
      <div class="title">FAN EXCUSE<br><em>GENERATOR</em></div>
      <div>
        <span class="team-chip">🇮🇹 Italy</span>
        <span class="situation">Didn't even qualify</span>
      </div>
    </div>
    <div class="excuse-box">
      <div class="excuse-text">Italy, four-time champions, have elected to extend their strategic absence to a third tournament. You cannot lose a World Cup you refuse to attend. Catenaccio, perfected.</div>
      <div class="denial">
        <div class="denial-label">Denial Level</div>
        <div class="denial-number">100<span class="denial-denom"> /100</span></div>
      </div>
    </div>
    <div class="bottom">
      <div class="cope-stamp">
        <div class="cope-small">CERTIFIED</div>
        <div class="cope-big">COPE</div>
      </div>
      <div class="site">bantertoolbox.com</div>
    </div>
  </div>
</body></html>`
}

// ── Main: spawn Chrome, render each template, screenshot ─────────────────────
const chrome = spawn(CHROME, [
  `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${PROFILE}`,
  '--headless=new',
  '--no-first-run',
  '--disable-gpu',
  '--window-size=1200,630',
])
chrome.on('error', (e) => { console.error('Chrome failed to start:', e); process.exit(1) })

async function renderOg(s, html, outFile) {
  // Write HTML to a temp file and navigate Chrome to it
  const tmpHtml = path.join(TMP, `og-${outFile}.html`)
  fs.writeFileSync(tmpHtml, html, 'utf8')

  const fileUrl = `file:///${tmpHtml.replace(/\\/g, '/')}`
  await send('Page.navigate', { url: fileUrl }, s)
  // Wait for fonts to load and layout to settle
  for (let i = 0; i < 100; i++) {
    const ready = await send('Runtime.evaluate', { expression: `document.fonts.ready.then(() => true)`, awaitPromise: true, returnByValue: true }, s)
    if (ready.result?.value) break
    await sleep(100)
  }
  await sleep(500) // extra settle for rendering

  const { data } = await send('Page.captureScreenshot', { format: 'png', clip: { x: 0, y: 0, width: 1200, height: 630, scale: 1 } }, s)
  const outPath = path.join(OUT_DIR, outFile)
  fs.writeFileSync(outPath, Buffer.from(data, 'base64'))
  console.log(`  ✅ ${outFile} → ${outPath}`)
}

try {
  await connect()

  const { targetId } = await send('Target.createTarget', { url: 'about:blank' })
  const { sessionId: s } = await send('Target.attachToTarget', { targetId, flatten: true })
  await send('Page.enable', {}, s)
  await send('Runtime.enable', {}, s)
  await send('Emulation.setDeviceMetricsOverride', { width: 1200, height: 630, deviceScaleFactor: 1, mobile: false }, s)

  console.log('\nGenerating OG images...')
  await renderOg(s, homeHtml(), 'home.png')
  await renderOg(s, roastHtml(), 'roast.png')
  await renderOg(s, excuseHtml(), 'excuse.png')

  console.log('\n✅ All OG images written to public/og/')
} catch (err) {
  console.error('\n❌ FAILED:', err.message)
  process.exitCode = 1
} finally {
  chrome.kill()
}
