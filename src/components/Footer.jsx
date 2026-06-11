import { copy } from '../data/copy'

// Affiliate link is env-driven so adding/swapping a partner needs no code change:
// set VITE_AFFILIATE_URL (+ optional VITE_AFFILIATE_LABEL) in Vercel env settings
// (or .env.local for local testing). Vite inlines VITE_* vars at build time, so
// the link is absent from the bundle entirely when unset.
const AFFILIATE_URL = import.meta.env.VITE_AFFILIATE_URL
const AFFILIATE_LABEL = import.meta.env.VITE_AFFILIATE_LABEL || copy.footer.affiliateFallbackLabel

function YouTubeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden="true">
      <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3 3 0 0 0 .5 6.2 31.3 31.3 0 0 0 0 12a31.3 31.3 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.9.6 9.4.6 9.4.6s7.5 0 9.4-.6a3 3 0 0 0 2.1-2.1A31.3 31.3 0 0 0 24 12a31.3 31.3 0 0 0-.5-5.8zM9.6 15.6V8.4L15.8 12l-6.2 3.6z" />
    </svg>
  )
}

export default function Footer() {
  return (
    <footer className="mt-12 flex flex-col items-center gap-3 pb-8 text-center text-xs text-zinc-600">
      <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2">
        <a
          href={copy.footer.youtube.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 font-semibold text-zinc-400 transition-colors hover:text-red-500"
        >
          <YouTubeIcon />
          {copy.footer.youtube.label}
        </a>
        {AFFILIATE_URL && (
          <a
            href={AFFILIATE_URL}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="font-semibold text-zinc-400 transition-colors hover:text-lime-400"
          >
            {AFFILIATE_LABEL}
          </a>
        )}
      </div>
      <span>{copy.footer.kofi}</span>
      <span>{copy.footer.disclaimer}</span>
    </footer>
  )
}
