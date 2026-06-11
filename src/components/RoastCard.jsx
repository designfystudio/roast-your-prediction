import { copy } from '../data/copy'

export default function RoastCard({ roast, courageRating }) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-zinc-800 border-t-4 border-t-lime-400 bg-zinc-900 p-6 pt-8">
      <span aria-hidden="true" className="absolute -top-3 left-3 font-display text-8xl leading-none text-zinc-800">
        “
      </span>
      <div className="relative flex flex-col gap-5">
        <p className="text-xl italic leading-relaxed text-zinc-100 sm:text-2xl">
          {roast ?? copy.result.placeholderRoast}
        </p>
        <div className="flex items-baseline gap-3">
          <span className="font-display text-sm uppercase tracking-[0.2em] text-zinc-500">
            {copy.result.courageLabel}
          </span>
          <span className="font-display text-5xl text-lime-400">{courageRating ?? '–.–'}</span>
          <span className="text-zinc-500">/ 10</span>
        </div>
      </div>
    </div>
  )
}
