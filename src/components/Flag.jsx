import { useState } from 'react'

// National flag image from flagcdn.com (flags only — never crests/logos, legal guardrail).
// Falls back to the emoji if the image fails to load (offline / CDN down / unknown code).
// crossOrigin is set so the image won't taint the canvas when the share card is rendered
// with html2canvas later (flagcdn serves Access-Control-Allow-Origin: *).
const WIDTHS = { sm: 40, md: 80, lg: 160 }

export default function Flag({ team, size = 'md', className = '', style, eager = false }) {
  const [failed, setFailed] = useState(false)
  const w = WIDTHS[size] ?? WIDTHS.md

  if (failed || !team?.iso) {
    return <span className={className} style={style} aria-label={`${team?.name} flag`}>{team?.flag}</span>
  }

  return (
    <img
      src={`https://flagcdn.com/w${w}/${team.iso}.png`}
      srcSet={`https://flagcdn.com/w${w * 2}/${team.iso}.png 2x`}
      alt={`${team.name} flag`}
      crossOrigin="anonymous"
      loading={eager ? 'eager' : 'lazy'}
      onError={() => setFailed(true)}
      className={className}
      style={style}
    />
  )
}
