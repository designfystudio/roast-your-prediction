import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { teams } from '../data/teams'
import { copy } from '../data/copy'
import { requestExcuse } from '../lib/api'
import TeamPicker from '../components/TeamPicker'
import Flag from '../components/Flag'

const SITUATIONS = [
  { id: 'lost', label: 'Lost' },
  { id: 'drew-minnow', label: 'Drew with a minnow' },
  { id: 'humiliated', label: 'Got humiliated' },
  { id: 'ref-robbery', label: 'Ref robbery' },
  { id: 'didnt-qualify', label: "Didn't even qualify" },
]

function DenialMeter({ level }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between">
        <span className="font-display text-sm uppercase tracking-wider text-zinc-500">
          {copy.excuse.result.denialLabel}
        </span>
        <span className="font-display text-5xl text-orange-400">
          {level}
          <span className="text-2xl text-zinc-500">/100</span>
        </span>
      </div>
      <div className="h-4 w-full overflow-hidden rounded-full bg-zinc-800">
        <div
          className="h-full rounded-full bg-gradient-to-r from-orange-500 to-red-500"
          style={{ width: `${level}%` }}
        />
      </div>
    </div>
  )
}

export default function ExcusePage() {
  const [step, setStep] = useState(1)
  const [teamId, setTeamId] = useState(null)
  const [situation, setSituation] = useState(null)
  const [opponentId, setOpponentId] = useState(null)
  const [phase, setPhase] = useState('form') // 'form' | 'loading' | 'result' | 'error'
  const [result, setResult] = useState(null) // { excuse, denialLevel }
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    document.title = copy.titles.excuse
  }, [])

  useEffect(() => {
    if (situation === 'didnt-qualify') setOpponentId(null)
  }, [situation])

  const team = teams.find((t) => t.id === teamId)

  const doExcuse = async () => {
    setPhase('loading')
    try {
      const payload = { teamId, situation }
      if (opponentId) payload.opponentId = opponentId
      const data = await requestExcuse(payload)
      setResult(data)
      setPhase('result')
    } catch (err) {
      setErrorMsg(err.message || copy.excuse.errors.failed)
      setPhase('error')
    }
  }

  const reset = () => {
    setStep(1)
    setTeamId(null)
    setSituation(null)
    setOpponentId(null)
    setPhase('form')
    setResult(null)
    setErrorMsg('')
  }

  return (
    <div className="mx-auto flex max-w-2xl flex-col px-4 pt-8 pb-12">
      <header className="mb-8 text-center">
        <h1 className="font-display text-5xl uppercase leading-[0.95] text-orange-400 sm:text-7xl">
          {copy.excuse.title}
        </h1>
        <p className="mt-3 text-lg italic text-zinc-400">{copy.excuse.tagline}</p>
      </header>

      <main className="flex-1">
        {phase === 'form' && (
          <div className="flex flex-col gap-8">
            {step === 1 && (
              <section className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <h2 className="font-display text-xl uppercase tracking-wide text-zinc-300">
                    {copy.excuse.steps.one.title}
                  </h2>
                  <p className="text-sm text-zinc-500">{copy.excuse.steps.one.label}</p>
                </div>
                <TeamPicker teams={teams} selectedId={teamId} onSelect={setTeamId} />
                <div className="flex justify-end">
                  <button
                    type="button"
                    disabled={!teamId}
                    onClick={() => setStep(2)}
                    className="rounded-xl bg-orange-500 px-8 py-3 font-display text-lg uppercase tracking-wide text-zinc-950 shadow-[0_0_24px] shadow-orange-500/30 hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {copy.buttons.next}
                  </button>
                </div>
              </section>
            )}

            {step === 2 && (
              <section className="flex flex-col gap-6">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-sm text-zinc-500 hover:text-zinc-300"
                  >
                    {copy.buttons.back}
                  </button>
                  {team && (
                    <span className="inline-flex items-center gap-2 rounded-full bg-zinc-900 px-3 py-1.5 text-sm text-zinc-200">
                      <Flag team={team} size="sm" className="h-4 w-auto rounded-sm" />
                      {team.name}
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1">
                    <h2 className="font-display text-xl uppercase tracking-wide text-zinc-300">
                      {copy.excuse.steps.two.title}
                    </h2>
                    <p className="text-sm text-zinc-500">{copy.excuse.steps.two.situationLabel}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {SITUATIONS.map((s) => (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setSituation(s.id)}
                        className={`rounded-lg border px-4 py-2.5 font-display text-sm uppercase tracking-wider transition-colors ${
                          situation === s.id
                            ? 'border-orange-500 bg-orange-500/15 text-orange-400'
                            : 'border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200'
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                {situation && situation !== 'didnt-qualify' && (
                  <div className="flex flex-col gap-3">
                    <p className="text-sm text-zinc-500">{copy.excuse.steps.two.opponentLabel}</p>
                    <TeamPicker
                      teams={teams}
                      selectedId={opponentId}
                      onSelect={(id) => setOpponentId(id === opponentId ? null : id)}
                      disabledIds={[teamId]}
                    />
                    {opponentId && (
                      <button
                        type="button"
                        onClick={() => setOpponentId(null)}
                        className="self-start text-xs text-zinc-600 hover:text-zinc-400"
                      >
                        {copy.excuse.steps.two.opponentSkip}
                      </button>
                    )}
                  </div>
                )}

                <button
                  type="button"
                  disabled={!situation}
                  onClick={doExcuse}
                  className="w-full rounded-xl bg-orange-500 py-4 font-display text-xl uppercase tracking-wide text-zinc-950 shadow-[0_0_24px] shadow-orange-500/30 hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {copy.excuse.buttons.defend}
                </button>
              </section>
            )}
          </div>
        )}

        {phase === 'loading' && (
          <div className="flex flex-col items-center gap-5 py-20">
            <div className="animate-bounce text-6xl">⚖️</div>
            <p className="font-display text-xl uppercase tracking-wide text-zinc-300">
              {copy.excuse.loading.line}
            </p>
          </div>
        )}

        {phase === 'error' && (
          <div className="flex flex-col items-center gap-4 py-20 text-center">
            <p className="text-zinc-300">{copy.excuse.errors.failed}</p>
            <p className="text-sm text-zinc-500">{errorMsg}</p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={doExcuse}
                className="rounded-xl bg-orange-500 px-8 py-4 font-display text-lg uppercase tracking-wide text-zinc-950 shadow-[0_0_24px] shadow-orange-500/30 hover:bg-orange-400"
              >
                {copy.buttons.tryAgain}
              </button>
              <button
                type="button"
                onClick={reset}
                className="rounded-xl px-4 py-4 font-semibold text-zinc-400 hover:text-zinc-100"
              >
                {copy.excuse.buttons.startOver}
              </button>
            </div>
          </div>
        )}

        {phase === 'result' && result && team && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full bg-zinc-900 px-3 py-1.5 text-sm text-zinc-200">
                <Flag team={team} size="sm" className="h-4 w-auto rounded-sm" />
                {team.name}
              </span>
              <span className="rounded-full bg-orange-500/15 px-3 py-1.5 font-display text-xs uppercase tracking-wider text-orange-400">
                {SITUATIONS.find((s) => s.id === situation)?.label}
              </span>
            </div>

            <div className="rounded-2xl border border-orange-500/30 bg-zinc-900/80 p-6">
              <p className="font-display text-3xl uppercase leading-tight text-zinc-100 sm:text-4xl">
                {result.excuse}
              </p>
            </div>

            <DenialMeter level={result.denialLevel} />

            <div className="flex justify-center gap-3">
              <button
                type="button"
                onClick={doExcuse}
                className="rounded-xl bg-orange-500 px-8 py-4 font-display text-lg uppercase tracking-wide text-zinc-950 shadow-[0_0_24px] shadow-orange-500/30 hover:bg-orange-400"
              >
                {copy.excuse.buttons.defendAgain}
              </button>
              <button
                type="button"
                onClick={reset}
                className="rounded-xl px-4 py-4 font-semibold text-zinc-400 hover:text-zinc-100"
              >
                {copy.excuse.buttons.startOver}
              </button>
            </div>

            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 text-center">
              <p className="text-sm text-zinc-500">Brave enough to predict the rest?</p>
              <Link
                to="/roast"
                className="mt-1 inline-block font-display text-sm uppercase tracking-wide text-lime-400 hover:text-lime-300"
              >
                Get roasted →
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
