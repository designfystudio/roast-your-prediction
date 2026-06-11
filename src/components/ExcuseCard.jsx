import { useLayoutEffect, useRef, useState } from 'react'
import { copy } from '../data/copy'
import { shareOrDownloadCard } from '../lib/shareCard'
import Flag from './Flag'
import SocialShareLinks from './SocialShareLinks'

const FILE_NAMES = {
  feed: 'official-excuse.png',
  story: 'official-excuse-story.png',
}

// The 1080×1350 (4:5) certificate card. Fixed-size print artifact — inline px
// styles throughout, same pattern as ShareCard's CardFace.
function ExcuseCardFace({ team, situationLabel, excuse, denialLevel }) {
  const corners = [
    { top: 14, left: 16 },
    { top: 14, right: 16 },
    { bottom: 14, left: 16 },
    { bottom: 14, right: 16 },
  ]

  return (
    <div
      style={{
        width: 1080,
        height: 1350,
        position: 'relative',
        overflow: 'hidden',
        background: `linear-gradient(160deg, ${team.primary} 0%, ${team.secondary} 100%)`,
        fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
        color: '#ffffff',
      }}
    >
      {/* dark scrim — same ratios as ShareCard so text survives light kits */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(180deg, rgba(9,9,11,0.30) 0%, rgba(9,9,11,0.55) 45%, rgba(9,9,11,0.88) 100%)',
        }}
      />

      <div
        style={{
          position: 'relative',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          padding: '52px 64px 48px',
        }}
      >
        {/* ── Header ── */}
        <div>
          <h1
            style={{
              fontFamily: "'Anton', 'Arial Narrow', sans-serif",
              fontSize: 88,
              fontWeight: 400,
              textTransform: 'uppercase',
              lineHeight: 1.0,
              margin: 0,
              letterSpacing: 2,
              textShadow: '0 4px 24px rgba(9,9,11,0.85)',
            }}
          >
            OFFICIAL EXCUSE
          </h1>

          <div
            style={{
              fontFamily: "'Anton', 'Arial Narrow', sans-serif",
              fontSize: 20,
              fontWeight: 400,
              textTransform: 'uppercase',
              letterSpacing: 7,
              color: 'rgba(255,255,255,0.45)',
              marginTop: 10,
            }}
          >
            ISSUED IN DEFENCE OF
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 20,
              marginTop: 14,
            }}
          >
            <Flag team={team} size="md" eager className="rounded" style={{ height: 46, width: 'auto' }} />
            <span
              style={{
                fontFamily: "'Anton', 'Arial Narrow', sans-serif",
                fontSize: 58,
                fontWeight: 400,
                textTransform: 'uppercase',
                color: '#fb923c',
                textShadow: '0 0 40px rgba(251,146,60,0.45)',
              }}
            >
              {team.name}
            </span>
          </div>
        </div>

        {/* decorative rule */}
        <div
          style={{
            height: 2,
            background: 'rgba(255,255,255,0.18)',
            marginTop: 22,
          }}
        />

        {/* ── Certificate frame — flex-1 fills remaining height ── */}
        <div
          style={{
            flex: 1,
            position: 'relative',
            marginTop: 28,
            border: '2px solid rgba(255,255,255,0.58)',
            padding: 12,
          }}
        >
          {/* inner border + content */}
          <div
            style={{
              height: '100%',
              position: 'relative',
              border: '1px solid rgba(255,255,255,0.22)',
              padding: '44px 56px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {/* corner ornaments */}
            {corners.map((pos, i) => (
              <span
                key={i}
                style={{
                  position: 'absolute',
                  fontSize: 24,
                  color: 'rgba(255,255,255,0.38)',
                  lineHeight: 1,
                  userSelect: 'none',
                  ...pos,
                }}
              >
                ✦
              </span>
            ))}

            {/* situation badge */}
            <div
              style={{
                fontFamily: "'Anton', 'Arial Narrow', sans-serif",
                fontSize: 19,
                textTransform: 'uppercase',
                letterSpacing: 6,
                color: 'rgba(255,255,255,0.40)',
                marginBottom: 32,
                textAlign: 'center',
              }}
            >
              {situationLabel}
            </div>

            {/* excuse text — Anton uppercase, large, centered */}
            <p
              style={{
                fontFamily: "'Anton', 'Arial Narrow', sans-serif",
                fontSize: 48,
                fontWeight: 400,
                textTransform: 'uppercase',
                lineHeight: 1.22,
                margin: 0,
                textAlign: 'center',
                textShadow: '0 2px 16px rgba(0,0,0,0.55)',
              }}
            >
              {excuse}
            </p>
          </div>

          {/* CERTIFIED COPE stamp — absolute bottom-right, bleeds outside inner border */}
          <div
            style={{
              position: 'absolute',
              right: 44,
              bottom: -26,
              transform: 'rotate(12deg)',
              border: '4px solid rgba(251,146,60,0.88)',
              borderRadius: 6,
              padding: '12px 38px 16px',
              textAlign: 'center',
              color: 'rgba(251,146,60,0.92)',
              background: 'rgba(9,9,11,0.72)',
              boxShadow: '0 0 32px rgba(251,146,60,0.18)',
            }}
          >
            <div
              style={{
                fontFamily: "'Anton', 'Arial Narrow', sans-serif",
                fontSize: 19,
                fontWeight: 400,
                letterSpacing: 7,
              }}
            >
              CERTIFIED
            </div>
            <div
              style={{
                fontFamily: "'Anton', 'Arial Narrow', sans-serif",
                fontSize: 60,
                fontWeight: 400,
                lineHeight: 1.0,
              }}
            >
              COPE
            </div>
          </div>
        </div>

        {/* ── Denial Level ── */}
        <div style={{ marginTop: 52 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              justifyContent: 'space-between',
              marginBottom: 14,
            }}
          >
            <span
              style={{
                fontFamily: "'Anton', 'Arial Narrow', sans-serif",
                fontSize: 25,
                fontWeight: 400,
                letterSpacing: 5,
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.50)',
              }}
            >
              DENIAL LEVEL
            </span>
            <span
              style={{
                fontFamily: "'Anton', 'Arial Narrow', sans-serif",
                fontSize: 90,
                fontWeight: 400,
                lineHeight: 1,
                color: '#fb923c',
              }}
            >
              {denialLevel}
              <span style={{ fontSize: 38, color: 'rgba(255,255,255,0.32)' }}> /100</span>
            </span>
          </div>

          <div
            style={{
              height: 18,
              background: 'rgba(255,255,255,0.10)',
              borderRadius: 9,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${denialLevel}%`,
                background: 'linear-gradient(90deg, #f97316, #ef4444)',
                borderRadius: 9,
              }}
            />
          </div>
        </div>

        {/* watermark — baked into the pixels, non-removable */}
        <div
          style={{
            position: 'absolute',
            right: 48,
            bottom: 36,
            fontFamily: "'Anton', 'Arial Narrow', sans-serif",
            fontSize: 32,
            fontWeight: 400,
            letterSpacing: 1,
            color: 'rgba(255,255,255,0.85)',
          }}
        >
          {copy.shareCard.watermark}
        </div>
      </div>
    </div>
  )
}

// 1080×1920 (9:16) Stories variant — same certificate styling, recomposed for
// the taller canvas: bigger type, more breathing room, ≥250px top/bottom safe
// margins so Instagram's username header and reply bar never overlap the text.
function ExcuseStoryFace({ team, situationLabel, excuse, denialLevel }) {
  const corners = [
    { top: 14, left: 16 },
    { top: 14, right: 16 },
    { bottom: 14, left: 16 },
    { bottom: 14, right: 16 },
  ]

  return (
    <div
      style={{
        width: 1080,
        height: 1920,
        position: 'relative',
        overflow: 'hidden',
        background: `linear-gradient(160deg, ${team.primary} 0%, ${team.secondary} 100%)`,
        fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
        color: '#ffffff',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background:
            'linear-gradient(180deg, rgba(9,9,11,0.30) 0%, rgba(9,9,11,0.55) 45%, rgba(9,9,11,0.88) 100%)',
        }}
      />

      {/* content column sits inside the Stories safe area */}
      <div
        style={{
          position: 'relative',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          padding: '260px 72px 308px',
        }}
      >
        {/* ── Header ── */}
        <div>
          <h1
            style={{
              fontFamily: "'Anton', 'Arial Narrow', sans-serif",
              fontSize: 94,
              fontWeight: 400,
              textTransform: 'uppercase',
              lineHeight: 1.0,
              margin: 0,
              letterSpacing: 2,
              textShadow: '0 4px 24px rgba(9,9,11,0.85)',
            }}
          >
            OFFICIAL EXCUSE
          </h1>

          <div
            style={{
              fontFamily: "'Anton', 'Arial Narrow', sans-serif",
              fontSize: 22,
              fontWeight: 400,
              textTransform: 'uppercase',
              letterSpacing: 7,
              color: 'rgba(255,255,255,0.45)',
              marginTop: 12,
            }}
          >
            ISSUED IN DEFENCE OF
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 20,
              marginTop: 14,
            }}
          >
            <Flag team={team} size="md" eager className="rounded" style={{ height: 50, width: 'auto' }} />
            <span
              style={{
                fontFamily: "'Anton', 'Arial Narrow', sans-serif",
                fontSize: 62,
                fontWeight: 400,
                textTransform: 'uppercase',
                color: '#fb923c',
                textShadow: '0 0 40px rgba(251,146,60,0.45)',
              }}
            >
              {team.name}
            </span>
          </div>
        </div>

        {/* decorative rule */}
        <div
          style={{
            height: 2,
            background: 'rgba(255,255,255,0.18)',
            marginTop: 24,
          }}
        />

        {/* ── Certificate frame — flex-1 fills remaining height ── */}
        <div
          style={{
            flex: 1,
            position: 'relative',
            marginTop: 30,
            border: '2px solid rgba(255,255,255,0.58)',
            padding: 12,
          }}
        >
          <div
            style={{
              height: '100%',
              position: 'relative',
              border: '1px solid rgba(255,255,255,0.22)',
              padding: '48px 56px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            {corners.map((pos, i) => (
              <span
                key={i}
                style={{
                  position: 'absolute',
                  fontSize: 26,
                  color: 'rgba(255,255,255,0.38)',
                  lineHeight: 1,
                  userSelect: 'none',
                  ...pos,
                }}
              >
                ✦
              </span>
            ))}

            <div
              style={{
                fontFamily: "'Anton', 'Arial Narrow', sans-serif",
                fontSize: 21,
                textTransform: 'uppercase',
                letterSpacing: 6,
                color: 'rgba(255,255,255,0.40)',
                marginBottom: 36,
                textAlign: 'center',
              }}
            >
              {situationLabel}
            </div>

            <p
              style={{
                fontFamily: "'Anton', 'Arial Narrow', sans-serif",
                fontSize: 52,
                fontWeight: 400,
                textTransform: 'uppercase',
                lineHeight: 1.24,
                margin: 0,
                textAlign: 'center',
                textShadow: '0 2px 16px rgba(0,0,0,0.55)',
              }}
            >
              {excuse}
            </p>
          </div>

          {/* CERTIFIED COPE stamp — absolute bottom-right, bleeds outside inner border */}
          <div
            style={{
              position: 'absolute',
              right: 44,
              bottom: -28,
              transform: 'rotate(12deg)',
              border: '4px solid rgba(251,146,60,0.88)',
              borderRadius: 6,
              padding: '13px 42px 18px',
              textAlign: 'center',
              color: 'rgba(251,146,60,0.92)',
              background: 'rgba(9,9,11,0.72)',
              boxShadow: '0 0 32px rgba(251,146,60,0.18)',
            }}
          >
            <div
              style={{
                fontFamily: "'Anton', 'Arial Narrow', sans-serif",
                fontSize: 21,
                fontWeight: 400,
                letterSpacing: 7,
              }}
            >
              CERTIFIED
            </div>
            <div
              style={{
                fontFamily: "'Anton', 'Arial Narrow', sans-serif",
                fontSize: 64,
                fontWeight: 400,
                lineHeight: 1.0,
              }}
            >
              COPE
            </div>
          </div>
        </div>

        {/* ── Denial Level ── */}
        <div style={{ marginTop: 56 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              justifyContent: 'space-between',
              marginBottom: 14,
            }}
          >
            <span
              style={{
                fontFamily: "'Anton', 'Arial Narrow', sans-serif",
                fontSize: 27,
                fontWeight: 400,
                letterSpacing: 5,
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.50)',
              }}
            >
              DENIAL LEVEL
            </span>
            <span
              style={{
                fontFamily: "'Anton', 'Arial Narrow', sans-serif",
                fontSize: 98,
                fontWeight: 400,
                lineHeight: 1,
                color: '#fb923c',
              }}
            >
              {denialLevel}
              <span style={{ fontSize: 40, color: 'rgba(255,255,255,0.32)' }}> /100</span>
            </span>
          </div>

          <div
            style={{
              height: 20,
              background: 'rgba(255,255,255,0.10)',
              borderRadius: 10,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${denialLevel}%`,
                background: 'linear-gradient(90deg, #f97316, #ef4444)',
                borderRadius: 10,
              }}
            />
          </div>
        </div>
      </div>

      {/* watermark — sized up for full-screen, kept inside the bottom safe area */}
      <div
        style={{
          position: 'absolute',
          right: 64,
          bottom: 252,
          fontFamily: "'Anton', 'Arial Narrow', sans-serif",
          fontSize: 40,
          fontWeight: 400,
          letterSpacing: 1,
          color: 'rgba(255,255,255,0.85)',
        }}
      >
        {copy.shareCard.watermark}
      </div>
    </div>
  )
}

export default function ExcuseCard({ team, situationLabel, excuse, denialLevel }) {
  const masterRef = useRef(null)
  const storyRef = useRef(null)
  const previewBoxRef = useRef(null)
  const [previewScale, setPreviewScale] = useState(0)
  const [busy, setBusy] = useState('') // '' | 'feed' | 'story'
  const [feedback, setFeedback] = useState('')

  useLayoutEffect(() => {
    const box = previewBoxRef.current
    if (!box) return
    const update = () => setPreviewScale(box.clientWidth / 1080)
    update()
    const ro = new ResizeObserver(update)
    ro.observe(box)
    return () => ro.disconnect()
  }, [])

  const run = async (format) => {
    setBusy(format)
    setFeedback('')
    try {
      const el = format === 'story' ? storyRef.current : masterRef.current
      const result = await shareOrDownloadCard(el, {
        format,
        fileName: FILE_NAMES[format],
        shareText: copy.excuseCard.shareText,
      })
      if (result === 'downloaded') setFeedback(copy.shareCard.downloaded)
      window.plausible?.('card_download', { props: { format } })
    } catch (err) {
      if (err?.name !== 'AbortError') setFeedback(copy.shareCard.shareFailed)
    } finally {
      setBusy('')
    }
  }

  const props = { team, situationLabel, excuse, denialLevel }

  return (
    <section className="flex flex-col gap-4">
      {/* off-screen export masters — DOM render is cheap; html2canvas only runs
          when a share button is tapped, so neither format is rasterized early */}
      <div style={{ position: 'absolute', left: -9999, top: 0 }} aria-hidden="true">
        <div ref={masterRef}>
          <ExcuseCardFace {...props} />
        </div>
        <div ref={storyRef}>
          <ExcuseStoryFace {...props} />
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
            <ExcuseCardFace {...props} />
          </div>
        )}
      </div>

      {/* stacked full-width on mobile = thumb-friendly; row on larger screens */}
      <div className="mx-auto flex w-full max-w-sm flex-col gap-3 sm:max-w-none sm:flex-row sm:justify-center">
        <button
          type="button"
          disabled={!!busy}
          onClick={() => run('feed')}
          className="rounded-xl bg-orange-500 px-7 py-4 font-display text-lg uppercase tracking-wide text-zinc-950 shadow-[0_0_24px] shadow-orange-500/30 hover:bg-orange-400 disabled:opacity-50 disabled:shadow-none"
        >
          {busy === 'feed' ? copy.shareCard.downloading : copy.buttons.shareFeed}
        </button>
        <button
          type="button"
          disabled={!!busy}
          onClick={() => run('story')}
          className="rounded-xl bg-zinc-700 px-7 py-4 font-display text-lg uppercase tracking-wide text-zinc-100 hover:bg-zinc-600 disabled:opacity-50"
        >
          {busy === 'story' ? copy.shareCard.downloading : copy.buttons.shareStory}
        </button>
      </div>
      {feedback && <p className="text-center text-sm text-zinc-400">{feedback}</p>}
      <SocialShareLinks
        text={copy.excuseCard.shareText}
        url={`${copy.siteUrl}/excuse`}
      />
    </section>
  )
}
