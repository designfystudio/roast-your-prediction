import { copy } from '../data/copy'

export default function Footer() {
  return (
    <footer className="mt-12 flex flex-col items-center gap-2 pb-8 text-center text-xs text-zinc-600">
      <span>{copy.footer.kofi}</span>
      <span>{copy.footer.disclaimer}</span>
    </footer>
  )
}
