import { useState } from 'react'
import { useLocalStorage } from './hooks/useLocalStorage'
import TranscriptStudio from './components/TranscriptStudio'
import ScriptViewer from './components/ScriptViewer'
import EditorCut from './components/EditorCut'

/**
 * Tarantino — 3-Phase Flow
 *
 * Screen 1: TranscriptStudio
 *   - Drop transcript .txt files (or paste them)
 *   - Write a short story brief (title, direction, tone, duration)
 *   - Hit "Generate"
 *
 * Screen 2: ScriptViewer
 *   - AI reads all transcripts, finds the story, crafts the screenplay
 *   - Renders it with chapters, dialogue, narration, music suggestions
 *   - Download as .md or .json
 *   - "Generate Editor's Cut" to proceed
 *
 * Screen 3: EditorCut
 *   - AI generates cut-by-cut editing instructions with timecodes
 *   - Text overlays, graphics, transitions, music cues
 *   - Download the editor-ready document
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
  const [editorCut, setEditorCut] = useLocalStorage('editorCut', null)
  const [view, setView] = useState(
    editorCut ? 'editor' : script ? 'script' : 'studio'
  )

  const handleGenerate = () => {
    setScript(null)
    setEditorCut(null)
    setView('script')
  }

  const handleBackToStudio = () => {
    setScript(null)
    setEditorCut(null)
    setView('studio')
  }

  const handleGenerateEditorCut = () => {
    setEditorCut(null)
    setView('editor')
  }

  const handleBackToScript = () => {
    setView('script')
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
      setEditorCut(null)
      setView('studio')
    }
  }

  const viewLabels = [
    { key: 'studio', label: '01 Transcripts & Brief' },
    { key: 'script', label: '02 Documentary Script' },
    { key: 'editor', label: '03 Editor\'s Cut' },
  ]

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
                {view === 'studio'
                  ? 'TRANSCRIPT STUDIO'
                  : view === 'script'
                    ? 'SCRIPT VIEWER'
                    : "EDITOR'S CUT"}
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
            {view === 'editor' && (
              <button
                onClick={handleBackToScript}
                className="rounded-lg border border-white/10 px-4 py-2 text-[13px] text-white/40 transition hover:border-white/20 hover:text-white/60"
              >
                ← Script
              </button>
            )}
            <div className="flex gap-0.5 rounded-xl bg-black/30 p-1.5">
              {viewLabels.map((v) => (
                <span
                  key={v.key}
                  className={`rounded-lg px-4 py-2 text-[13px] font-medium transition-all ${
                    view === v.key
                      ? 'bg-gradient-to-br from-forge-gold to-forge-gold-dark text-forge-black'
                      : 'text-white/30'
                  }`}
                >
                  {v.label}
                </span>
              ))}
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
            onGenerateEditorCut={handleGenerateEditorCut}
          />
        )}

        {view === 'editor' && script && (
          <EditorCut
            script={script}
            transcripts={transcripts}
            storyBrief={storyBrief}
            editorCut={editorCut}
            setEditorCut={setEditorCut}
            onBackToScript={handleBackToScript}
          />
        )}
      </main>
    </div>
  )
}
