// One-shot: splice PART 1 of roast-system-prompt-v2.md into api/roast.js
// verbatim, replacing the old SYSTEM_PROMPT template-literal contents.
import fs from 'node:fs'

const md = fs.readFileSync('roast-system-prompt-v2.md', 'utf8')

// PART 1 is the only fenced code block in the file.
const open = md.indexOf('```\n')
const close = md.indexOf('\n```', open + 4)
if (open === -1 || close === -1) throw new Error('Could not locate PART 1 code block')
const prompt = md.slice(open + 4, close)

if (!prompt.startsWith('You are "The Pundit"')) throw new Error('Unexpected block start: ' + prompt.slice(0, 40))
if (!prompt.trimEnd().endsWith('lore only from the bank.')) throw new Error('Unexpected block end')
if (prompt.includes('`') || prompt.includes('${') || prompt.includes('\\'))
  throw new Error('Prompt contains characters unsafe for a template literal')

const file = 'api/roast.js'
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
