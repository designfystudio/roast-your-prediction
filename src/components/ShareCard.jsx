import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { getTeam } from '../data/teams'
import { copy } from '../data/copy'
import { exportCardPng, shareOrDownloadCard } from '../lib/shareCard'
import Flag from './Flag'
import SocialShareLinks from './SocialShareLinks'

// The 1080×1350 (4:5) card itself. Inline px styles throughout: this face is a
// fixed-size print artifact, not a responsive component — it renders once
// off-screen as the export master and once CSS-scaled as the preview.
function CardFace({ picks, roast, courageRating }) {
  const champion = getTeam(picks.championId)
  const chips = [
    { label: copy.steps.three.championChip, team: champion },
    { label: copy.steps.three.runnerUpChip, team: getTeam(picks.runnerUpId) },
    { label: copy.steps.three.topScorerChip, text: `⚽ ${picks.topScorer}` },
    { label: copy.steps.three.darkHorseChip, team: getTeam(picks.darkHorseId) },
    { label: copy.steps.three.firstBigOutChip, team: getTeam(picks.firstBigOutId) },
  ]

  return (
    <div
      style={{
        width: 1080,
        height: 1350,
        position: 'relative',
        overflow: 'hidden',
        background: `linear-gradient(160deg, ${champion.primary} 0%, ${champion.secondary} 100%)`,
        fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
        color: '#ffffff',
      }}
    >
      {/* dark scrim so text survives light kit colors (England, Germany…) */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, rgba(9,9,11,0.30) 0%, rgba(9,9,11,0.55) 45%, rgba(9,9,11,0.82) 100%)',
        }}
      />

      <div
        style={{
          position: 'relative',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          padding: '56px 64px 48px',
        }}
      >
        <h1
          style={{
            fontFamily: "'Anton', 'Arial Narrow', sans-serif",
            fontSize: 96,
            fontWeight: 400,
            textTransform: 'uppercase',
            lineHeight: 1.0,
            margin: 0,
            textShadow: '0 4px 24px rgba(9,9,11,0.85)', // stays legible on light kit colors
          }}
        >
          {copy.shareCard.header.includes('2026') ? (
            <>
              {copy.shareCard.header.split('2026')[0]}
              <span style={{ color: '#a3e635' }}>2026</span>
              {copy.shareCard.header.split('2026')[1]}
            </>
          ) : (
            copy.shareCard.header
          )}
        </h1>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 36 }}>
          {chips.map(({ label, team, text }) => (
            <div
              key={label}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 20,
                background: 'rgba(9,9,11,0.45)',
                borderRadius: 999,
                padding: '10px 32px',
              }}
            >
              <span
                style={{
                  fontSize: 24,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: 2,
                  color: 'rgba(255,255,255,0.55)',
                  width: 250,
                  flexShrink: 0,
                }}
              >
                {label}
              </span>
              {team && (
                <Flag team={team} size="md" eager className="rounded" style={{ height: 42, width: 'auto' }} />
              )}
              <span style={{ fontSize: 38, fontWeight: 800 }}>{team ? team.name : text}</span>
            </div>
          ))}
        </div>

        <p
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            fontSize: 43,
            lineHeight: 1.26,
            fontWeight: 600,
            fontStyle: 'italic',
            margin: '32px 0 0',
          }}
        >
          “{roast}”
        </p>

        {/* courage stamp — filled block so it still reads at WhatsApp-thumbnail size */}
        <div
          style={{
            alignSelf: 'center',
            transform: 'rotate(-5deg)',
            background: '#a3e635',
            borderRadius: 24,
            padding: '16px 60px 22px',
            textAlign: 'center',
            marginTop: 28,
            boxShadow: '0 12px 48px rgba(9,9,11,0.5)',
          }}
        >
          <div
            style={{
              fontFamily: "'Anton', 'Arial Narrow', sans-serif",
              fontSize: 30,
              fontWeight: 400,
              letterSpacing: 6,
              color: '#09090b',
            }}
          >
            {copy.shareCard.courageLabel}
          </div>
          <div
            style={{
              fontFamily: "'Anton', 'Arial Narrow', sans-serif",
              fontSize: 150,
              fontWeight: 400,
              lineHeight: 1,
              color: '#09090b',
            }}
          >
            {courageRating.toFixed(1)}
            <span style={{ fontSize: 56, color: 'rgba(9,9,11,0.6)' }}> /10</span>
          </div>
        </div>

        {/* watermark — part of the rendered pixels, non-removable */}
        <div
          style={{
            position: 'absolute',
            right: 48,
            bottom: 36,
            fontFamily: "'Anton', 'Arial Narrow', sans-serif",
            fontSize: 32,
            fontWeight: 400,
            letterSpacing: 1,
            color: 'rgba(255,255,255,0.9)',
          }}
        >
          {copy.shareCard.watermark}
        </div>
      </div>
    </div>
  )
}

// 1080×1920 (9:16) Stories variant — same content and design language as
// CardFace, recomposed for the taller canvas: bigger type, more breathing room,
// and ≥250px top/bottom safe margins so Instagram's username header and reply
// bar never overlap the text when viewed full-screen.
function StoryCardFace({ picks, roast, courageRating }) {
  const champion = getTeam(picks.championId)
  const chips = [
    { label: copy.steps.three.championChip, team: champion },
    { label: copy.steps.three.runnerUpChip, team: getTeam(picks.runnerUpId) },
    { label: copy.steps.three.topScorerChip, text: `⚽ ${picks.topScorer}` },
    { label: copy.steps.three.darkHorseChip, team: getTeam(picks.darkHorseId) },
    { label: copy.steps.three.firstBigOutChip, team: getTeam(picks.firstBigOutId) },
  ]

  return (
    <div
      style={{
        width: 1080,
        height: 1920,
        position: 'relative',
        overflow: 'hidden',
        background: `linear-gradient(160deg, ${champion.primary} 0%, ${champion.secondary} 100%)`,
        fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
        color: '#ffffff',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, rgba(9,9,11,0.30) 0%, rgba(9,9,11,0.55) 45%, rgba(9,9,11,0.82) 100%)',
        }}
      />

      {/* content column sits inside the Stories safe area */}
      <div
        style={{
          position: 'relative',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          padding: '264px 72px 312px',
        }}
      >
        <h1
          style={{
            fontFamily: "'Anton', 'Arial Narrow', sans-serif",
            fontSize: 100,
            fontWeight: 400,
            textTransform: 'uppercase',
            lineHeight: 1.0,
            margin: 0,
            textShadow: '0 4px 24px rgba(9,9,11,0.85)',
          }}
        >
          {copy.shareCard.header.includes('2026') ? (
            <>
              {copy.shareCard.header.split('2026')[0]}
              <span style={{ color: '#a3e635' }}>2026</span>
              {copy.shareCard.header.split('2026')[1]}
            </>
          ) : (
            copy.shareCard.header
          )}
        </h1>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 13, marginTop: 36 }}>
          {chips.map(({ label, team, text }) => (
            <div
              key={label}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 20,
                background: 'rgba(9,9,11,0.45)',
                borderRadius: 999,
                padding: '11px 34px',
              }}
            >
              <span
                style={{
                  fontSize: 25,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: 2,
                  color: 'rgba(255,255,255,0.55)',
                  width: 260,
                  flexShrink: 0,
                }}
              >
                {label}
              </span>
              {team && (
                <Flag team={team} size="md" eager className="rounded" style={{ height: 44, width: 'auto' }} />
              )}
              <span style={{ fontSize: 38, fontWeight: 800 }}>{team ? team.name : text}</span>
            </div>
          ))}
        </div>

        <p
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            fontSize: 45,
            lineHeight: 1.28,
            fontWeight: 600,
            fontStyle: 'italic',
            margin: '34px 0 0',
          }}
        >
          “{roast}”
        </p>

        <div
          style={{
            alignSelf: 'center',
            transform: 'rotate(-5deg)',
            background: '#a3e635',
            borderRadius: 24,
            padding: '17px 62px 23px',
            textAlign: 'center',
            marginTop: 30,
            boxShadow: '0 12px 48px rgba(9,9,11,0.5)',
          }}
        >
          <div
            style={{
              fontFamily: "'Anton', 'Arial Narrow', sans-serif",
              fontSize: 31,
              fontWeight: 400,
              letterSpacing: 6,
              color: '#09090b',
            }}
          >
            {copy.shareCard.courageLabel}
          </div>
          <div
            style={{
              fontFamily: "'Anton', 'Arial Narrow', sans-serif",
              fontSize: 155,
              fontWeight: 400,
              lineHeight: 1,
              color: '#09090b',
            }}
          >
            {courageRating.toFixed(1)}
            <span style={{ fontSize: 58, color: 'rgba(9,9,11,0.6)' }}> /10</span>
          </div>
        </div>
      </div>

      {/* watermark — sized up for full-screen, kept inside the bottom safe area */}
      <div
        style={{
          position: 'absolute',
          right: 64,
          bottom: 254,
          fontFamily: "'Anton', 'Arial Narrow', sans-serif",
          fontSize: 40,
          fontWeight: 400,
          letterSpacing: 1,
          color: 'rgba(255,255,255,0.9)',
        }}
      >
        {copy.shareCard.watermark}
      </div>
    </div>
  )
}

const FILE_NAMES = {
  feed: 'my-2026-predictions.png',
  story: 'my-2026-predictions-story.png',
}

export default function ShareCard({ picks, roast, courageRating, autoExportTest = false }) {
  const masterRef = useRef(null)
  const storyRef = useRef(null)
  const previewBoxRef = useRef(null)
  const [previewScale, setPreviewScale] = useState(0)
  const [busy, setBusy] = useState('') // '' | 'feed' | 'story'
  const [feedback, setFeedback] = useState('')

  // Scale the preview CardFace to the container width (4:5 box).
  useLayoutEffect(() => {
    const box = previewBoxRef.current
    if (!box) return
    const update = () => setPreviewScale(box.clientWidth / 1080)
    update()
    const ro = new ResizeObserver(update)
    ro.observe(box)
    return () => ro.disconnect()
  }, [])

  // Dev-only test hook: auto-export the master and POST it to the dev server
  // so a headless browser run can produce a real PNG on disk.
  useEffect(() => {
    if (!import.meta.env.DEV || !autoExportTest) return
    ;(async () => {
      const blob = await exportCardPng(masterRef.current)
      const dataUrl = await new Promise((resolve) => {
        const fr = new FileReader()
        fr.onload = () => resolve(fr.result)
        fr.readAsDataURL(blob)
      })
      await fetch('/api/dev/save-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dataUrl }),
      })
      document.title = 'card-saved'
    })()
  }, [autoExportTest])

  const run = async (format) => {
    setBusy(format)
    setFeedback('')
    try {
      const el = format === 'story' ? storyRef.current : masterRef.current
      const result = await shareOrDownloadCard(el, {
        format,
        fileName: FILE_NAMES[format],
        shareText: copy.shareCard.shareText,
      })
      if (result === 'downloaded') setFeedback(copy.shareCard.downloaded)
      window.plausible?.('card_download', { props: { format } })
    } catch (err) {
      if (err?.name !== 'AbortError') setFeedback(copy.shareCard.shareFailed)
    } finally {
      setBusy('')
    }
  }

  return (
    <section className="flex flex-col gap-4">
      {/* off-screen export masters — DOM render is cheap; html2canvas only runs
          when a share button is tapped, so neither format is rasterized early */}
      <div style={{ position: 'absolute', left: -9999, top: 0 }} aria-hidden="true">
        <div ref={masterRef}>
          <CardFace picks={picks} roast={roast} courageRating={courageRating} />
        </div>
        <div ref={storyRef}>
          <StoryCardFace picks={picks} roast={roast} courageRating={courageRating} />
        </div>
      </div>

      {/* scaled live preview */}
      <div
        ref={previewBoxRef}
        className="mx-auto w-full max-w-sm overflow-hidden rounded-xl border border-zinc-800 shadow-2xl"
        style={{ aspectRatio: '4 / 5' }}
      >
        {previewScale > 0 && (
          <div style={{ transform: `scale(${previewScale})`, transformOrigin: 'top left' }}>
            <CardFace picks={picks} roast={roast} courageRating={courageRating} />
          </div>
        )}
      </div>

      {/* stacked full-width on mobile = thumb-friendly; row on larger screens */}
      <div className="mx-auto flex w-full max-w-sm flex-col gap-3 sm:max-w-none sm:flex-row sm:justify-center">
        <button
          type="button"
          disabled={!!busy}
          onClick={() => run('feed')}
          className="rounded-xl bg-lime-400 px-7 py-4 font-display text-lg uppercase tracking-wide text-zinc-950 shadow-[0_0_24px] shadow-lime-400/30 hover:bg-lime-300 disabled:opacity-50 disabled:shadow-none"
        >
          {busy === 'feed' ? copy.shareCard.downloading : copy.buttons.shareFeed}
        </button>
        <button
          type="button"
          disabled={!!busy}
          onClick={() => run('story')}
          className="rounded-xl bg-orange-500 px-7 py-4 font-display text-lg uppercase tracking-wide text-zinc-950 shadow-[0_0_24px] shadow-orange-500/30 hover:bg-orange-400 disabled:opacity-50 disabled:shadow-none"
        >
          {busy === 'story' ? copy.shareCard.downloading : copy.buttons.shareStory}
        </button>
      </div>
      {feedback && <p className="text-center text-sm text-zinc-400">{feedback}</p>}
      <SocialShareLinks
        text={copy.shareCard.shareText}
        url={`${copy.siteUrl}/roast`}
      />
    </section>
  )
}
