import { useEffect } from 'react'
import { useAIGeneration } from '../hooks/useAIGeneration'
import { buildScriptPrompt } from '../prompts/scriptGeneration'
import { TypewriterText, Spinner, ErrorState } from './ui/common'

export default function ScriptGeneration({
  answers,
  script,
  setScript,
  onComplete,
}) {
  const { data, isLoading, error, generate } = useAIGeneration(buildScriptPrompt)

  useEffect(() => {
    if (!script && !isLoading) {
      generate(answers).then((result) => {
        if (result) setScript(result)
      })
    }
  }, [])

  const handleRegenerate = async () => {
    const result = await generate(answers)
    if (result) setScript(result)
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center gap-6">
        <Spinner />
        <div className="max-w-md text-center text-[15px] text-white/50">
          <TypewriterText text="Your assistant directors are developing the script... analyzing story arc, planning interviews, structuring acts..." />
        </div>
      </div>
    )
  }

  if (error) {
    return <ErrorState message={error} onRetry={handleRegenerate} />
  }

  const s = script
  if (!s) return null

  return (
    <div className="mx-auto max-w-[900px] px-5 py-10">
      {/* Header */}
      <div className="mb-10">
        <h1 className="font-display text-3xl font-normal text-forge-cream">
          {s.title}
        </h1>
        <p className="mt-2 font-body text-base italic text-white/45">
          {s.logline}
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <span className="rounded-full bg-forge-gold/10 px-3 py-1 font-mono text-xs text-forge-gold">
            ⏱ {s.total_duration_estimate}
          </span>
          <span className="rounded-full bg-forge-gold/10 px-3 py-1 font-mono text-xs text-forge-gold">
            🎬 {s.acts?.length || 0} Acts
          </span>
        </div>
      </div>

      {/* Opening Hook */}
      {s.opening_hook && (
        <div className="mb-8 rounded-r-xl border-l-[3px] border-forge-gold bg-forge-gold/5 px-6 py-5">
          <div className="mb-2 font-body text-[11px] font-semibold uppercase tracking-widest text-forge-gold">
            Opening Hook — First 30 Seconds
          </div>
          <p className="text-[15px] leading-relaxed text-white/75">
            {s.opening_hook}
          </p>
        </div>
      )}

      {/* Acts */}
      {s.acts?.map((act) => (
        <div
          key={act.act_number}
          className="mb-9 overflow-hidden rounded-2xl border border-white/5 bg-white/[0.01]"
        >
          {/* Act Header */}
          <div className="border-b border-white/5 bg-white/[0.01] px-6 py-5">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-mono text-[11px] font-semibold text-forge-gold">
                  ACT {act.act_number}
                </span>
                <h3 className="mt-1 font-display text-xl font-normal text-forge-cream">
                  {act.act_title}
                </h3>
              </div>
              <span className="font-mono text-xs text-white/30">
                {act.duration_estimate}
              </span>
            </div>
            <p className="mt-2 text-sm text-white/45">{act.purpose}</p>
          </div>

          {/* Scenes */}
          {act.scenes?.map((scene) => (
            <div
              key={scene.scene_number}
              className="border-b border-white/[0.03] px-6 py-5"
            >
              <div className="mb-3 flex items-baseline gap-3">
                <span className="min-w-[32px] font-mono text-xs font-semibold text-forge-gold/50">
                  {scene.scene_number}
                </span>
                <div>
                  <h4 className="text-base font-semibold text-forge-cream">
                    {scene.scene_title}
                  </h4>
                  <p className="mt-1 text-sm leading-relaxed text-white/55">
                    {scene.description}
                  </p>
                </div>
              </div>

              <div className="ml-11 mt-3 grid grid-cols-2 gap-3">
                {scene.interview_subjects?.length > 0 && (
                  <DetailBox
                    icon="🎤"
                    label="Interview"
                    items={scene.interview_subjects}
                  />
                )}
                {scene.b_roll_suggestions?.length > 0 && (
                  <DetailBox
                    icon="📹"
                    label="B-Roll"
                    items={scene.b_roll_suggestions}
                  />
                )}
                {scene.sample_interview_questions?.length > 0 && (
                  <DetailBox
                    icon="💬"
                    label="Interview Questions"
                    items={scene.sample_interview_questions}
                    numbered
                    fullWidth
                  />
                )}
                {scene.narration_notes && (
                  <div className="col-span-full rounded-lg bg-white/[0.015] p-3">
                    <div className="mb-1.5 font-body text-[10px] font-bold uppercase tracking-widest text-forge-gold/60">
                      🎙 Narration / Text Overlay
                    </div>
                    <div className="text-[13px] italic text-white/55">
                      {scene.narration_notes}
                    </div>
                  </div>
                )}
              </div>

              {scene.mood && (
                <div className="ml-11 mt-2 font-mono text-xs text-white/25">
                  Mood: {scene.mood}
                </div>
              )}
            </div>
          ))}
        </div>
      ))}

      {/* Interview Guide */}
      {s.interview_guide?.length > 0 && (
        <div className="mb-9">
          <h2 className="mb-4 font-display text-xl font-normal text-forge-cream">
            Interview Guide
          </h2>
          {s.interview_guide.map((ig, i) => (
            <div
              key={i}
              className="mb-3 rounded-xl border border-white/5 bg-white/[0.01] p-5"
            >
              <div className="mb-3 flex items-center justify-between">
                <h4 className="text-base font-semibold text-forge-gold">
                  {ig.subject}
                </h4>
                {ig.emotional_beats && (
                  <span className="rounded-full bg-forge-gold/5 px-2.5 py-0.5 text-[11px] text-forge-gold/60">
                    {ig.emotional_beats}
                  </span>
                )}
              </div>
              {ig.focus_areas?.length > 0 && (
                <div className="mb-3">
                  <div className="mb-1.5 text-[10px] font-bold uppercase tracking-widest text-white/30">
                    Focus Areas
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {ig.focus_areas.map((f, j) => (
                      <span
                        key={j}
                        className="rounded-md bg-white/[0.03] px-2.5 py-0.5 text-xs text-white/45"
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {ig.key_questions?.map((q, j) => (
                <div key={j} className="py-1 text-[13px] text-white/55">
                  {j + 1}. {q}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Style & Sound */}
      <div className="mb-9 grid grid-cols-2 gap-4">
        {s.visual_style_guide && (
          <InfoCard icon="🎨" label="Visual Style Guide" text={s.visual_style_guide} />
        )}
        {s.music_and_sound_notes && (
          <InfoCard icon="🎵" label="Music & Sound" text={s.music_and_sound_notes} />
        )}
      </div>

      {/* Closing Image */}
      {s.closing_image && (
        <div className="mb-9 rounded-r-xl border-l-[3px] border-forge-gold bg-forge-gold/5 px-6 py-5">
          <div className="mb-2 font-body text-[11px] font-semibold uppercase tracking-widest text-forge-gold">
            Closing Image
          </div>
          <p className="text-[15px] leading-relaxed text-white/75">
            {s.closing_image}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-center gap-3">
        <button
          onClick={handleRegenerate}
          className="rounded-lg border border-white/15 px-6 py-3 text-sm text-white/55 transition hover:border-white/25"
        >
          ↻ Regenerate Script
        </button>
        <button
          onClick={onComplete}
          className="rounded-lg bg-gradient-to-br from-forge-gold to-forge-gold-dark px-7 py-3 text-sm font-semibold text-forge-black"
        >
          Proceed to Footage Review →
        </button>
      </div>
    </div>
  )
}

function DetailBox({ icon, label, items, numbered, fullWidth }) {
  return (
    <div
      className={`rounded-lg bg-white/[0.015] p-3 ${fullWidth ? 'col-span-full' : ''}`}
    >
      <div className="mb-1.5 font-body text-[10px] font-bold uppercase tracking-widest text-forge-gold/60">
        {icon} {label}
      </div>
      {items.map((item, i) => (
        <div key={i} className="py-0.5 text-[13px] text-white/55">
          {numbered ? `${i + 1}. ${item}` : item}
        </div>
      ))}
    </div>
  )
}

function InfoCard({ icon, label, text }) {
  return (
    <div className="rounded-xl border border-white/5 bg-white/[0.01] p-5">
      <div className="mb-2 font-body text-[11px] font-semibold uppercase tracking-widest text-forge-gold">
        {icon} {label}
      </div>
      <p className="text-sm leading-relaxed text-white/55">{text}</p>
    </div>
  )
}
