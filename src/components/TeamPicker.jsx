import Flag from './Flag'

// Reusable flag grid. disabledIds greys out teams already picked elsewhere
// (e.g. your champion can't also be your runner-up).
// On hover-capable devices the tile flips to a big flag on the team's kit-color
// gradient. No crests/badges — flag + colors only (legal guardrail).
export default function TeamPicker({ teams, selectedId, onSelect, disabledIds = [] }) {
  return (
    <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
      {teams.map((team) => {
        const selected = team.id === selectedId
        const disabled = disabledIds.includes(team.id)
        return (
          <button
            key={team.id}
            type="button"
            disabled={disabled}
            onClick={() => onSelect(team.id)}
            className={`group relative h-16 rounded-lg border transition perspective-midrange
              ${selected ? 'scale-105 border-lime-400 ring-2 ring-lime-400 shadow-[0_0_16px] shadow-lime-400/40' : 'border-zinc-800 hover:border-zinc-600'}
              ${disabled ? 'cursor-not-allowed opacity-30' : ''}`}
          >
            <div
              className={`relative h-full w-full transition-transform duration-300 transform-3d
                ${disabled ? '' : 'group-hover:rotate-y-180'}`}
            >
              {/* front: flag + name */}
              <div
                className={`absolute inset-0 flex flex-col items-center justify-center gap-1 rounded-lg p-1 backface-hidden
                  ${selected ? 'bg-lime-400/10' : 'bg-zinc-900'}`}
              >
                <Flag team={team} size="sm" className="h-5 w-auto rounded-sm shadow" />
                <span className="w-full truncate text-center text-[10px] text-zinc-300">{team.name}</span>
              </div>
              {/* back: big flag on kit-color gradient */}
              <div
                className="absolute inset-0 flex rotate-y-180 items-center justify-center rounded-lg backface-hidden"
                style={{ background: `linear-gradient(135deg, ${team.primary}, ${team.secondary})` }}
              >
                <Flag team={team} size="md" className="h-8 w-auto rounded shadow-lg" />
              </div>
            </div>
          </button>
        )
      })}
    </div>
  )
}
