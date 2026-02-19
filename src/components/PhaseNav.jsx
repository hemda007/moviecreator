import { PHASES } from '../App'

const PHASE_LABELS = {
  [PHASES.STORY_DEVELOPMENT]: 'Story Development',
  [PHASES.SCRIPT_GENERATION]: 'Script & Structure',
  [PHASES.FOOTAGE_REVIEW]: 'Footage Review',
  [PHASES.SCREENPLAY_EDIT]: 'Screenplay & Edit',
}

const phaseOrder = Object.values(PHASES)

export default function PhaseNav({ currentPhase, onPhaseChange, completedPhases }) {
  return (
    <div className="flex gap-0.5 rounded-xl bg-black/30 p-1.5 backdrop-blur-md">
      {phaseOrder.map((phase, i) => {
        const isActive = phase === currentPhase
        const isCompleted = completedPhases.includes(phase)
        const prevPhase = phaseOrder[i - 1]
        const isLocked =
          !isCompleted &&
          phase !== currentPhase &&
          i > 0 &&
          !completedPhases.includes(prevPhase) &&
          prevPhase !== currentPhase

        return (
          <button
            key={phase}
            onClick={() => !isLocked && onPhaseChange(phase)}
            disabled={isLocked}
            className={`rounded-lg px-4 py-2 font-body text-[13px] transition-all duration-300 ${
              isActive
                ? 'bg-gradient-to-br from-forge-gold to-forge-gold-dark font-bold text-forge-black'
                : isCompleted
                  ? 'bg-forge-gold/10 font-medium text-forge-gold'
                  : 'font-medium text-white/30'
            } ${isLocked ? 'cursor-not-allowed opacity-40' : 'cursor-pointer'}`}
          >
            <span className="mr-1.5 text-[11px]">
              {isCompleted ? '✓' : `0${i + 1}`}
            </span>
            {PHASE_LABELS[phase]}
          </button>
        )
      })}
    </div>
  )
}
