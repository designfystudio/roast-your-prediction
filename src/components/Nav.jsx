import { Link, NavLink } from 'react-router-dom'
import { copy } from '../data/copy'

// Shared top bar across all tools. Two items don't need a hamburger.
export default function Nav() {
  return (
    <nav className="border-b border-zinc-900 bg-zinc-950/90 backdrop-blur">
      <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
        <Link to="/" className="font-display text-lg uppercase tracking-wide text-zinc-100 hover:text-lime-400">
          {copy.nav.brand}
        </Link>
        <div className="flex items-center gap-2">
          <NavLink
            to="/roast"
            className={({ isActive }) =>
              `rounded-lg px-3 py-1.5 font-display text-sm uppercase tracking-wider transition-colors ${
                isActive ? 'bg-lime-400/15 text-lime-400' : 'text-zinc-400 hover:text-zinc-100'
              }`
            }
          >
            {copy.nav.roast}
          </NavLink>
          {/* not a link until the excuse tool ships */}
          <span className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 font-display text-sm uppercase tracking-wider text-zinc-600">
            {copy.nav.excuse}
            <span className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] text-zinc-400">{copy.nav.soon}</span>
          </span>
        </div>
      </div>
    </nav>
  )
}
