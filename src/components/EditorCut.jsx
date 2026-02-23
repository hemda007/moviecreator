import { useEffect } from 'react'
import { useAIGeneration } from '../hooks/useAIGeneration'
import { buildEditorCutPrompt } from '../prompts/editorCutPrompt'
import { TypewriterText, Spinner, ErrorState } from './ui/common'

const CUT_COLORS = {
  interview: {
    border: 'border-forge-interview/30',
    badge: 'bg-forge-interview/10 text-forge-interview',
    dot: 'bg-forge-interview',
  },
  broll: {
    border: 'border-forge-broll/30',
    badge: 'bg-forge-broll/10 text-forge-broll',
    dot: 'bg-forge-broll',
  },
  narration: {
    border: 'border-forge-narration/30',
    badge: 'bg-forge-narration/10 text-forge-narration',
    dot: 'bg-forge-narration',
  },
  title_card: {
    border: 'border-forge-titlecard/30',
    badge: 'bg-forge-titlecard/10 text-forge-titlecard',
    dot: 'bg-forge-titlecard',
  },
  montage: {
    border: 'border-forge-montage/30',
    badge: 'bg-forge-montage/10 text-forge-montage',
    dot: 'bg-forge-montage',
  },
  screen_recording: {
    border: 'border-forge-interview/30',
    badge: 'bg-forge-interview/10 text-forge-interview',
    dot: 'bg-forge-interview',
  },
  transition: {
    border: 'border-white/20',
    badge: 'bg-white/5 text-white/50',
    dot: 'bg-white/50',
  },
}

// ─── DOWNLOAD HELPERS ───

function editorCutToMarkdown(ec) {
  let md = ''
  md += `# ${ec.editor_cut_title}\n`
  md += `**${ec.version}** | Runtime: ${ec.total_runtime_estimate}\n\n`

  if (ec.editor_letter) {
    md += `---\n\n## Letter to the Editor\n\n*${ec.editor_letter}*\n\n`
  }

  // Sequences
  ec.sequences?.forEach((seq) => {
    md += `---\n\n## SEQ ${seq.sequence_number}: ${seq.sequence_title}\n`
    md += `*~${seq.duration_estimate}*\n`
    if (seq.purpose) md += `\n**Purpose:** ${seq.purpose}\n`

    if (seq.music_cue) {
      const mc = seq.music_cue
      md += `\n**Music:** ${mc.track_description || ''}`
      if (mc.entry_point) md += ` | Entry: ${mc.entry_point}`
      if (mc.dynamics) md += ` | ${mc.dynamics}`
      md += '\n'
    }

    if (seq.pacing_notes) md += `**Pacing:** ${seq.pacing_notes}\n`
    md += '\n'

    seq.cuts?.forEach((cut) => {
      md += `### Cut ${cut.cut_number} — ${(cut.type || '').replace('_', ' ').toUpperCase()}\n`
      if (cut.source)
        md += `**Source:** ${cut.source}`
      if (cut.timecode_in && cut.timecode_out)
        md += ` [${cut.timecode_in} → ${cut.timecode_out}]`
      if (cut.duration) md += ` (${cut.duration})`
      md += '\n'

      md += `**VIDEO:** ${cut.description}\n`
      if (cut.audio) md += `**AUDIO:** ${cut.audio}\n`

      // Text overlay
      const overlay = cut.text_overlay
      if (overlay && overlay.text) {
        md += `**TEXT OVERLAY:** "${overlay.text}" — ${overlay.type || ''}, ${overlay.position || ''}, ${overlay.style || ''}\n`
        if (overlay.timing) md += `  Timing: ${overlay.timing}\n`
      }

      // Graphics
      const gfx = cut.graphics
      if (gfx && gfx.needed) {
        md += `**GRAPHIC:** [${gfx.type || 'graphic'}] ${gfx.description}\n`
        if (gfx.timing) md += `  Timing: ${gfx.timing}\n`
      }

      if (cut.transition_in) md += `**IN:** ${cut.transition_in}\n`
      if (cut.transition_out) md += `**OUT:** ${cut.transition_out}\n`
      if (cut.editing_notes) md += `**EDIT NOTES:** ${cut.editing_notes}\n`
      md += '\n'
    })
  })

  // Post-production
  if (ec.post_production) {
    const pp = ec.post_production
    md += `---\n\n## Post-Production\n\n`

    if (pp.color_grading) {
      md += `### Color Grading\n`
      md += `**Look:** ${pp.color_grading.overall_look || ''}\n`
      if (pp.color_grading.per_type_treatment) {
        const ptt = pp.color_grading.per_type_treatment
        if (ptt.interviews) md += `- Interviews: ${ptt.interviews}\n`
        if (ptt.broll) md += `- B-Roll: ${ptt.broll}\n`
        if (ptt.screen_recordings) md += `- Screen Recordings: ${ptt.screen_recordings}\n`
      }
      md += '\n'
    }

    if (pp.sound_design) {
      md += `### Sound Design\n`
      if (pp.sound_design.overall_mix) md += `**Mix:** ${pp.sound_design.overall_mix}\n`
      if (pp.sound_design.ambient_beds) md += `**Ambience:** ${pp.sound_design.ambient_beds}\n`
      if (pp.sound_design.sound_effects?.length > 0) {
        md += `**SFX:**\n`
        pp.sound_design.sound_effects.forEach((s) => (md += `- ${s}\n`))
      }
      if (pp.sound_design.music_notes) md += `**Music Notes:** ${pp.sound_design.music_notes}\n`
      md += '\n'
    }

    if (pp.graphics_package?.length > 0) {
      md += `### Graphics Package\n`
      pp.graphics_package.forEach((g) => {
        md += `- **${g.item}** [${g.priority || ''}]: ${g.description}`
        if (g.where_used) md += ` — Used in: ${g.where_used}`
        md += '\n'
      })
      md += '\n'
    }

    if (pp.title_sequence) {
      md += `### Title Sequence\n`
      md += `${pp.title_sequence.style || ''}\n`
      if (pp.title_sequence.text) md += `Text: "${pp.title_sequence.text}"\n`
      if (pp.title_sequence.duration) md += `Duration: ${pp.title_sequence.duration}\n`
      md += '\n'
    }

    if (pp.end_credits) {
      md += `### End Credits\n`
      md += `${pp.end_credits.style || ''}\n`
      if (pp.end_credits.content) md += `${pp.end_credits.content}\n`
      md += '\n'
    }
  }

  // Missing footage
  if (ec.missing_footage?.length > 0) {
    md += `---\n\n## Missing Footage\n\n`
    ec.missing_footage.forEach((m) => {
      md += `- **[${m.priority || ''}]** ${m.description}`
      if (m.suggestion) md += ` — *${m.suggestion}*`
      md += '\n'
    })
    md += '\n'
  }

  // Delivery specs
  if (ec.delivery_specs) {
    const ds = ec.delivery_specs
    md += `---\n\n## Delivery Specs\n\n`
    if (ds.aspect_ratio) md += `- Aspect Ratio: ${ds.aspect_ratio}\n`
    if (ds.resolution) md += `- Resolution: ${ds.resolution}\n`
    if (ds.frame_rate) md += `- Frame Rate: ${ds.frame_rate}\n`
    if (ds.audio_format) md += `- Audio: ${ds.audio_format}\n`
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

export default function EditorCut({
  script,
  transcripts,
  storyBrief,
  editorCut,
  setEditorCut,
  onBackToScript,
}) {
  const { isLoading, error, generate } = useAIGeneration(buildEditorCutPrompt)

  useEffect(() => {
    if (!editorCut && !isLoading) {
      generate(script, transcripts, storyBrief).then((result) => {
        if (result) setEditorCut(result)
      })
    }
  }, [])

  const handleRegenerate = async () => {
    const result = await generate(script, transcripts, storyBrief)
    if (result) setEditorCut(result)
  }

  const handleDownloadMarkdown = () => {
    const md = editorCutToMarkdown(editorCut)
    const filename = `${(editorCut.editor_cut_title || 'editor_cut').replace(/[^a-zA-Z0-9 ]/g, '').replace(/\s+/g, '_')}.md`
    downloadFile(md, filename, 'text/markdown')
  }

  const handleDownloadJSON = () => {
    const json = JSON.stringify(editorCut, null, 2)
    const filename = `${(editorCut.editor_cut_title || 'editor_cut').replace(/[^a-zA-Z0-9 ]/g, '').replace(/\s+/g, '_')}.json`
    downloadFile(json, filename, 'application/json')
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[500px] flex-col items-center justify-center gap-6">
        <Spinner />
        <div className="max-w-lg text-center text-[15px] text-white/50">
          <TypewriterText text="Analyzing the script against transcripts... mapping timecodes... crafting cut-by-cut editing instructions... designing text overlays and graphics..." />
        </div>
        <div className="mt-4 font-mono text-xs text-white/20">
          Building your editor-ready cut sheet...
        </div>
      </div>
    )
  }

  if (error) {
    return <ErrorState message={error} onRetry={handleRegenerate} />
  }

  if (!editorCut) return null

  const ec = editorCut

  return (
    <div className="mx-auto max-w-[960px] px-5 py-10">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <button
          onClick={onBackToScript}
          className="rounded-lg border border-white/10 px-4 py-2 text-sm text-white/40 transition hover:border-white/20 hover:text-white/60"
        >
          ← Back to Script
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
        <div className="mb-2 font-mono text-[11px] font-semibold tracking-widest text-forge-gold">
          EDITOR'S CUT
        </div>
        <h1 className="font-display text-[36px] font-normal leading-tight text-forge-cream">
          {ec.editor_cut_title}
        </h1>
        <div className="mt-3 flex gap-3">
          <Pill label={ec.version || 'v1'} />
          <Pill label={ec.total_runtime_estimate} />
          <Pill label={`${ec.sequences?.length || 0} sequences`} />
        </div>
      </div>

      {/* Editor Letter */}
      {ec.editor_letter && (
        <div className="mb-9 rounded-[14px] border border-forge-gold/15 bg-forge-gold/[0.03] p-6">
          <div className="mb-3 font-body text-[11px] font-semibold uppercase tracking-widest text-forge-gold">
            Letter to the Editor
          </div>
          <p className="text-[15px] italic leading-relaxed text-white/70">
            {ec.editor_letter}
          </p>
        </div>
      )}

      {/* Cut Type Legend */}
      <div className="mb-6 flex flex-wrap gap-3">
        {Object.entries(CUT_COLORS).map(([type, colors]) => (
          <div key={type} className="flex items-center gap-1.5">
            <span className={`h-2 w-2 rounded-full ${colors.dot}`} />
            <span className="font-mono text-[10px] uppercase text-white/30">
              {type.replace('_', ' ')}
            </span>
          </div>
        ))}
      </div>

      {/* Sequences */}
      {ec.sequences?.map((seq) => (
        <div
          key={seq.sequence_number}
          className="mb-7 overflow-hidden rounded-2xl border border-white/5 bg-white/[0.01]"
        >
          {/* Sequence Header */}
          <div className="border-b border-white/5 bg-white/[0.02] px-5 py-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-mono text-[11px] font-semibold text-forge-gold">
                  SEQ {seq.sequence_number}
                </span>
                <h3 className="mt-0.5 font-display text-xl font-normal text-forge-cream">
                  {seq.sequence_title}
                </h3>
                {seq.purpose && (
                  <p className="mt-1 text-[13px] text-white/35">
                    {seq.purpose}
                  </p>
                )}
              </div>
              <span className="font-mono text-xs text-white/25">
                ~{seq.duration_estimate}
              </span>
            </div>
          </div>

          {/* Music Cue for Sequence */}
          {seq.music_cue && (
            <div className="border-b border-white/[0.03] bg-forge-montage/[0.02] px-5 py-3">
              <div className="flex items-start gap-2">
                <span className="mt-0.5 text-[11px] text-forge-montage/60">
                  MUSIC
                </span>
                <div className="text-[12px] text-white/40">
                  <span className="text-forge-montage">
                    {seq.music_cue.track_description || (typeof seq.music_cue === 'string' ? seq.music_cue : '')}
                  </span>
                  {seq.music_cue.entry_point && (
                    <span className="ml-2 text-white/25">
                      Entry: {seq.music_cue.entry_point}
                    </span>
                  )}
                  {seq.music_cue.dynamics && (
                    <div className="mt-0.5 text-white/30">
                      {seq.music_cue.dynamics}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Cuts */}
          {seq.cuts?.map((cut, ci) => {
            const colors = CUT_COLORS[cut.type] || CUT_COLORS.transition
            return (
              <div
                key={ci}
                className={`border-b border-white/[0.02] border-l-[3px] ${colors.border} px-5 py-4`}
              >
                {/* Cut Header */}
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="font-mono text-[11px] text-white/20">
                    {cut.cut_number}
                  </span>
                  <span
                    className={`rounded px-2 py-0.5 font-body text-[10px] font-bold uppercase tracking-wide ${colors.badge}`}
                  >
                    {cut.type?.replace('_', ' ')}
                  </span>
                  {cut.source && (
                    <span className="text-xs text-white/35">
                      ← {cut.source}
                    </span>
                  )}
                  {(cut.timecode_in || cut.timecode_out) && (
                    <span className="font-mono text-[11px] text-forge-gold/60">
                      [{cut.timecode_in} → {cut.timecode_out}]
                    </span>
                  )}
                  {cut.duration && (
                    <span className="font-mono text-[10px] text-white/20">
                      ({cut.duration})
                    </span>
                  )}
                </div>

                {/* Video Description */}
                <div className="mb-1 text-sm leading-relaxed text-white/65">
                  <strong className="text-[11px] font-semibold text-white/35">
                    VIDEO:{' '}
                  </strong>
                  {cut.description}
                </div>

                {/* Audio */}
                {cut.audio && (
                  <div className="text-[13px] leading-snug text-white/45">
                    <strong className="text-[11px] font-semibold text-white/25">
                      AUDIO:{' '}
                    </strong>
                    {cut.audio}
                  </div>
                )}

                {/* Text Overlay */}
                {cut.text_overlay &&
                  (typeof cut.text_overlay === 'string'
                    ? cut.text_overlay
                    : cut.text_overlay.text) && (
                    <div className="mt-2 rounded-lg border border-forge-titlecard/15 bg-forge-titlecard/[0.04] px-4 py-2.5">
                      <div className="mb-1 flex items-center gap-2">
                        <span className="font-mono text-[10px] font-bold uppercase text-forge-titlecard/70">
                          TEXT OVERLAY
                        </span>
                        {typeof cut.text_overlay === 'object' && cut.text_overlay.type && (
                          <span className="rounded bg-forge-titlecard/10 px-1.5 py-0.5 font-mono text-[9px] text-forge-titlecard/60">
                            {cut.text_overlay.type.replace('_', ' ')}
                          </span>
                        )}
                      </div>
                      <div className="font-mono text-[14px] font-medium text-forge-titlecard">
                        {typeof cut.text_overlay === 'string'
                          ? cut.text_overlay
                          : cut.text_overlay.text}
                      </div>
                      {typeof cut.text_overlay === 'object' && (
                        <div className="mt-1.5 flex flex-wrap gap-3 text-[11px] text-white/30">
                          {cut.text_overlay.position && (
                            <span>Position: {cut.text_overlay.position}</span>
                          )}
                          {cut.text_overlay.style && (
                            <span>Style: {cut.text_overlay.style}</span>
                          )}
                          {cut.text_overlay.timing && (
                            <span>Timing: {cut.text_overlay.timing}</span>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                {/* Graphics */}
                {cut.graphics && cut.graphics.needed && (
                  <div className="mt-2 rounded-lg border border-forge-broll/15 bg-forge-broll/[0.03] px-4 py-2.5">
                    <div className="mb-1 flex items-center gap-2">
                      <span className="font-mono text-[10px] font-bold uppercase text-forge-broll/70">
                        GRAPHIC
                      </span>
                      {cut.graphics.type && (
                        <span className="rounded bg-forge-broll/10 px-1.5 py-0.5 font-mono text-[9px] text-forge-broll/60">
                          {cut.graphics.type.replace('_', ' ')}
                        </span>
                      )}
                    </div>
                    <div className="text-[13px] text-white/50">
                      {cut.graphics.description}
                    </div>
                    {cut.graphics.timing && (
                      <div className="mt-1 text-[11px] text-white/25">
                        Timing: {cut.graphics.timing}
                      </div>
                    )}
                  </div>
                )}

                {/* Transitions */}
                <div className="mt-2 flex gap-4">
                  {cut.transition_in && (
                    <div className="font-mono text-[11px] text-white/20">
                      IN: {cut.transition_in}
                    </div>
                  )}
                  {cut.transition_out && (
                    <div className="font-mono text-[11px] text-white/20">
                      OUT: {cut.transition_out}
                    </div>
                  )}
                </div>

                {/* Editing Notes */}
                {cut.editing_notes && (
                  <div className="mt-2 font-mono text-xs italic text-forge-narration/50">
                    ✂ {cut.editing_notes}
                  </div>
                )}
              </div>
            )
          })}

          {/* Sequence Pacing */}
          {seq.pacing_notes && (
            <div className="bg-white/[0.005] px-5 py-3">
              <div className="text-xs text-white/30">
                <strong className="text-forge-gold/40">Pacing:</strong>{' '}
                {seq.pacing_notes}
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Post-Production */}
      {ec.post_production && (
        <div className="mb-8">
          <SectionLabel icon="🎨" label="Post-Production" />
          <div className="space-y-4">
            {/* Color Grading */}
            {ec.post_production.color_grading && (
              <div className="rounded-xl border border-white/5 bg-white/[0.01] p-5">
                <div className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-forge-gold">
                  Color Grading
                </div>
                <p className="text-[14px] text-white/55">
                  {ec.post_production.color_grading.overall_look}
                </p>
                {ec.post_production.color_grading.per_type_treatment && (
                  <div className="mt-3 grid grid-cols-3 gap-3">
                    {Object.entries(
                      ec.post_production.color_grading.per_type_treatment
                    ).map(([type, treatment]) => (
                      <div key={type} className="text-[12px]">
                        <span className="font-semibold capitalize text-white/35">
                          {type.replace('_', ' ')}:
                        </span>{' '}
                        <span className="text-white/45">{treatment}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Sound Design */}
            {ec.post_production.sound_design && (
              <div className="rounded-xl border border-white/5 bg-white/[0.01] p-5">
                <div className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-forge-gold">
                  Sound Design
                </div>
                {ec.post_production.sound_design.overall_mix && (
                  <p className="text-[13px] text-white/50">
                    {ec.post_production.sound_design.overall_mix}
                  </p>
                )}
                {ec.post_production.sound_design.ambient_beds && (
                  <p className="mt-1 text-[12px] text-white/35">
                    Ambience: {ec.post_production.sound_design.ambient_beds}
                  </p>
                )}
                {ec.post_production.sound_design.sound_effects?.length > 0 && (
                  <div className="mt-2">
                    <span className="text-[11px] font-semibold text-white/30">
                      SFX:
                    </span>
                    {ec.post_production.sound_design.sound_effects.map(
                      (s, i) => (
                        <div key={i} className="py-0.5 text-[12px] text-white/40">
                          - {s}
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Graphics Package */}
            {ec.post_production.graphics_package?.length > 0 && (
              <div className="rounded-xl border border-forge-broll/15 bg-forge-broll/[0.02] p-5">
                <div className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-forge-broll">
                  Graphics Package
                </div>
                {ec.post_production.graphics_package.map((g, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 border-b border-white/[0.03] py-2.5 last:border-0"
                  >
                    <span
                      className={`mt-1 rounded px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase ${
                        g.priority === 'essential'
                          ? 'bg-forge-gold/15 text-forge-gold'
                          : 'bg-white/5 text-white/30'
                      }`}
                    >
                      {g.priority || 'tbd'}
                    </span>
                    <div>
                      <div className="text-[13px] font-medium text-forge-cream">
                        {g.item}
                      </div>
                      <div className="text-[12px] text-white/40">
                        {g.description}
                      </div>
                      {g.where_used && (
                        <div className="mt-0.5 text-[11px] text-white/25">
                          Used in: {g.where_used}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Title Sequence + End Credits */}
            <div className="grid grid-cols-2 gap-4">
              {ec.post_production.title_sequence && (
                <div className="rounded-xl border border-white/5 bg-white/[0.01] p-5">
                  <div className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-forge-gold">
                    Title Sequence
                  </div>
                  <p className="text-[13px] text-white/50">
                    {ec.post_production.title_sequence.style}
                  </p>
                  {ec.post_production.title_sequence.text && (
                    <p className="mt-1 font-mono text-[13px] text-forge-cream">
                      "{ec.post_production.title_sequence.text}"
                    </p>
                  )}
                  {ec.post_production.title_sequence.duration && (
                    <p className="mt-1 text-[11px] text-white/25">
                      Duration: {ec.post_production.title_sequence.duration}
                    </p>
                  )}
                </div>
              )}
              {ec.post_production.end_credits && (
                <div className="rounded-xl border border-white/5 bg-white/[0.01] p-5">
                  <div className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-forge-gold">
                    End Credits
                  </div>
                  <p className="text-[13px] text-white/50">
                    {ec.post_production.end_credits.style}
                  </p>
                  {ec.post_production.end_credits.content && (
                    <p className="mt-1 text-[12px] text-white/40">
                      {ec.post_production.end_credits.content}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Missing Footage */}
      {ec.missing_footage?.length > 0 && (
        <div className="mb-7 rounded-xl border border-red-400/15 bg-red-400/[0.02] p-5">
          <div className="mb-3 text-[11px] font-semibold uppercase tracking-widest text-red-400">
            Missing Footage
          </div>
          {ec.missing_footage.map((m, i) => (
            <div
              key={i}
              className="flex items-start gap-3 py-1.5"
            >
              <span
                className={`mt-0.5 rounded px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase ${
                  m.priority === 'critical'
                    ? 'bg-red-400/15 text-red-400'
                    : m.priority === 'important'
                      ? 'bg-forge-narration/15 text-forge-narration'
                      : 'bg-white/5 text-white/30'
                }`}
              >
                {m.priority || 'tbd'}
              </span>
              <div>
                <div className="text-[13px] text-white/50">{m.description}</div>
                {m.suggestion && (
                  <div className="mt-0.5 text-[12px] italic text-white/30">
                    {m.suggestion}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delivery Specs */}
      {ec.delivery_specs && (
        <div className="mb-7 rounded-xl border border-white/5 bg-white/[0.01] p-5">
          <div className="mb-2 text-[11px] font-semibold uppercase tracking-widest text-forge-gold">
            Delivery Specs
          </div>
          <div className="flex gap-6 font-mono text-[12px] text-white/40">
            {ec.delivery_specs.aspect_ratio && (
              <span>{ec.delivery_specs.aspect_ratio}</span>
            )}
            {ec.delivery_specs.resolution && (
              <span>{ec.delivery_specs.resolution}</span>
            )}
            {ec.delivery_specs.frame_rate && (
              <span>{ec.delivery_specs.frame_rate}</span>
            )}
            {ec.delivery_specs.audio_format && (
              <span>{ec.delivery_specs.audio_format}</span>
            )}
          </div>
        </div>
      )}

      {/* Bottom Actions */}
      <div className="mt-12 flex justify-center gap-3">
        <button
          onClick={handleRegenerate}
          className="rounded-xl border border-white/15 px-6 py-3.5 text-sm text-white/50 transition hover:border-white/25"
        >
          ↻ Regenerate Editor's Cut
        </button>
        <button
          onClick={handleDownloadMarkdown}
          className="rounded-xl border border-white/15 px-6 py-3.5 text-sm text-white/50 transition hover:border-white/25"
        >
          ↓ Download Editor's Cut
        </button>
      </div>
    </div>
  )
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
