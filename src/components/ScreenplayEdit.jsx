import { useEffect } from 'react'
import { useAIGeneration } from '../hooks/useAIGeneration'
import { buildScreenplayPrompt } from '../prompts/screenplayGeneration'
import { TypewriterText, Spinner, ErrorState } from './ui/common'

const CUT_COLORS = {
  interview: {
    border: 'border-forge-interview/30',
    badge: 'bg-forge-interview/10 text-forge-interview',
  },
  broll: {
    border: 'border-forge-broll/30',
    badge: 'bg-forge-broll/10 text-forge-broll',
  },
  narration: {
    border: 'border-forge-narration/30',
    badge: 'bg-forge-narration/10 text-forge-narration',
  },
  title_card: {
    border: 'border-forge-titlecard/30',
    badge: 'bg-forge-titlecard/10 text-forge-titlecard',
  },
  montage: {
    border: 'border-forge-montage/30',
    badge: 'bg-forge-montage/10 text-forge-montage',
  },
  transition: {
    border: 'border-white/20',
    badge: 'bg-white/5 text-white/50',
  },
}

export default function ScreenplayEdit({
  script,
  footage,
  screenplay,
  setScreenplay,
}) {
  const { isLoading, error, generate } = useAIGeneration(buildScreenplayPrompt)

  useEffect(() => {
    if (!screenplay && !isLoading) {
      generate(script, footage).then((result) => {
        if (result) setScreenplay(result)
      })
    }
  }, [])

  const handleRegenerate = async () => {
    const result = await generate(script, footage)
    if (result) setScreenplay(result)
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-6">
        <Spinner />
        <div className="max-w-md text-center text-[15px] text-white/50">
          <TypewriterText text="Analyzing your footage against the script structure... mapping interview clips to scenes... crafting edit instructions..." />
        </div>
      </div>
    )
  }

  if (error) {
    return <ErrorState message={error} onRetry={handleRegenerate} />
  }

  const sp = screenplay
  if (!sp) return null

  return (
    <div className="mx-auto max-w-[960px] px-5 py-10">
      {/* Header */}
      <div className="mb-9">
        <h1 className="font-display text-3xl font-normal text-forge-cream">
          {sp.screenplay_title}
        </h1>
        <div className="mt-2 font-mono text-[13px] text-white/35">
          Estimated Runtime: {sp.total_runtime_estimate}
        </div>
      </div>

      {/* Editor Letter */}
      {sp.editor_summary && (
        <div className="mb-9 rounded-[14px] border border-forge-gold/15 bg-forge-gold/[0.03] p-6">
          <div className="mb-3 font-body text-[11px] font-semibold uppercase tracking-widest text-forge-gold">
            📝 Letter to the Editor
          </div>
          <p className="text-[15px] italic leading-relaxed text-white/70">
            {sp.editor_summary}
          </p>
        </div>
      )}

      {/* Sequences */}
      {sp.sequences?.map((seq) => (
        <div
          key={seq.sequence_number}
          className="mb-7 overflow-hidden rounded-2xl border border-white/5 bg-white/[0.01]"
        >
          <div className="flex items-center justify-between border-b border-white/5 bg-white/[0.01] px-5 py-4">
            <div>
              <span className="font-mono text-[11px] font-semibold text-forge-gold">
                SEQ {seq.sequence_number}
              </span>
              <h3 className="mt-0.5 font-display text-xl font-normal text-forge-cream">
                {seq.sequence_title}
              </h3>
            </div>
            <span className="font-mono text-xs text-white/25">
              ~{seq.duration_estimate}
            </span>
          </div>

          {/* Cuts */}
          {seq.cuts?.map((cut, ci) => {
            const colors = CUT_COLORS[cut.type] || CUT_COLORS.transition
            return (
              <div
                key={ci}
                className={`border-b border-white/[0.02] border-l-[3px] ${colors.border} px-5 py-4`}
              >
                <div className="mb-2 flex items-center gap-2.5">
                  <span className="font-mono text-[11px] text-white/20">
                    {cut.cut_number}
                  </span>
                  <span
                    className={`rounded px-2 py-0.5 font-body text-[10px] font-bold uppercase tracking-wide ${colors.badge}`}
                  >
                    {cut.type?.replace('_', ' ')}
                  </span>
                  {cut.source_clip && (
                    <span className="text-xs text-white/35">
                      ← {cut.source_clip}
                    </span>
                  )}
                  {cut.timecode_suggestion && (
                    <span className="font-mono text-[11px] text-white/20">
                      [{cut.timecode_suggestion}]
                    </span>
                  )}
                </div>

                <div className="mb-1 text-sm leading-relaxed text-white/65">
                  <strong className="text-[11px] font-semibold text-white/35">
                    VIDEO:{' '}
                  </strong>
                  {cut.description}
                </div>

                {cut.audio && (
                  <div className="text-[13px] leading-snug text-white/45">
                    <strong className="text-[11px] font-semibold text-white/25">
                      AUDIO:{' '}
                    </strong>
                    {cut.audio}
                  </div>
                )}

                {cut.text_overlay && (
                  <div className="mt-1.5 rounded-md bg-forge-titlecard/5 px-3 py-1.5 font-mono text-[13px] text-forge-titlecard">
                    TEXT: {cut.text_overlay}
                  </div>
                )}

                {cut.editing_notes && (
                  <div className="mt-1.5 font-mono text-xs italic text-forge-narration/50">
                    ✂ {cut.editing_notes}
                  </div>
                )}

                {cut.transition && (
                  <div className="mt-1 font-mono text-[11px] text-white/15">
                    → {cut.transition}
                  </div>
                )}
              </div>
            )
          })}

          {/* Sequence notes */}
          {(seq.pacing_notes || seq.music_cue) && (
            <div className="flex gap-5 bg-white/[0.005] px-5 py-3">
              {seq.pacing_notes && (
                <div className="flex-1 text-xs text-white/30">
                  <strong className="text-forge-gold/40">Pacing:</strong>{' '}
                  {seq.pacing_notes}
                </div>
              )}
              {seq.music_cue && (
                <div className="flex-1 text-xs text-white/30">
                  <strong className="text-forge-gold/40">Music:</strong>{' '}
                  {seq.music_cue}
                </div>
              )}
            </div>
          )}
        </div>
      ))}

      {/* Post-production */}
      <div className="mb-7 grid grid-cols-2 gap-4">
        {sp.color_grading_notes && (
          <PostCard icon="🎨" label="Color Grading" text={sp.color_grading_notes} />
        )}
        {sp.sound_design_notes && (
          <PostCard icon="🔊" label="Sound Design" text={sp.sound_design_notes} />
        )}
      </div>

      {sp.graphics_needed?.length > 0 && (
        <div className="mb-4 rounded-xl border border-white/5 bg-white/[0.01] p-5">
          <div className="mb-2 font-body text-[11px] font-semibold uppercase tracking-widest text-forge-gold">
            🖼 Graphics To Create
          </div>
          {sp.graphics_needed.map((g, i) => (
            <div key={i} className="py-0.5 text-[13px] text-white/50">
              • {g}
            </div>
          ))}
        </div>
      )}

      {sp.missing_footage_notes?.length > 0 && (
        <div className="mb-7 rounded-xl border border-red-400/15 bg-red-400/[0.02] p-5">
          <div className="mb-2 font-body text-[11px] font-semibold uppercase tracking-widest text-red-400">
            ⚠ Missing Footage
          </div>
          {sp.missing_footage_notes.map((m, i) => (
            <div key={i} className="py-0.5 text-[13px] text-white/50">
              • {m}
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-center">
        <button
          onClick={handleRegenerate}
          className="rounded-lg border border-white/15 px-6 py-3 text-sm text-white/55 transition hover:border-white/25"
        >
          ↻ Regenerate Screenplay
        </button>
      </div>
    </div>
  )
}

function PostCard({ icon, label, text }) {
  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.01] p-5">
      <div className="mb-2 font-body text-[11px] font-semibold uppercase tracking-widest text-forge-gold">
        {icon} {label}
      </div>
      <p className="text-[13px] leading-relaxed text-white/50">{text}</p>
    </div>
  )
}
