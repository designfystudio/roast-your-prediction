import { useEffect, useState } from 'react'
import { getTeam } from '../data/teams'
import { copy } from '../data/copy'
import { requestRoast } from '../lib/api'
import PredictionForm from '../components/PredictionForm'
import RoastCard from '../components/RoastCard'
import ShareCard from '../components/ShareCard'
import Flag from '../components/Flag'

// Dev-only: /roast?cardtest=1 skips the form and renders a fixture result so a
// headless browser can exercise the share-card export. Tree-shaken in prod.
const CARD_TEST =
  import.meta.env.DEV && new URLSearchParams(window.location.search).has('cardtest')
const TEST_FIXTURE = {
  picks: {
    championId: 'argentina',
    runnerUpId: 'france',
    topScorer: 'Lautaro Martínez',
    darkHorseId: 'morocco',
    firstBigOutId: 'england',
  },
  roast: {
    roast:
      "Argentina retaining with France runners-up again — you've predicted a rerun and called it analysis. Morocco as a dark horse stopped being brave in 2022, and England out first isn't a hot take, it's a national pastime.",
    courageRating: 4.2,
  },
}

export default function RoastPage() {
  const [phase, setPhase] = useState(CARD_TEST ? 'result' : 'form') // 'form' | 'loading' | 'result' | 'error'
  const [picks, setPicks] = useState(CARD_TEST ? TEST_FIXTURE.picks : null)
  const [roast, setRoast] = useState(CARD_TEST ? TEST_FIXTURE.roast : null) // { roast, courageRating }
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    document.title = copy.titles.roast
  }, [])

  const doRoast = async (submittedPicks) => {
    setPhase('loading')
    try {
      const result = await requestRoast(submittedPicks)
      setRoast(result)
      setPhase('result')
    } catch (err) {
      setErrorMsg(err.message || copy.errors.roastFailed)
      setPhase('error')
    }
  }

  const handleSubmit = (submittedPicks) => {
    setPicks(submittedPicks)
    doRoast(submittedPicks)
  }

  const reset = () => {
    setPicks(null)
    setRoast(null)
    setErrorMsg('')
    setPhase('form')
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col px-4 pt-8">
      <header className="mb-8 text-center">
        <h1 className="font-display text-5xl uppercase leading-[0.95] text-lime-400 sm:text-7xl">
          {copy.app.title}
        </h1>
        <p className="mt-3 text-lg italic text-zinc-400">{copy.app.tagline}</p>
      </header>

      <main className="flex-1">
        {phase === 'form' && <PredictionForm onSubmit={handleSubmit} />}

        {phase === 'loading' && (
          <div className="flex flex-col items-center gap-5 py-20">
            <div className="animate-bounce text-6xl">⚽</div>
            <p className="font-display text-xl uppercase tracking-wide text-zinc-300">{copy.loading.line}</p>
          </div>
        )}

        {phase === 'error' && (
          <div className="flex flex-col items-center gap-4 py-20 text-center">
            <p className="text-zinc-300">{copy.errors.roastFailed}</p>
            <p className="text-sm text-zinc-500">{errorMsg}</p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => doRoast(picks)}
                className="rounded-xl bg-lime-400 px-8 py-4 font-display text-lg uppercase tracking-wide text-zinc-950 shadow-[0_0_24px] shadow-lime-400/30 hover:bg-lime-300"
              >
                {copy.buttons.tryAgain}
              </button>
              <button
                type="button"
                onClick={reset}
                className="rounded-xl px-4 py-4 font-semibold text-zinc-400 hover:text-zinc-100"
              >
                {copy.buttons.startOver}
              </button>
            </div>
          </div>
        )}

        {phase === 'result' && picks && roast && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-wrap justify-center gap-2 text-sm">
              {[
                { label: copy.steps.three.championChip, team: getTeam(picks.championId) },
                { label: copy.steps.three.runnerUpChip, team: getTeam(picks.runnerUpId) },
                { label: copy.steps.three.darkHorseChip, team: getTeam(picks.darkHorseId) },
                { label: copy.steps.three.firstBigOutChip, team: getTeam(picks.firstBigOutId) },
              ].map(({ label, team }) => (
                <span key={label} className="inline-flex items-center gap-1.5 rounded-full bg-zinc-900 px-3 py-1">
                  <span className="text-zinc-500">{label}:</span>
                  <Flag team={team} size="sm" className="h-3.5 w-auto rounded-sm" />
                  {team.name}
                </span>
              ))}
              <span className="rounded-full bg-zinc-900 px-3 py-1">
                <span className="text-zinc-500">{copy.steps.three.topScorerChip}:</span> ⚽ {picks.topScorer}
              </span>
            </div>

            <RoastCard roast={roast.roast} courageRating={roast.courageRating} />

            <ShareCard
              picks={picks}
              roast={roast.roast}
              courageRating={roast.courageRating}
              autoExportTest={CARD_TEST}
            />

            <div className="flex justify-center gap-3">
              <button
                type="button"
                onClick={() => doRoast(picks)}
                className="rounded-xl bg-orange-500 px-8 py-4 font-display text-lg uppercase tracking-wide text-zinc-950 shadow-[0_0_24px] shadow-orange-500/30 hover:bg-orange-400"
              >
                {copy.buttons.roastAgain}
              </button>
              <button
                type="button"
                onClick={reset}
                className="rounded-xl px-4 py-4 font-semibold text-zinc-400 hover:text-zinc-100"
              >
                {copy.buttons.startOver}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
