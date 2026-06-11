import { copy } from '../data/copy'

const FILE_NAME = 'my-2026-predictions.png'

async function waitForImages(el) {
  const imgs = [...el.querySelectorAll('img')]
  await Promise.all(
    imgs.map((img) =>
      img.complete
        ? Promise.resolve()
        : new Promise((resolve) => {
            img.addEventListener('load', resolve, { once: true })
            img.addEventListener('error', resolve, { once: true })
          }),
    ),
  )
  if (document.fonts?.ready) await document.fonts.ready
}

// el is the off-screen 1080×1350 master card. Returns a PNG Blob.
// html2canvas-pro is loaded on demand — it's ~60KB gzip and only needed once
// the user actually exports, so keep it out of the initial mobile bundle.
export async function exportCardPng(el) {
  const { default: html2canvas } = await import('html2canvas-pro')
  await waitForImages(el)
  const canvas = await html2canvas(el, {
    width: 1080,
    height: 1350,
    scale: 1,
    useCORS: true, // flag images come from flagcdn with CORS headers
    backgroundColor: '#09090b',
  })
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('PNG export failed'))), 'image/png'),
  )
}

export async function downloadCard(el) {
  const blob = await exportCardPng(el)
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = FILE_NAME
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

// Native share on mobile, clipboard fallback on desktop.
// Returns 'shared' | 'copied' so the UI can show the right feedback.
export async function shareCard(el) {
  const blob = await exportCardPng(el)
  const file = new File([blob], FILE_NAME, { type: 'image/png' })

  if (navigator.canShare?.({ files: [file] })) {
    await navigator.share({ files: [file], text: copy.shareCard.shareText })
    return 'shared'
  }
  if (navigator.clipboard?.write && window.ClipboardItem) {
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })])
    return 'copied'
  }
  throw new Error('Sharing not supported in this browser')
}
