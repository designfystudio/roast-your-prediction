// E2E regression driver: both tools, mobile viewport, real API calls.
// Drives headless Chrome over raw CDP (Node 24's built-in WebSocket — no deps).
// Usage: node scripts/e2e-regression.mjs  (dev server must be running on :5173)
//
// Verifies per tool: form flow → live generate → typing completes → share card
// renders → Download PNG lands on disk at 1080×1350 → Share clipboard fallback
// shows the "copied" feedback. Native navigator.share can't run headless (it
// needs the OS share sheet), so the test disables canShare to force the
// desktop clipboard path — the export pipeline up to share() is identical.

import { spawn } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'

const BASE = process.env.E2E_BASE_URL ?? 'http://localhost:5173'
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
const PORT = 9222
const TMP = path.resolve('tmp')
const DL_DIR = path.join(TMP, 'downloads')
const PROFILE = path.join(TMP, 'chrome-profile')

fs.rmSync(DL_DIR, { recursive: true, force: true })
fs.mkdirSync(DL_DIR, { recursive: true })
fs.mkdirSync(PROFILE, { recursive: true })

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// ── minimal flat-mode CDP client ──────────────────────────────────────────
let ws
let msgId = 0
const pending = new Map()

function send(method, params = {}, sessionId) {
  const id = ++msgId
  ws.send(JSON.stringify({ id, method, params, sessionId }))
  return new Promise((resolve, reject) => pending.set(id, { resolve, reject, method }))
}

async function connect() {
  for (let i = 0; i < 50; i++) {
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
          const { resolve, reject, method } = pending.get(msg.id)
          pending.delete(msg.id)
          msg.error ? reject(new Error(`${method}: ${msg.error.message}`)) : resolve(msg.result)
        }
      }
      return
    } catch {
      await sleep(200)
    }
  }
  throw new Error('Could not connect to Chrome debugging port')
}

// ── page helpers (all run inside the page via Runtime.evaluate) ───────────
let session

async function evaluate(expression) {
  const { result, exceptionDetails } = await send(
    'Runtime.evaluate',
    { expression, awaitPromise: true, returnByValue: true },
    session,
  )
  if (exceptionDetails) throw new Error(`page error: ${exceptionDetails.text} ${result?.description ?? ''}`)
  return result.value
}

async function navigate(url) {
  await send('Page.navigate', { url }, session)
  // First load on a fresh Vite server can take a while (on-demand compile),
  // so wait for the React app to actually mount, not just readyState.
  for (let i = 0; i < 300; i++) {
    const mounted = await evaluate(
      `document.readyState === 'complete' && document.getElementById('root')?.children.length > 0`,
    ).catch(() => false)
    if (mounted) return
    await sleep(200)
  }
  throw new Error(`navigation to ${url} timed out`)
}

// Click the Nth TeamPicker grid tile whose text matches the team name.
const clickGridTeam = (gridIndex, name) =>
  evaluate(`(() => {
    const grids = [...document.querySelectorAll('.grid')]
    const grid = grids[${gridIndex}]
    if (!grid) throw new Error('grid ${gridIndex} not found (have ' + grids.length + ')')
    const btn = [...grid.querySelectorAll('button')].find((b) => b.textContent.includes(${JSON.stringify(name)}))
    if (!btn) throw new Error('team ${name} not in grid ${gridIndex}')
    btn.click(); return true
  })()`)

const clickButton = (text) =>
  evaluate(`(() => {
    const btn = [...document.querySelectorAll('button')].find(
      (b) => !b.disabled && b.textContent.trim().startsWith(${JSON.stringify(text)}),
    )
    if (!btn) throw new Error('no enabled button starting with: ${text}')
    btn.click(); return true
  })()`)

async function waitForText(text, timeoutMs = 90000, what = text) {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    // case-insensitive: headings/buttons render through CSS text-transform
    if (
      await evaluate(
        `document.body.innerText.toLowerCase().includes(${JSON.stringify(text.toLowerCase())})`,
      )
    )
      return
    await sleep(250)
  }
  throw new Error(`timed out waiting for: ${what}`)
}

async function screenshot(file) {
  const { data } = await send(
    'Page.captureScreenshot',
    { format: 'png', captureBeyondViewport: true },
    session,
  )
  fs.writeFileSync(path.join(TMP, file), Buffer.from(data, 'base64'))
  console.log(`  📸 tmp/${file}`)
}

function pngSize(file) {
  const buf = fs.readFileSync(file)
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) }
}

async function waitForDownload(fileName, timeoutMs = 60000) {
  const full = path.join(DL_DIR, fileName)
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    if (fs.existsSync(full) && !fs.existsSync(full + '.crdownload')) {
      await sleep(300) // let the write settle
      const { width, height } = pngSize(full)
      if (width !== 1080 || height !== 1350)
        throw new Error(`${fileName} is ${width}x${height}, expected 1080x1350`)
      console.log(`  ✅ download: ${fileName} (1080x1350, ${fs.statSync(full).size} bytes)`)
      return
    }
    await sleep(250)
  }
  throw new Error(`download ${fileName} never arrived`)
}

async function testShareClipboard() {
  // Force the desktop clipboard fallback (native share sheet can't open headless).
  await evaluate(`Object.defineProperty(navigator, 'canShare', { value: undefined }); true`)
  await clickButton('Share')
  await waitForText('Card copied to clipboard', 30000, 'share "copied" feedback')
  console.log('  ✅ share: clipboard fallback confirmed ("Card copied to clipboard")')
}

// ── flows ──────────────────────────────────────────────────────────────────
async function roastFlow() {
  console.log('\n── ROAST flow ──')
  await navigate(`${BASE}/roast`)
  await waitForText('Step 1', 15000, 'roast form step 1')

  await clickGridTeam(0, 'Argentina') // champion
  await clickGridTeam(1, 'France') // runner-up
  await clickButton('Next')
  await waitForText('Top scorer', 10000, 'roast form step 2')

  await evaluate(`(() => {
    const input = document.querySelector('input[type="text"]')
    const set = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set
    set.call(input, 'Lautaro Martínez')
    input.dispatchEvent(new Event('input', { bubbles: true }))
    return true
  })()`)
  await clickGridTeam(0, 'Morocco') // dark horse
  await clickGridTeam(1, 'England') // first big out
  await clickButton('Next')
  await waitForText('Your predictions', 10000, 'roast form step 3 summary')

  await clickButton('Roast me')
  console.log('  ⏳ live /api/roast call + typing effect…')
  await waitForText('Download PNG', 90000, 'roast share card (API + typing)')
  const roastText = await evaluate(
    `document.querySelector('.italic.leading-relaxed, p.italic')?.innerText ?? ''`,
  )
  console.log(`  ✅ roast generated: "${roastText.slice(0, 90)}…"`)
  await sleep(1500) // preview images/fonts
  await screenshot('regress-roast-result.png')

  await clickButton('Download PNG')
  await waitForDownload('my-2026-predictions.png')
  await testShareClipboard()

  const crossLink = await evaluate(`!!document.querySelector('a[href="/excuse"]')`)
  console.log(`  ${crossLink ? '✅' : '❌'} cross-link to /excuse present`)
}

async function excuseFlow() {
  console.log('\n── EXCUSE flow ──')
  await navigate(`${BASE}/excuse`)
  await waitForText('Step 1', 15000, 'excuse form step 1')

  await clickGridTeam(0, 'Brazil')
  await clickButton('Next')
  await waitForText('What Happened', 10000, 'excuse form step 2')

  await clickButton('Ref robbery')
  await sleep(300) // opponent grid mounts
  await clickGridTeam(0, 'Argentina') // opponent
  await clickButton('Defend my team')
  console.log('  ⏳ live /api/excuse call + typing effect…')
  await waitForText('Download PNG', 90000, 'excuse share card (API + typing)')
  const excuseText = await evaluate(
    `[...document.querySelectorAll('p')].find((p) => p.className.includes('font-display'))?.innerText ?? ''`,
  )
  console.log(`  ✅ excuse generated: "${excuseText.slice(0, 90)}…"`)
  await sleep(1500)
  await screenshot('regress-excuse-result.png')

  await clickButton('Download PNG')
  await waitForDownload('official-excuse.png')
  await testShareClipboard()

  const crossLink = await evaluate(`!!document.querySelector('a[href="/roast"]')`)
  console.log(`  ${crossLink ? '✅' : '❌'} cross-link to /roast present`)
}

// ── main ───────────────────────────────────────────────────────────────────
const chrome = spawn(CHROME, [
  `--remote-debugging-port=${PORT}`,
  `--user-data-dir=${PROFILE}`,
  '--headless=new',
  '--no-first-run',
  '--disable-gpu',
  '--window-size=500,900',
])
chrome.on('error', (e) => {
  console.error('chrome failed to start:', e)
  process.exit(1)
})

try {
  await connect()

  const { targetId } = await send('Target.createTarget', { url: 'about:blank' })
  ;({ sessionId: session } = await send('Target.attachToTarget', { targetId, flatten: true }))
  await send('Page.enable', {}, session)
  await send('Runtime.enable', {}, session)

  // mobile viewport — iPhone-ish metrics
  await send(
    'Emulation.setDeviceMetricsOverride',
    { width: 390, height: 844, deviceScaleFactor: 2, mobile: true },
    session,
  )

  await send('Browser.setDownloadBehavior', { behavior: 'allow', downloadPath: DL_DIR })
  await send('Browser.grantPermissions', {
    permissions: ['clipboardReadWrite', 'clipboardSanitizedWrite'],
    origin: BASE,
  })

  await roastFlow()
  await excuseFlow()

  console.log('\n✅ FULL REGRESSION PASS — both tools green')
} catch (err) {
  console.error('\n❌ REGRESSION FAILED:', err.message)
  try {
    await screenshot('regress-failure.png')
  } catch {}
  process.exitCode = 1
} finally {
  chrome.kill()
}
