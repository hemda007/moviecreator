import { useEffect } from 'react'
import { useAIGeneration } from '../hooks/useAIGeneration'
import { buildTranscriptScriptPrompt } from '../prompts/scriptFromTranscripts'
import { TypewriterText, Spinner, ErrorState } from './ui/common'

// ─── DOWNLOAD HELPERS ───

function scriptToMarkdown(script) {
  let md = ''
  md += `# ${script.title}\n`
  if (script.subtitle) md += `*${script.subtitle}*\n`
  md += `\n**Duration:** ${script.total_duration_estimate}\n`
  if (script.story_summary) md += `\n> ${script.story_summary}\n`

  // Characters
  if (script.characters?.length > 0) {
    md += `\n---\n\n## Cast\n\n`
    script.characters.forEach((c) => {
      md += `### ${c.name}\n`
      md += `**Role:** ${c.role}\n`
      if (c.arc) md += `**Arc:** ${c.arc}\n`
      if (c.best_quotes?.length > 0) {
        md += `**Key Quotes:**\n`
        c.best_quotes.forEach((q) => (md += `- "${q}"\n`))
      }
      md += '\n'
    })
  }

  // Chapters
  if (script.chapters?.length > 0) {
    md += `---\n\n`
    script.chapters.forEach((chapter) => {
      const prefix =
        chapter.chapter_number > 0
          ? `## Chapter ${chapter.chapter_number}: ${chapter.chapter_title}`
          : `## ${chapter.chapter_title}`
      md += `${prefix}\n`
      md += `*~${chapter.duration_estimate}*\n`
      if (chapter.purpose) md += `\n**Purpose:** ${chapter.purpose}\n`

      // Music suggestion per chapter
      if (chapter.music_suggestion) {
        const ms = chapter.music_suggestion
        md += `\n**Music:** ${ms.mood || ''}`
        if (ms.tempo) md += ` | ${ms.tempo}`
        if (ms.instruments) md += ` | ${ms.instruments}`
        if (ms.reference) md += `\n*Ref: ${ms.reference}*`
        md += '\n'
      }

      md += '\n'

      chapter.beats?.forEach((beat) => {
        switch (beat.type) {
          case 'scene_heading':
            md += `### ${beat.content}\n\n`
            break
          case 'direction':
            md += `*[${beat.content}]*\n\n`
            break
          case 'dialogue':
            md += `**${beat.speaker}:** "${beat.content}"\n\n`
            break
          case 'narration':
            md += `> *${beat.content}*\n\n`
            break
          case 'tool_demo':
            md += `> **SCREEN RECORDING: ${beat.tool_name}** — ${beat.description}\n\n`
            break
          default:
            md += `${beat.content}\n\n`
        }
      })
    })
  }

  // Music Suggestions
  if (script.music_suggestions) {
    const ms = script.music_suggestions
    md += `---\n\n## Music & Soundtrack\n\n`
    if (ms.overall_vision) md += `**Vision:** ${ms.overall_vision}\n\n`
    if (ms.soundtrack_style) md += `**Style:** ${ms.soundtrack_style}\n\n`
    if (ms.key_moments?.length > 0) {
      md += `### Key Musical Moments\n\n`
      ms.key_moments.forEach((m) => {
        md += `- **${m.moment}** — ${m.music}\n`
      })
      md += '\n'
    }
    if (ms.recommended_genres?.length > 0) {
      md += `**Genres:** ${ms.recommended_genres.join(', ')}\n\n`
    }
    if (ms.reference_tracks?.length > 0) {
      md += `**Reference Tracks:**\n`
      ms.reference_tracks.forEach((t) => (md += `- ${t}\n`))
      md += '\n'
    }
  }

  // Production Notes
  if (script.production_notes) {
    const pn = script.production_notes
    md += `---\n\n## Production Notes\n\n`
    if (pn.editors_note) md += `### Editor's Note\n\n*${pn.editors_note}*\n\n`
    if (pn.music_direction)
      md += `**Music Direction:** ${pn.music_direction}\n\n`
    if (pn.visual_style) md += `**Visual Style:** ${pn.visual_style}\n\n`
    if (pn.missing_footage?.length > 0) {
      md += `### Missing Footage\n`
      pn.missing_footage.forEach((m) => (md += `- ${m}\n`))
      md += '\n'
    }
    if (pn.additional_interviews_needed?.length > 0) {
      md += `### Additional Interviews Needed\n`
      pn.additional_interviews_needed.forEach((m) => (md += `- ${m}\n`))
      md += '\n'
    }
  }

  return md
}

function downloadFile(content, filename, type) {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export default function ScriptViewer({
  transcripts,
  storyBrief,
  script,
  setScript,
  onGenerateEditorCut,
}) {
  const { isLoading, error, generate } = useAIGeneration(
    buildTranscriptScriptPrompt
  )

  useEffect(() => {
    if (!script && !isLoading) {
      generate(transcripts, storyBrief).then((result) => {
        if (result) setScript(result)
      })
    }
  }, [])

  const handleRegenerate = async () => {
    const result = await generate(transcripts, storyBrief)
    if (result) setScript(result)
  }

  const handleDownloadMarkdown = () => {
    const md = scriptToMarkdown(script)
    const filename = `${(script.title || 'script').replace(/[^a-zA-Z0-9 ]/g, '').replace(/\s+/g, '_')}_script.md`
    downloadFile(md, filename, 'text/markdown')
  }

  const handleDownloadJSON = () => {
    const json = JSON.stringify(script, null, 2)
    const filename = `${(script.title || 'script').replace(/[^a-zA-Z0-9 ]/g, '').replace(/\s+/g, '_')}_script.json`
    downloadFile(json, filename, 'application/json')
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[500px] flex-col items-center justify-center gap-6">
        <Spinner />
        <div className="max-w-lg text-center text-[15px] text-white/50">
          <TypewriterText text="Reading all transcripts... finding the narrative arc... selecting the most powerful quotes... structuring the screenplay..." />
        </div>
        <div className="mt-4 font-mono text-xs text-white/20">
          This takes 30-60 seconds with {transcripts.length} transcripts
        </div>
      </div>
    )
  }

  if (error) {
    return <ErrorState message={error} onRetry={handleRegenerate} />
  }

  if (!script) return null

  return (
    <div className="mx-auto max-w-[960px] px-5 py-10">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <button
          onClick={() => setScript(null)}
          className="rounded-lg border border-white/10 px-4 py-2 text-sm text-white/40 transition hover:border-white/20 hover:text-white/60"
        >
          ← Back to Studio
        </button>
        <div className="flex gap-2">
          <button
            onClick={handleDownloadMarkdown}
            className="rounded-lg border border-white/10 px-4 py-2 text-sm text-white/40 transition hover:border-white/20 hover:text-white/60"
          >
            ↓ Download .md
          </button>
          <button
            onClick={handleDownloadJSON}
            className="rounded-lg border border-white/10 px-4 py-2 text-sm text-white/40 transition hover:border-white/20 hover:text-white/60"
          >
            ↓ Download .json
          </button>
          <button
            onClick={handleRegenerate}
            className="rounded-lg border border-white/10 px-4 py-2 text-sm text-white/40 transition hover:border-white/20 hover:text-white/60"
          >
            ↻ Regenerate
          </button>
        </div>
      </div>

      {/* Title Block */}
      <div className="mb-10 border-b border-white/5 pb-8">
        <h1 className="font-display text-[40px] font-normal leading-tight text-forge-cream">
          {script.title}
        </h1>
        {script.subtitle && (
          <p className="mt-2 font-display text-lg italic text-white/40">
            {script.subtitle}
          </p>
        )}
        <div className="mt-4 flex gap-3">
          <Pill label={script.total_duration_estimate} />
          <Pill label={`${script.chapters?.length || 0} chapters`} />
          <Pill label={`${script.characters?.length || 0} voices`} />
        </div>
        {script.story_summary && (
          <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-white/45">
            {script.story_summary}
          </p>
        )}
      </div>

      {/* Characters */}
      {script.characters?.length > 0 && (
        <div className="mb-10">
          <SectionLabel icon="🎙" label="Cast" />
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
            {script.characters.map((c, i) => (
              <div
                key={i}
                className="rounded-xl border border-white/5 bg-white/[0.01] p-4"
              >
                <div className="text-[15px] font-semibold text-forge-gold">
                  {c.name}
                </div>
                <div className="mt-0.5 text-xs text-white/30">{c.role}</div>
                {c.arc && (
                  <div className="mt-2 text-[13px] italic text-white/40">
                    {c.arc}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Chapters */}
      {script.chapters?.map((chapter) => (
        <div
          key={chapter.chapter_number}
          className="mb-8 overflow-hidden rounded-2xl border border-white/5 bg-white/[0.005]"
        >
          {/* Chapter Header */}
          <div className="border-b border-white/5 bg-white/[0.01] px-6 py-5">
            <div className="flex items-center justify-between">
              <div>
                {chapter.chapter_number > 0 && (
                  <span className="font-mono text-[11px] font-semibold text-forge-gold">
                    CHAPTER {chapter.chapter_number}
                  </span>
                )}
                <h2 className="mt-0.5 font-display text-2xl font-normal text-forge-cream">
                  {chapter.chapter_title}
                </h2>
              </div>
              <span className="font-mono text-xs text-white/25">
                ~{chapter.duration_estimate}
              </span>
            </div>
            {chapter.purpose && (
              <p className="mt-2 text-sm text-white/35">{chapter.purpose}</p>
            )}

            {/* Per-chapter music suggestion */}
            {chapter.music_suggestion && (
              <div className="mt-3 flex flex-wrap gap-2">
                {chapter.music_suggestion.mood && (
                  <span className="rounded-full bg-forge-montage/10 px-2.5 py-0.5 font-mono text-[10px] text-forge-montage">
                    {chapter.music_suggestion.mood}
                  </span>
                )}
                {chapter.music_suggestion.tempo && (
                  <span className="rounded-full bg-forge-montage/10 px-2.5 py-0.5 font-mono text-[10px] text-forge-montage">
                    {chapter.music_suggestion.tempo}
                  </span>
                )}
                {chapter.music_suggestion.instruments && (
                  <span className="rounded-full bg-forge-montage/10 px-2.5 py-0.5 font-mono text-[10px] text-forge-montage">
                    {chapter.music_suggestion.instruments}
                  </span>
                )}
                {chapter.music_suggestion.reference && (
                  <span className="text-[11px] italic text-white/25">
                    Ref: {chapter.music_suggestion.reference}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Beats */}
          <div className="px-6 py-4">
            {chapter.beats?.map((beat, bi) => (
              <Beat key={bi} beat={beat} />
            ))}
          </div>
        </div>
      ))}

      {/* Music Suggestions */}
      {script.music_suggestions && (
        <div className="mb-10">
          <SectionLabel icon="🎵" label="Music & Soundtrack" />
          <div className="space-y-4">
            {script.music_suggestions.overall_vision && (
              <div className="rounded-xl border border-forge-montage/15 bg-forge-montage/[0.03] p-6">
                <div className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-forge-montage">
                  Soundtrack Vision
                </div>
                <p className="text-[15px] leading-relaxed text-white/60">
                  {script.music_suggestions.overall_vision}
                </p>
                {script.music_suggestions.soundtrack_style && (
                  <p className="mt-2 text-[13px] text-white/40">
                    Style: {script.music_suggestions.soundtrack_style}
                  </p>
                )}
              </div>
            )}

            {script.music_suggestions.key_moments?.length > 0 && (
              <div className="rounded-xl border border-white/5 bg-white/[0.01] p-5">
                <div className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-forge-montage">
                  Key Musical Moments
                </div>
                {script.music_suggestions.key_moments.map((m, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 border-b border-white/[0.03] py-2.5 last:border-0"
                  >
                    <span className="mt-0.5 font-mono text-[10px] text-forge-montage/50">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <div>
                      <div className="text-[13px] font-medium text-forge-cream">
                        {m.moment}
                      </div>
                      <div className="mt-0.5 text-[12px] text-white/40">
                        {m.music}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              {script.music_suggestions.recommended_genres?.length > 0 && (
                <div className="rounded-xl border border-white/5 bg-white/[0.01] p-5">
                  <div className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-forge-gold">
                    Genres
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {script.music_suggestions.recommended_genres.map(
                      (g, i) => (
                        <span
                          key={i}
                          className="rounded-full bg-forge-montage/10 px-3 py-1 text-[12px] text-forge-montage"
                        >
                          {g}
                        </span>
                      )
                    )}
                  </div>
                </div>
              )}

              {script.music_suggestions.reference_tracks?.length > 0 && (
                <div className="rounded-xl border border-white/5 bg-white/[0.01] p-5">
                  <div className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-forge-gold">
                    Reference Tracks
                  </div>
                  {script.music_suggestions.reference_tracks.map((t, i) => (
                    <div
                      key={i}
                      className="py-0.5 text-[13px] italic text-white/45"
                    >
                      {t}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Production Notes */}
      {script.production_notes && (
        <div className="mb-10 space-y-4">
          <SectionLabel icon="📋" label="Production Notes" />

          {script.production_notes.editors_note && (
            <div className="rounded-xl border border-forge-gold/15 bg-forge-gold/[0.03] p-6">
              <div className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-forge-gold">
                Editor's Note
              </div>
              <p className="text-[15px] italic leading-relaxed text-white/60">
                {script.production_notes.editors_note}
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            {script.production_notes.music_direction && (
              <NoteCard
                icon="🎵"
                label="Music"
                text={script.production_notes.music_direction}
              />
            )}
            {script.production_notes.visual_style && (
              <NoteCard
                icon="🎨"
                label="Visual Style"
                text={script.production_notes.visual_style}
              />
            )}
          </div>

          {script.production_notes.tools_to_demo?.length > 0 && (
            <div className="rounded-xl border border-forge-interview/15 bg-forge-interview/[0.02] p-5">
              <div className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-forge-interview">
                Screen Recordings Needed
              </div>
              {script.production_notes.tools_to_demo.map((tool, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 py-2 text-[13px]"
                >
                  <span className="mt-0.5 font-mono text-xs text-forge-interview/50">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div>
                    <span className="font-semibold text-forge-cream">
                      {tool.tool_name}
                    </span>
                    <span className="text-white/25"> — {tool.built_by}</span>
                    <div className="text-white/40">{tool.what_to_show}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {script.production_notes.missing_footage?.length > 0 && (
            <div className="rounded-xl border border-red-400/15 bg-red-400/[0.02] p-5">
              <div className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-red-400">
                Missing Footage
              </div>
              {script.production_notes.missing_footage.map((m, i) => (
                <div key={i} className="py-0.5 text-[13px] text-white/45">
                  - {m}
                </div>
              ))}
            </div>
          )}

          {script.production_notes.additional_interviews_needed?.length > 0 && (
            <div className="rounded-xl border border-forge-narration/15 bg-forge-narration/[0.02] p-5">
              <div className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-forge-narration">
                Additional Interviews Suggested
              </div>
              {script.production_notes.additional_interviews_needed.map(
                (m, i) => (
                  <div key={i} className="py-0.5 text-[13px] text-white/45">
                    - {m}
                  </div>
                )
              )}
            </div>
          )}
        </div>
      )}

      {/* Bottom Actions */}
      <div className="mt-12 flex flex-col items-center gap-4">
        {onGenerateEditorCut && (
          <button
            onClick={onGenerateEditorCut}
            className="rounded-xl bg-gradient-to-br from-forge-gold to-forge-gold-dark px-8 py-4 text-[15px] font-semibold text-forge-black transition-all hover:shadow-lg hover:shadow-forge-gold/20"
          >
            ✂ Generate Editor's Cut
          </button>
        )}
        <div className="flex gap-3">
          <button
            onClick={handleRegenerate}
            className="rounded-xl border border-white/15 px-6 py-3.5 text-sm text-white/50 transition hover:border-white/25"
          >
            ↻ Regenerate Script
          </button>
          <button
            onClick={handleDownloadMarkdown}
            className="rounded-xl border border-white/15 px-6 py-3.5 text-sm text-white/50 transition hover:border-white/25"
          >
            ↓ Download Script
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── BEAT RENDERER ───

function Beat({ beat }) {
  switch (beat.type) {
    case 'scene_heading':
      return (
        <div className="mb-2 mt-5 first:mt-0">
          <span className="font-mono text-[13px] font-bold uppercase text-forge-gold/70">
            {beat.content}
          </span>
        </div>
      )

    case 'direction':
      return (
        <div className="my-2 font-mono text-[13px] italic text-white/30">
          [{beat.content}]
        </div>
      )

    case 'dialogue':
      return (
        <div className="my-3 pl-6">
          <span className="font-body text-[13px] font-bold text-forge-interview">
            {beat.speaker}:{' '}
          </span>
          <span className="text-[14px] leading-relaxed text-white/70">
            &ldquo;{beat.content}&rdquo;
          </span>
        </div>
      )

    case 'narration':
      return (
        <div className="my-3 border-l-2 border-forge-narration/30 pl-5 text-[14px] italic leading-relaxed text-white/45">
          {beat.content}
        </div>
      )

    case 'tool_demo':
      return (
        <div className="my-4 rounded-xl border border-forge-interview/20 bg-forge-interview/[0.03] px-5 py-4 text-center">
          <div className="text-[12px] font-bold uppercase tracking-widest text-forge-interview/70">
            SCREEN RECORDING: {beat.tool_name}
          </div>
          <div className="mt-1 text-[13px] italic text-white/40">
            {beat.description}
          </div>
        </div>
      )

    default:
      return (
        <div className="my-2 text-[13px] text-white/35">{beat.content}</div>
      )
  }
}

// ─── SMALL COMPONENTS ───

function Pill({ label }) {
  return (
    <span className="rounded-full bg-forge-gold/10 px-3 py-1 font-mono text-xs text-forge-gold">
      {label}
    </span>
  )
}

function SectionLabel({ icon, label }) {
  return (
    <div className="mb-4 font-body text-[11px] font-semibold uppercase tracking-widest text-forge-gold/60">
      {icon} {label}
    </div>
  )
}

function NoteCard({ icon, label, text }) {
  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.01] p-5">
      <div className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-forge-gold">
        {icon} {label}
      </div>
      <p className="text-[13px] leading-relaxed text-white/50">{text}</p>
    </div>
  )
}
