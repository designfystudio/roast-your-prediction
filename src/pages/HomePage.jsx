import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { copy } from '../data/copy'

// Styled placeholder until an email provider is chosen (CLAUDE-v2: provider TBD).
function EmailSlot() {
  return (
    <section className="rounded-xl border border-dashed border-zinc-800 bg-zinc-900/50 p-5 text-center">
      <h3 className="font-display text-lg uppercase tracking-wide text-zinc-300">{copy.home.emailSlot.title}</h3>
      <div className="mx-auto mt-3 flex max-w-sm gap-2">
        <input
          type="email"
          disabled
          placeholder={copy.home.emailSlot.placeholder}
          className="min-w-0 flex-1 rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2.5 text-sm placeholder:text-zinc-600"
        />
        <button
          type="button"
          disabled
          className="rounded-lg bg-zinc-800 px-4 py-2.5 font-display text-sm uppercase tracking-wide text-zinc-500"
        >
          {copy.home.emailSlot.button}
        </button>
      </div>
      <p className="mt-2 text-xs text-zinc-600">{copy.home.emailSlot.note}</p>
    </section>
  )
}

export default function HomePage() {
  useEffect(() => {
    document.title = copy.titles.home
  }, [])

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-8 px-4 pt-10">
      <header className="text-center">
        <h1 className="font-display text-5xl uppercase leading-[0.95] text-lime-400 sm:text-7xl">
          {copy.home.headline}
        </h1>
        <p className="mt-3 text-lg italic text-zinc-400">{copy.home.promise}</p>
      </header>

      <main className="flex flex-col gap-4">
        <Link
          to="/roast"
          className="group rounded-xl border border-zinc-800 border-t-4 border-t-lime-400 bg-zinc-900 p-6 transition hover:border-zinc-700 hover:shadow-[0_0_24px] hover:shadow-lime-400/20"
        >
          <h2 className="font-display text-2xl uppercase tracking-wide text-zinc-100 group-hover:text-lime-400">
            {copy.home.roastTool.name}
          </h2>
          <p className="mt-2 text-zinc-400">{copy.home.roastTool.pitch}</p>
          <p className="mt-3 text-sm italic text-zinc-500">{copy.home.roastTool.sample}</p>
          <span className="mt-4 inline-block font-display text-lg uppercase tracking-wide text-lime-400">
            {copy.home.roastTool.cta}
          </span>
        </Link>

        <div className="rounded-xl border border-zinc-800 border-t-4 border-t-orange-500 bg-zinc-900 p-6 opacity-70">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="font-display text-2xl uppercase tracking-wide text-zinc-100">
              {copy.home.excuseTool.name}
            </h2>
            <span className="rounded-full bg-orange-500/15 px-3 py-1 font-display text-xs uppercase tracking-wider text-orange-400">
              {copy.home.excuseTool.badge}
            </span>
          </div>
          <p className="mt-2 text-zinc-400">{copy.home.excuseTool.pitch}</p>
          <p className="mt-3 text-sm italic text-zinc-500">{copy.home.excuseTool.sample}</p>
        </div>

        <EmailSlot />
      </main>
    </div>
  )
}
