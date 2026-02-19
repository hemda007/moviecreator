import { useState } from 'react'
import { useLocalStorage } from './hooks/useLocalStorage'
import PhaseNav from './components/PhaseNav'
import StoryDevelopment from './components/StoryDevelopment'
import ScriptGeneration from './components/ScriptGeneration'
import FootageReview from './components/FootageReview'
import ScreenplayEdit from './components/ScreenplayEdit'

export const PHASES = {
  STORY_DEVELOPMENT: 'story_development',
  SCRIPT_GENERATION: 'script_generation',
  FOOTAGE_REVIEW: 'footage_review',
  SCREENPLAY_EDIT: 'screenplay_edit',
}

export default function App() {
  const [phase, setPhase] = useLocalStorage('phase', PHASES.STORY_DEVELOPMENT)
  const [completedPhases, setCompletedPhases] = useLocalStorage('completedPhases', [])
  const [answers, setAnswers] = useLocalStorage('answers', {})
  const [script, setScript] = useLocalStorage('script', null)
  const [footage, setFootage] = useLocalStorage('footage', [])
  const [screenplay, setScreenplay] = useLocalStorage('screenplay', null)

  const completePhase = (currentPhase, nextPhase) => {
    if (!completedPhases.includes(currentPhase)) {
      setCompletedPhases([...completedPhases, currentPhase])
    }
    setPhase(nextPhase)
  }

  const resetProject = () => {
    if (window.confirm('Reset entire project? This will clear all data.')) {
      setPhase(PHASES.STORY_DEVELOPMENT)
      setCompletedPhases([])
      setAnswers({})
      setScript(null)
      setFootage([])
      setScreenplay(null)
    }
  }

  return (
    <div className="min-h-screen bg-forge-black text-forge-cream font-body">
      {/* Top Bar */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-black/50 backdrop-blur-xl">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <span className="text-xl">🎬</span>
            <div>
              <span className="text-base font-semibold tracking-tight">
                DocuForge
              </span>
              <span className="ml-2 font-mono text-[10px] font-semibold tracking-widest text-forge-gold/60">
                CODEBASICS INTERNAL
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <PhaseNav
              currentPhase={phase}
              onPhaseChange={setPhase}
              completedPhases={completedPhases}
            />
            <button
              onClick={resetProject}
              className="rounded px-2 py-1 font-mono text-[10px] text-white/20 transition hover:text-red-400"
              title="Reset project"
            >
              RESET
            </button>
          </div>
        </div>
      </header>

      {/* Phase Content */}
      <main>
        {phase === PHASES.STORY_DEVELOPMENT && (
          <StoryDevelopment
            answers={answers}
            setAnswers={setAnswers}
            onComplete={() =>
              completePhase(PHASES.STORY_DEVELOPMENT, PHASES.SCRIPT_GENERATION)
            }
          />
        )}

        {phase === PHASES.SCRIPT_GENERATION && (
          <ScriptGeneration
            answers={answers}
            script={script}
            setScript={setScript}
            onComplete={() =>
              completePhase(PHASES.SCRIPT_GENERATION, PHASES.FOOTAGE_REVIEW)
            }
          />
        )}

        {phase === PHASES.FOOTAGE_REVIEW && (
          <FootageReview
            footage={footage}
            setFootage={setFootage}
            onComplete={() =>
              completePhase(PHASES.FOOTAGE_REVIEW, PHASES.SCREENPLAY_EDIT)
            }
          />
        )}

        {phase === PHASES.SCREENPLAY_EDIT && (
          <ScreenplayEdit
            script={script}
            footage={footage}
            screenplay={screenplay}
            setScreenplay={setScreenplay}
          />
        )}
      </main>
    </div>
  )
}
