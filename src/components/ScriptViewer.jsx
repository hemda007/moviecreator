import { useEffect } from 'react'
import { useAIGeneration } from '../hooks/useAIGeneration'
import { buildTranscriptScriptPrompt } from '../prompts/scriptFromTranscripts'
import { TypewriterText, Spinner, ErrorState } from './ui/common'

export default function ScriptViewer({
  transcripts,
  storyBrief,
  script,
  setScript,
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
        <button
          onClick={handleRegenerate}
          className="rounded-lg border border-white/10 px-4 py-2 text-sm text-white/40 transition hover:border-white/20 hover:text-white/60"
        >
          ↻ Regenerate
        </button>
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
          </div>

          {/* Beats */}
          <div className="px-6 py-4">
            {chapter.beats?.map((beat, bi) => (
              <Beat key={bi} beat={beat} />
            ))}
          </div>
        </div>
      ))}

      {/* Production Notes */}
      {script.production_notes && (
        <div className="mb-10 space-y-4">
          <SectionLabel icon="📋" label="Production Notes" />

          {script.production_notes.editors_note && (
            <div className="rounded-xl border border-forge-gold/15 bg-forge-gold/[0.03] p-6">
              <div className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-forge-gold">
                📝 Editor's Note
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
                💻 Screen Recordings Needed
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
                ⚠ Missing Footage
              </div>
              {script.production_notes.missing_footage.map((m, i) => (
                <div key={i} className="py-0.5 text-[13px] text-white/45">
                  • {m}
                </div>
              ))}
            </div>
          )}

          {script.production_notes.additional_interviews_needed?.length > 0 && (
            <div className="rounded-xl border border-forge-narration/15 bg-forge-narration/[0.02] p-5">
              <div className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-forge-narration">
                🎤 Additional Interviews Suggested
              </div>
              {script.production_notes.additional_interviews_needed.map(
                (m, i) => (
                  <div key={i} className="py-0.5 text-[13px] text-white/45">
                    • {m}
                  </div>
                )
              )}
            </div>
          )}
        </div>
      )}

      {/* Bottom Actions */}
      <div className="mt-12 flex justify-center gap-3">
        <button
          onClick={handleRegenerate}
          className="rounded-xl border border-white/15 px-6 py-3.5 text-sm text-white/50 transition hover:border-white/25"
        >
          ↻ Regenerate Script
        </button>
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
            💻 Screen Recording: {beat.tool_name}
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
