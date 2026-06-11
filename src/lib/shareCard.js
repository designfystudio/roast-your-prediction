// Two export formats per card type: 4:5 for feeds/chats, 9:16 for Stories.
export const CARD_FORMATS = {
  feed: { width: 1080, height: 1350 },
  story: { width: 1080, height: 1920 },
}

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

// el is the off-screen master card for the given format. Returns a PNG Blob.
// html2canvas-pro is loaded on demand — it's ~60KB gzip and only needed once
// the user actually exports, so keep it out of the initial mobile bundle.
export async function exportCardPng(el, format = 'feed') {
  const { width, height } = CARD_FORMATS[format]
  const { default: html2canvas } = await import('html2canvas-pro')
  await waitForImages(el)
  const canvas = await html2canvas(el, {
    width,
    height,
    scale: 1,
    useCORS: true, // flag images come from flagcdn with CORS headers
    backgroundColor: '#09090b',
  })
  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('PNG export failed'))), 'image/png'),
  )
}

function downloadBlob(blob, fileName) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

// One call per share button: native share sheet on mobile (Instagram/Snapchat/
// WhatsApp targets), PNG download fallback on desktop. Returns 'shared' |
// 'downloaded' so the UI can show the right feedback.
export async function shareOrDownloadCard(el, { format = 'feed', fileName, shareText }) {
  const blob = await exportCardPng(el, format)
  const file = new File([blob], fileName, { type: 'image/png' })

  if (navigator.canShare?.({ files: [file] })) {
    await navigator.share({ files: [file], text: shareText })
    return 'shared'
  }
  downloadBlob(blob, fileName)
  return 'downloaded'
}
