import { useState } from 'react'
import { useLocalStorage } from './hooks/useLocalStorage'
import TranscriptStudio from './components/TranscriptStudio'
import ScriptViewer from './components/ScriptViewer'

/**
 * Tarantino — Simplified Flow
 *
 * Screen 1: TranscriptStudio
 *   - Drop transcript .txt files (or paste them)
 *   - Write a short story brief (title, direction, tone, duration)
 *   - Hit "Generate"
 *
 * Screen 2: ScriptViewer
 *   - AI reads all transcripts, finds the story, crafts the screenplay
 *   - Renders it beautifully with chapters, dialogue, narration, tool demos
 *   - "Back to Studio" to tweak and regenerate
 */
export default function App() {
  const [transcripts, setTranscripts] = useLocalStorage('transcripts', [])
  const [storyBrief, setStoryBrief] = useLocalStorage('storyBrief', {
    title: '',
    direction: '',
    tone: 'Mix of raw + inspiring',
    duration: '20-30 min',
    additionalNotes: '',
  })
  const [script, setScript] = useLocalStorage('generatedScript', null)
  const [view, setView] = useState(script ? 'script' : 'studio')

  const handleGenerate = () => {
    setScript(null) // clear old script so ScriptViewer auto-generates
    setView('script')
  }

  const handleBackToStudio = () => {
    setScript(null)
    setView('studio')
  }

  const resetProject = () => {
    if (window.confirm('Reset entire project? This clears all transcripts and scripts.')) {
      setTranscripts([])
      setStoryBrief({
        title: '',
        direction: '',
        tone: 'Mix of raw + inspiring',
        duration: '20-30 min',
        additionalNotes: '',
      })
      setScript(null)
      setView('studio')
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
                Tarantino
              </span>
              <span className="ml-2 font-mono text-[10px] font-semibold tracking-widest text-forge-gold/60">
                TRANSCRIPT STUDIO
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {view === 'script' && (
              <button
                onClick={handleBackToStudio}
                className="rounded-lg border border-white/10 px-4 py-2 text-[13px] text-white/40 transition hover:border-white/20 hover:text-white/60"
              >
                ← Studio
              </button>
            )}
            <div className="flex gap-0.5 rounded-xl bg-black/30 p-1.5">
              <span
                className={`rounded-lg px-4 py-2 text-[13px] font-medium transition-all ${
                  view === 'studio'
                    ? 'bg-gradient-to-br from-forge-gold to-forge-gold-dark text-forge-black'
                    : 'text-white/30'
                }`}
              >
                01 Transcripts & Brief
              </span>
              <span
                className={`rounded-lg px-4 py-2 text-[13px] font-medium transition-all ${
                  view === 'script'
                    ? 'bg-gradient-to-br from-forge-gold to-forge-gold-dark text-forge-black'
                    : 'text-white/30'
                }`}
              >
                02 Documentary Script
              </span>
            </div>
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

      {/* Content */}
      <main>
        {view === 'studio' && (
          <TranscriptStudio
            transcripts={transcripts}
            setTranscripts={setTranscripts}
            storyBrief={storyBrief}
            setStoryBrief={setStoryBrief}
            onGenerate={handleGenerate}
          />
        )}

        {view === 'script' && (
          <ScriptViewer
            transcripts={transcripts}
            storyBrief={storyBrief}
            script={script}
            setScript={(s) => {
              setScript(s)
              if (!s) setView('studio')
            }}
          />
        )}
      </main>
    </div>
  )
}
