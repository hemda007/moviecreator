import { useState, useRef } from 'react'

/**
 * TranscriptStudio — Phase 1 replacement for transcript-driven documentaries.
 *
 * Instead of 15 AD questions + footage clips, this gives the director:
 *   1. A place to bulk-add transcripts (paste or drag .txt files)
 *   2. A simple story brief (title, direction, tone)
 *   3. A "Generate Script" button
 */
export default function TranscriptStudio({
  transcripts,
  setTranscripts,
  storyBrief,
  setStoryBrief,
  onGenerate,
}) {
  const [activeTab, setActiveTab] = useState('transcripts') // 'transcripts' | 'brief'
  const [pasteMode, setPasteMode] = useState(null) // null | index being edited
  const [pasteName, setPasteName] = useState('')
  const [pasteText, setPasteText] = useState('')
  const fileInputRef = useRef(null)
  const dropRef = useRef(null)
  const [dragOver, setDragOver] = useState(false)

  // ─── FILE HANDLING ───
  const handleFiles = async (files) => {
    const newTranscripts = []
    for (const file of files) {
      if (file.name.endsWith('.txt') || file.type === 'text/plain') {
        const text = await file.text()
        const name = file.name.replace(/\.txt$/i, '').replace(/[_-]/g, ' ')
        newTranscripts.push({ name, transcript: text })
      }
    }
    if (newTranscripts.length > 0) {
      setTranscripts([...transcripts, ...newTranscripts])
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    handleFiles(e.dataTransfer.files)
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = () => setDragOver(false)

  const addPastedTranscript = () => {
    if (!pasteName.trim() || !pasteText.trim()) return
    setTranscripts([...transcripts, { name: pasteName.trim(), transcript: pasteText.trim() }])
    setPasteName('')
    setPasteText('')
    setPasteMode(null)
  }

  const removeTranscript = (index) => {
    setTranscripts(transcripts.filter((_, i) => i !== index))
  }

  const updateBrief = (field, value) => {
    setStoryBrief({ ...storyBrief, [field]: value })
  }

  const canGenerate = transcripts.length >= 2 && storyBrief.direction?.trim()

  return (
    <div className="mx-auto max-w-[960px] px-5 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-[32px] font-normal text-forge-cream">
          Transcript Studio
        </h1>
        <p className="mt-2 text-[15px] text-white/40">
          Drop your interview transcripts, give a rough story direction, and let
          AI craft the documentary script.
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 rounded-xl bg-black/30 p-1.5">
        <TabButton
          active={activeTab === 'transcripts'}
          onClick={() => setActiveTab('transcripts')}
          count={transcripts.length}
          label="Transcripts"
        />
        <TabButton
          active={activeTab === 'brief'}
          onClick={() => setActiveTab('brief')}
          label="Story Brief"
          dot={!storyBrief.direction}
        />
      </div>

      {/* ═══ TRANSCRIPTS TAB ═══ */}
      {activeTab === 'transcripts' && (
        <div className="animate-fade-in">
          {/* Drop Zone */}
          <div
            ref={dropRef}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`mb-5 cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-all ${
              dragOver
                ? 'border-forge-gold bg-forge-gold/5'
                : 'border-white/10 hover:border-forge-gold/30'
            }`}
          >
            <div className="mb-2 text-3xl">{dragOver ? '📂' : '📄'}</div>
            <div className="text-[15px] text-white/50">
              {dragOver
                ? 'Drop .txt files here...'
                : 'Drag & drop .txt transcript files here, or click to browse'}
            </div>
            <div className="mt-1 text-xs text-white/20">
              One file per person. Filename becomes the speaker name.
            </div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".txt,text/plain"
              onChange={(e) => handleFiles(e.target.files)}
              className="hidden"
            />
          </div>

          {/* Or Paste */}
          {pasteMode === null ? (
            <button
              onClick={() => setPasteMode('new')}
              className="mb-6 text-sm text-forge-gold/50 transition hover:text-forge-gold"
            >
              + Or paste a transcript manually
            </button>
          ) : (
            <div className="mb-6 rounded-xl border border-forge-gold/20 bg-white/[0.01] p-5">
              <input
                type="text"
                value={pasteName}
                onChange={(e) => setPasteName(e.target.value)}
                placeholder="Speaker name (e.g., Naveen)"
                className="mb-3 w-full rounded-lg border border-white/[0.06] bg-white/[0.02] px-3.5 py-2.5 text-sm text-forge-cream placeholder-white/20"
              />
              <textarea
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
                placeholder="Paste the full transcript here..."
                rows={8}
                className="mb-3 w-full resize-y rounded-lg border border-white/[0.06] bg-white/[0.02] p-3.5 text-sm leading-relaxed text-forge-cream placeholder-white/20"
              />
              <div className="flex gap-2">
                <button
                  onClick={addPastedTranscript}
                  disabled={!pasteName.trim() || !pasteText.trim()}
                  className="rounded-lg bg-forge-gold/20 px-4 py-2 text-sm font-semibold text-forge-gold transition hover:bg-forge-gold/30 disabled:opacity-30"
                >
                  Add Transcript
                </button>
                <button
                  onClick={() => {
                    setPasteMode(null)
                    setPasteName('')
                    setPasteText('')
                  }}
                  className="rounded-lg px-4 py-2 text-sm text-white/30 transition hover:text-white/50"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Transcript List */}
          {transcripts.length > 0 && (
            <div className="space-y-2">
              <div className="mb-3 flex items-center justify-between">
                <span className="font-mono text-[11px] font-semibold uppercase tracking-widest text-forge-gold/60">
                  {transcripts.length} Transcript{transcripts.length !== 1 ? 's' : ''} Loaded
                </span>
                <span className="font-mono text-[11px] text-white/20">
                  {Math.round(
                    transcripts.reduce((sum, t) => sum + t.transcript.length, 0) / 1000
                  )}k characters total
                </span>
              </div>

              {transcripts.map((t, i) => (
                <TranscriptCard
                  key={i}
                  name={t.name}
                  preview={t.transcript}
                  wordCount={t.transcript.split(/\s+/).length}
                  onRemove={() => removeTranscript(i)}
                />
              ))}
            </div>
          )}

          {transcripts.length === 0 && (
            <div className="mt-10 text-center">
              <div className="text-4xl opacity-20">🎙</div>
              <div className="mt-3 text-sm text-white/20">
                No transcripts yet. Drop some files or paste them manually.
              </div>
            </div>
          )}
        </div>
      )}

      {/* ═══ STORY BRIEF TAB ═══ */}
      {activeTab === 'brief' && (
        <div className="animate-fade-in space-y-5">
          <BriefField
            label="Working Title"
            placeholder="e.g., Everybody Is A Builder"
            value={storyBrief.title || ''}
            onChange={(v) => updateBrief('title', v)}
          />

          <div>
            <label className="mb-1.5 block font-body text-[11px] font-bold uppercase tracking-widest text-forge-gold/60">
              Story Direction
              <span className="font-normal text-white/20">
                {' '}— What is this documentary about? What story do you want to tell?
              </span>
            </label>
            <textarea
              value={storyBrief.direction || ''}
              onChange={(e) => updateBrief('direction', e.target.value)}
              placeholder="e.g., This is the story of how a 20-person education company transformed into an AI-first company in 45 days. The CEO sent an email that shook the team. Some were scared, some skeptical, some excited. Within weeks, non-tech people were building real products. Focus on the emotional journey — the fear, the breakthroughs, the butterflies."
              rows={5}
              className="w-full resize-y rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-[15px] leading-relaxed text-forge-cream placeholder-white/15"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block font-body text-[11px] font-bold uppercase tracking-widest text-forge-gold/60">
                Tone
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  'Raw & honest',
                  'Cinematic & dramatic',
                  'Inspirational',
                  'Behind-the-scenes',
                  'Mix of raw + inspiring',
                ].map((tone) => (
                  <button
                    key={tone}
                    onClick={() => updateBrief('tone', tone)}
                    className={`rounded-lg border px-3.5 py-2 text-[13px] transition ${
                      storyBrief.tone === tone
                        ? 'border-forge-gold bg-forge-gold/10 text-forge-gold'
                        : 'border-white/10 text-white/40 hover:border-white/20'
                    }`}
                  >
                    {tone}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-1.5 block font-body text-[11px] font-bold uppercase tracking-widest text-forge-gold/60">
                Duration
              </label>
              <div className="flex flex-wrap gap-2">
                {['10-15 min', '20-30 min', '30-45 min', '45-60 min'].map(
                  (dur) => (
                    <button
                      key={dur}
                      onClick={() => updateBrief('duration', dur)}
                      className={`rounded-lg border px-3.5 py-2 text-[13px] transition ${
                        storyBrief.duration === dur
                          ? 'border-forge-gold bg-forge-gold/10 text-forge-gold'
                          : 'border-white/10 text-white/40 hover:border-white/20'
                      }`}
                    >
                      {dur}
                    </button>
                  )
                )}
              </div>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block font-body text-[11px] font-bold uppercase tracking-widest text-forge-gold/60">
              Anything Else?
              <span className="font-normal text-white/20">
                {' '}— Key people, moments to highlight, things to avoid
              </span>
            </label>
            <textarea
              value={storyBrief.additionalNotes || ''}
              onChange={(e) => updateBrief('additionalNotes', e.target.value)}
              placeholder="e.g., Dhaval (co-founder) should appear early — he discovered Claude Code first. Hem walked 20km in Varanasi at midnight before writing the email. Include tool demo placeholders wherever people mention building something specific."
              rows={4}
              className="w-full resize-y rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 text-[15px] leading-relaxed text-forge-cream placeholder-white/15"
            />
          </div>
        </div>
      )}

      {/* ═══ GENERATE BUTTON ═══ */}
      <div className="mt-10 flex items-center justify-between rounded-2xl border border-white/5 bg-white/[0.01] px-6 py-5">
        <div>
          <div className="text-sm text-white/50">
            {transcripts.length === 0
              ? '⚠ Add at least 2 transcripts'
              : !storyBrief.direction?.trim()
                ? '⚠ Add a story direction in the Brief tab'
                : `✓ ${transcripts.length} transcripts ready • Story brief set`}
          </div>
        </div>
        <button
          onClick={onGenerate}
          disabled={!canGenerate}
          className={`rounded-xl px-8 py-4 text-[15px] font-semibold transition-all ${
            canGenerate
              ? 'bg-gradient-to-br from-forge-gold to-forge-gold-dark text-forge-black hover:shadow-lg hover:shadow-forge-gold/20'
              : 'cursor-not-allowed bg-white/5 text-white/20'
          }`}
        >
          🎬 Generate Documentary Script
        </button>
      </div>
    </div>
  )
}

// ─── SUB-COMPONENTS ───

function TabButton({ active, onClick, label, count, dot }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 rounded-lg px-5 py-2.5 text-[13px] font-medium transition-all ${
        active
          ? 'bg-gradient-to-br from-forge-gold to-forge-gold-dark text-forge-black'
          : 'text-white/40 hover:text-white/60'
      }`}
    >
      {label}
      {count !== undefined && (
        <span
          className={`rounded-full px-1.5 py-0.5 font-mono text-[10px] ${
            active ? 'bg-black/20 text-forge-black' : 'bg-white/5 text-white/30'
          }`}
        >
          {count}
        </span>
      )}
      {dot && (
        <span className="h-1.5 w-1.5 rounded-full bg-forge-gold/60" />
      )}
    </button>
  )
}

function TranscriptCard({ name, preview, wordCount, onRemove }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="overflow-hidden rounded-xl border border-white/5 bg-white/[0.01] transition hover:border-white/10">
      <div
        onClick={() => setExpanded(!expanded)}
        className="flex cursor-pointer items-center justify-between px-5 py-3.5"
      >
        <div className="flex items-center gap-3">
          <span className="text-lg">🎙</span>
          <span className="text-[15px] font-medium text-forge-cream">
            {name}
          </span>
          <span className="font-mono text-[11px] text-white/20">
            {wordCount.toLocaleString()} words
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onRemove()
            }}
            className="rounded px-2 py-1 text-xs text-white/15 transition hover:text-red-400"
          >
            ✕
          </button>
          <span
            className="text-white/20 transition-transform"
            style={{ transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)' }}
          >
            ⌄
          </span>
        </div>
      </div>
      {expanded && (
        <div className="border-t border-white/[0.03] px-5 py-4">
          <pre className="max-h-[300px] overflow-y-auto whitespace-pre-wrap font-mono text-xs leading-relaxed text-white/35">
            {preview.substring(0, 3000)}
            {preview.length > 3000 && '\n\n... [truncated for preview]'}
          </pre>
        </div>
      )}
    </div>
  )
}

function BriefField({ label, value, onChange, placeholder }) {
  return (
    <div>
      <label className="mb-1.5 block font-body text-[11px] font-bold uppercase tracking-widest text-forge-gold/60">
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-white/[0.06] bg-white/[0.02] px-3.5 py-3 text-[15px] text-forge-cream placeholder-white/20"
      />
    </div>
  )
}
