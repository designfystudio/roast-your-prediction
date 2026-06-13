// Splice the excuse system prompt from fan-excuse-generator/excuse-system-prompt.md
// into the SYSTEM_PROMPT template literal in api/excuse.js, verbatim.
// The .md is the single source of truth — edit there, run this, never hand-edit
// the literal in api/excuse.js. Mirror of scripts/splice-prompt.mjs (roast).
import fs from 'node:fs'

const md = fs.readFileSync('fan-excuse-generator/excuse-system-prompt.md', 'utf8')

// The prompt is the only fenced code block in the file.
const open = md.indexOf('```\n')
const close = md.indexOf('\n```', open + 4)
if (open === -1 || close === -1) throw new Error('Could not locate the prompt code block')
const prompt = md.slice(open + 4, close)

if (!prompt.startsWith('You are "The Advocate"')) throw new Error('Unexpected block start: ' + prompt.slice(0, 40))
if (!prompt.trimEnd().endsWith('blame the grass when in doubt.')) throw new Error('Unexpected block end')
if (prompt.includes('`') || prompt.includes('${') || prompt.includes('\\'))
  throw new Error('Prompt contains characters unsafe for a template literal')

const file = 'api/excuse.js'
const src = fs.readFileSync(file, 'utf8')
const marker = 'const SYSTEM_PROMPT = `'
const start = src.indexOf(marker)
if (start === -1) throw new Error('SYSTEM_PROMPT not found')
const bodyStart = start + marker.length
const bodyEnd = src.indexOf('`', bodyStart)
if (bodyEnd === -1) throw new Error('Closing backtick not found')

const out = src.slice(0, bodyStart) + prompt.trimEnd() + src.slice(bodyEnd)
fs.writeFileSync(file, out)

// Confirm: re-read and string-compare what sits inside the literal vs the md block.
const check = fs.readFileSync(file, 'utf8')
const s = check.indexOf(marker) + marker.length
const e = check.indexOf('`', s)
console.log('verbatim match:', check.slice(s, e) === prompt.trimEnd())
console.log('prompt length (chars):', prompt.trimEnd().length)
