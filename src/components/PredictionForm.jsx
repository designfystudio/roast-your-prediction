import { useState } from 'react'
import { teams, bigTeams, getTeam } from '../data/teams'
import { copy } from '../data/copy'
import TeamPicker from './TeamPicker'
import Flag from './Flag'

const emptyPicks = {
  championId: null,
  runnerUpId: null,
  topScorer: '',
  darkHorseId: null,
  firstBigOutId: null,
}

export default function PredictionForm({ onSubmit }) {
  const [step, setStep] = useState(1)
  const [picks, setPicks] = useState(emptyPicks)

  const set = (key) => (value) => setPicks((p) => ({ ...p, [key]: value }))

  const stepValid = {
    1: picks.championId && picks.runnerUpId,
    2: picks.topScorer.trim() && picks.darkHorseId && picks.firstBigOutId,
    3: true,
  }[step]

  const summaryChips = [
    { label: copy.steps.three.championChip, team: getTeam(picks.championId) },
    { label: copy.steps.three.runnerUpChip, team: getTeam(picks.runnerUpId) },
    { label: copy.steps.three.topScorerChip, text: picks.topScorer },
    { label: copy.steps.three.darkHorseChip, team: getTeam(picks.darkHorseId) },
    { label: copy.steps.three.firstBigOutChip, team: getTeam(picks.firstBigOutId) },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <div className="flex gap-1.5">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1.5 flex-1 rounded-full transition-colors ${s <= step ? 'bg-lime-400' : 'bg-zinc-800'}`}
            />
          ))}
        </div>
        <div className="font-display text-2xl uppercase tracking-wide text-lime-400">
          {step === 1 && copy.steps.one.title}
          {step === 2 && copy.steps.two.title}
          {step === 3 && copy.steps.three.title}
        </div>
      </div>

      {step === 1 && (
        <>
          <section className="flex flex-col gap-2">
            <h2 className="text-xl font-bold tracking-tight">{copy.steps.one.championLabel}</h2>
            <TeamPicker
              teams={teams}
              selectedId={picks.championId}
              onSelect={set('championId')}
              disabledIds={picks.runnerUpId ? [picks.runnerUpId] : []}
            />
          </section>
          <section className="flex flex-col gap-2">
            <h2 className="text-xl font-bold tracking-tight">{copy.steps.one.runnerUpLabel}</h2>
            <TeamPicker
              teams={teams}
              selectedId={picks.runnerUpId}
              onSelect={set('runnerUpId')}
              disabledIds={picks.championId ? [picks.championId] : []}
            />
          </section>
        </>
      )}

      {step === 2 && (
        <>
          <section className="flex flex-col gap-2">
            <h2 className="text-xl font-bold tracking-tight">{copy.steps.two.topScorerLabel}</h2>
            <input
              type="text"
              maxLength={40}
              value={picks.topScorer}
              onChange={(e) => set('topScorer')(e.target.value)}
              placeholder={copy.steps.two.topScorerPlaceholder}
              className="rounded-xl border-2 border-zinc-800 bg-zinc-900 px-4 py-4 text-lg outline-none placeholder:text-zinc-600 focus:border-lime-400 focus:shadow-[0_0_16px] focus:shadow-lime-400/20"
            />
          </section>
          <section className="flex flex-col gap-2">
            <h2 className="text-xl font-bold tracking-tight">{copy.steps.two.darkHorseLabel}</h2>
            <TeamPicker teams={teams} selectedId={picks.darkHorseId} onSelect={set('darkHorseId')} />
          </section>
          <section className="flex flex-col gap-2">
            <h2 className="text-xl font-bold tracking-tight">{copy.steps.two.firstBigOutLabel}</h2>
            <TeamPicker teams={bigTeams} selectedId={picks.firstBigOutId} onSelect={set('firstBigOutId')} />
          </section>
        </>
      )}

      {step === 3 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-xl font-bold tracking-tight">{copy.steps.three.summaryTitle}</h2>
          <ul className="flex flex-col gap-2">
            {summaryChips.map(({ label, team, text }) => (
              <li key={label} className="flex items-center justify-between rounded-lg bg-zinc-900 px-4 py-2">
                <span className="text-xs uppercase tracking-wide text-zinc-500">{label}</span>
                <span className="flex items-center gap-2 font-semibold">
                  {team ? (
                    <>
                      <Flag team={team} size="sm" className="h-4 w-auto rounded-sm" />
                      {team.name}
                    </>
                  ) : (
                    text
                  )}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="flex items-center justify-between gap-3">
        {step > 1 ? (
          <button
            type="button"
            onClick={() => setStep(step - 1)}
            className="rounded-xl px-4 py-4 font-semibold text-zinc-400 hover:text-zinc-100"
          >
            {copy.buttons.back}
          </button>
        ) : (
          <span />
        )}
        {step < 3 ? (
          <button
            type="button"
            disabled={!stepValid}
            onClick={() => setStep(step + 1)}
            className="w-1/2 rounded-xl bg-lime-400 px-6 py-4 font-display text-lg uppercase tracking-wide text-zinc-950 shadow-[0_0_24px] shadow-lime-400/30 hover:bg-lime-300 disabled:cursor-not-allowed disabled:opacity-30 disabled:shadow-none sm:w-auto sm:px-10"
          >
            {copy.buttons.next}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onSubmit(picks)}
            className="w-2/3 rounded-xl bg-orange-500 px-6 py-4 font-display text-xl uppercase tracking-wide text-zinc-950 shadow-[0_0_28px] shadow-orange-500/40 hover:bg-orange-400 sm:w-auto sm:px-12"
          >
            {copy.buttons.roastMe}
          </button>
        )}
      </div>
    </div>
  )
}
