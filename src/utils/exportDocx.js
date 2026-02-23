/**
 * Word document export — zero external dependencies.
 * Generates styled HTML wrapped in Word-compatible XML namespace.
 * Word, Google Docs, and LibreOffice all open these natively.
 */

// ─── COLORS ───
const GOLD = '#E8C547'
const CREAM = '#F5F0E8'
const DARK = '#0A0A0A'
const MUTED = '#999999'
const INTERVIEW_BLUE = '#64C8FF'
const BROLL_GREEN = '#64FF96'
const NARRATION_AMBER = '#FFC864'
const TITLECARD_PURPLE = '#C896FF'
const MONTAGE_PINK = '#FF96C8'

const CUT_TYPE_COLORS = {
  interview: INTERVIEW_BLUE,
  broll: BROLL_GREEN,
  narration: NARRATION_AMBER,
  title_card: TITLECARD_PURPLE,
  montage: MONTAGE_PINK,
  screen_recording: INTERVIEW_BLUE,
  transition: MUTED,
}

function esc(text) {
  if (!text) return ''
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function saveAsDoc(html, filename) {
  const doc = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="utf-8">
<style>
@page{size:A4;margin:2cm}
body{font-family:Calibri,sans-serif;font-size:11pt;color:${CREAM};background:${DARK};line-height:1.6}
h1{font-family:Georgia,serif;color:${GOLD};font-size:26pt;font-weight:bold;margin:20pt 0 6pt}
h2{font-family:Georgia,serif;color:${CREAM};font-size:17pt;font-weight:bold;margin:18pt 0 6pt;border-bottom:1pt solid #333;padding-bottom:4pt}
h3{font-family:Georgia,serif;color:${GOLD};font-size:13pt;font-weight:bold;margin:14pt 0 4pt}
.lbl{font-family:Consolas,monospace;font-size:9pt;color:${GOLD};letter-spacing:3pt;font-weight:bold;text-transform:uppercase;margin:16pt 0 6pt}
.meta{font-family:Consolas,monospace;font-size:9pt;color:${MUTED}}
.scene{font-family:Consolas,monospace;font-size:11pt;color:${GOLD};font-weight:bold;text-transform:uppercase;margin:16pt 0 4pt}
.dir{font-family:Consolas,monospace;font-size:10pt;color:${MUTED};font-style:italic;margin:4pt 0}
.dlg{margin:6pt 0 6pt 36pt}
.dlg .spk{font-weight:bold;color:${INTERVIEW_BLUE}}
.nar{margin:6pt 0 6pt 24pt;border-left:3px solid ${NARRATION_AMBER};padding-left:12pt;font-style:italic;color:${NARRATION_AMBER}}
.demo{text-align:center;background:#1A1A2E;padding:8pt;margin:8pt 0;border:1px solid rgba(100,200,255,0.2)}
.demo .t{font-family:Consolas,monospace;font-size:10pt;color:${INTERVIEW_BLUE};font-weight:bold;text-transform:uppercase;letter-spacing:2pt}
.demo .d{font-style:italic;color:${MUTED};font-size:10pt}
.pill{font-family:Consolas,monospace;font-size:8pt;font-weight:bold;padding:1pt 4pt}
.hr{border-top:1pt solid #333;margin:14pt 0}
.box{border:1px solid rgba(232,197,71,0.2);background:rgba(232,197,71,0.03);padding:10pt;margin:8pt 0}
.box .t{font-family:Consolas,monospace;font-size:9pt;color:${GOLD};font-weight:bold;text-transform:uppercase;letter-spacing:2pt;margin-bottom:4pt}
.wbox{border:1px solid rgba(255,100,100,0.2);background:rgba(255,100,100,0.03);padding:10pt;margin:8pt 0}
.wbox .t{font-family:Consolas,monospace;font-size:9pt;color:#FF6666;font-weight:bold;text-transform:uppercase;letter-spacing:2pt;margin-bottom:4pt}
.bul{margin-left:18pt;margin-bottom:3pt}
.cut{border-left:3px solid ${MUTED};padding-left:10pt;margin:10pt 0}
.ct{font-family:Consolas,monospace;font-size:8pt;font-weight:bold;text-transform:uppercase;letter-spacing:1pt;padding:1pt 4pt}
.tc{font-family:Consolas,monospace;font-size:9pt;color:${GOLD}}
.olay{border:1px solid rgba(200,150,255,0.2);background:rgba(200,150,255,0.03);padding:6pt;margin:4pt 0}
.olay .tx{font-family:Consolas,monospace;font-size:11pt;color:${TITLECARD_PURPLE};font-weight:bold}
.gfx{border:1px solid rgba(100,255,150,0.2);background:rgba(100,255,150,0.03);padding:6pt;margin:4pt 0}
.en{font-family:Consolas,monospace;font-size:9pt;color:${NARRATION_AMBER};font-style:italic}
</style></head><body>
${html}
</body></html>`

  const blob = new Blob([doc], { type: 'application/msword' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function safeName(title) {
  return (title || 'untitled').replace(/[^a-zA-Z0-9 ]/g, '').replace(/\s+/g, '_')
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SCRIPT EXPORT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export function downloadScriptAsDocx(script) {
  let h = ''

  // Title
  h += `<h1 style="text-align:center">${esc(script.title)}</h1>`
  if (script.subtitle) h += `<p style="text-align:center;font-family:Georgia;font-size:14pt;color:${MUTED};font-style:italic">${esc(script.subtitle)}</p>`
  h += `<p style="text-align:center" class="meta">Duration: ${esc(script.total_duration_estimate)}</p>`
  if (script.story_summary) h += `<p style="text-align:center;color:${MUTED};font-style:italic;max-width:80%;margin:8pt auto">${esc(script.story_summary)}</p>`
  h += `<div class="hr"></div>`

  // Cast
  if (script.characters?.length > 0) {
    h += `<p class="lbl">CAST</p>`
    for (const c of script.characters) {
      h += `<p><b style="color:${GOLD};font-size:12pt">${esc(c.name)}</b> <span class="meta">&mdash; ${esc(c.role)}</span></p>`
      if (c.arc) h += `<p style="color:${MUTED};font-style:italic;margin-left:18pt">${esc(c.arc)}</p>`
    }
    h += `<div class="hr"></div>`
  }

  // Chapters
  for (const ch of script.chapters || []) {
    const t = ch.chapter_number > 0 ? `Chapter ${ch.chapter_number}: ${esc(ch.chapter_title)}` : esc(ch.chapter_title)
    h += `<h2>${t}</h2>`
    h += `<p class="meta">~${esc(ch.duration_estimate)}</p>`
    if (ch.purpose) h += `<p style="color:${MUTED}">${esc(ch.purpose)}</p>`

    if (ch.music_suggestion) {
      const ms = ch.music_suggestion
      const parts = [ms.mood, ms.tempo, ms.instruments].filter(Boolean).join(' &nbsp;|&nbsp; ')
      if (parts) h += `<p><span class="pill" style="color:${MONTAGE_PINK}">[MUSIC]</span> <span style="color:${MONTAGE_PINK};font-family:Consolas;font-size:9pt">${esc(parts)}</span></p>`
      if (ms.reference) h += `<p style="color:${MUTED};font-style:italic;font-size:9pt">Ref: ${esc(ms.reference)}</p>`
    }

    for (const b of ch.beats || []) {
      switch (b.type) {
        case 'scene_heading':
          h += `<p class="scene">${esc(b.content)}</p>`; break
        case 'direction':
          h += `<p class="dir">[${esc(b.content)}]</p>`; break
        case 'dialogue':
          h += `<div class="dlg"><span class="spk">${esc(b.speaker)}:</span> &ldquo;${esc(b.content)}&rdquo;</div>`; break
        case 'narration':
          h += `<div class="nar">${esc(b.content)}</div>`; break
        case 'tool_demo':
          h += `<div class="demo"><div class="t">SCREEN RECORDING: ${esc(b.tool_name)}</div>`
          if (b.description) h += `<div class="d">${esc(b.description)}</div>`
          h += `</div>`; break
        default:
          h += `<p style="color:${MUTED}">${esc(b.content)}</p>`
      }
    }
    h += `<div class="hr"></div>`
  }

  // Music Suggestions
  if (script.music_suggestions) {
    const ms = script.music_suggestions
    h += `<p class="lbl">MUSIC &amp; SOUNDTRACK</p>`
    if (ms.overall_vision) {
      h += `<div class="box"><div class="t">Soundtrack Vision</div><p>${esc(ms.overall_vision)}</p>`
      if (ms.soundtrack_style) h += `<p style="color:${MUTED}">Style: ${esc(ms.soundtrack_style)}</p>`
      h += `</div>`
    }
    if (ms.key_moments?.length > 0) {
      h += `<h3>Key Musical Moments</h3>`
      for (const m of ms.key_moments) h += `<p><b>${esc(m.moment)}</b> <span style="color:${MUTED}">&mdash; ${esc(m.music)}</span></p>`
    }
    if (ms.recommended_genres?.length > 0) h += `<p style="color:${MONTAGE_PINK}">Genres: ${esc(ms.recommended_genres.join(', '))}</p>`
    if (ms.reference_tracks?.length > 0) {
      h += `<h3>Reference Tracks</h3>`
      for (const t of ms.reference_tracks) h += `<p class="bul" style="color:${MUTED}">&bull; ${esc(t)}</p>`
    }
    h += `<div class="hr"></div>`
  }

  // Production Notes
  if (script.production_notes) {
    const pn = script.production_notes
    h += `<p class="lbl">PRODUCTION NOTES</p>`
    if (pn.editors_note) h += `<div class="box"><div class="t">Editor's Note</div><p style="font-style:italic">${esc(pn.editors_note)}</p></div>`
    if (pn.music_direction) h += `<p style="color:${MUTED}"><b>Music Direction:</b> ${esc(pn.music_direction)}</p>`
    if (pn.visual_style) h += `<p style="color:${MUTED}"><b>Visual Style:</b> ${esc(pn.visual_style)}</p>`
    if (pn.missing_footage?.length > 0) {
      h += `<div class="wbox"><div class="t">Missing Footage</div>`
      for (const m of pn.missing_footage) h += `<p class="bul" style="color:#FF6666">&bull; ${esc(m)}</p>`
      h += `</div>`
    }
    if (pn.additional_interviews_needed?.length > 0) {
      h += `<h3>Additional Interviews Needed</h3>`
      for (const m of pn.additional_interviews_needed) h += `<p class="bul">&bull; ${esc(m)}</p>`
    }
  }

  saveAsDoc(h, `${safeName(script.title)}_script.doc`)
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// EDITOR CUT EXPORT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export function downloadEditorCutAsDocx(ec) {
  let h = ''

  // Title
  h += `<p style="text-align:center" class="lbl">EDITOR'S CUT</p>`
  h += `<h1 style="text-align:center">${esc(ec.editor_cut_title)}</h1>`
  h += `<p style="text-align:center" class="meta">${esc(ec.version || 'v1')} &nbsp;|&nbsp; Runtime: ${esc(ec.total_runtime_estimate)}</p>`
  h += `<div class="hr"></div>`

  // Editor Letter
  if (ec.editor_letter) {
    h += `<div class="box"><div class="t">Letter to the Editor</div><p style="font-style:italic">${esc(ec.editor_letter)}</p></div>`
    h += `<div class="hr"></div>`
  }

  // Sequences
  for (const seq of ec.sequences || []) {
    h += `<h2><span style="color:${GOLD};font-family:Consolas;font-size:10pt">SEQ ${seq.sequence_number}</span> &nbsp; ${esc(seq.sequence_title)} <span class="meta">~${esc(seq.duration_estimate)}</span></h2>`
    if (seq.purpose) h += `<p style="color:${MUTED}">${esc(seq.purpose)}</p>`

    // Music cue
    if (seq.music_cue) {
      const mc = seq.music_cue
      const desc = mc.track_description || (typeof mc === 'string' ? mc : '')
      if (desc) h += `<p><span class="pill" style="color:${MONTAGE_PINK}">[MUSIC]</span> <span style="color:${MONTAGE_PINK}">${esc(desc)}</span></p>`
      if (mc.dynamics) h += `<p style="color:${MUTED};font-style:italic;font-size:9pt">${esc(mc.dynamics)}</p>`
    }

    // Cuts
    for (const cut of seq.cuts || []) {
      const col = CUT_TYPE_COLORS[cut.type] || MUTED
      h += `<div class="cut" style="border-left-color:${col}">`

      // Header
      h += `<p style="margin-bottom:2pt"><span class="meta">${esc(cut.cut_number)}</span> <span class="ct" style="color:${col}">${esc((cut.type || '').replace('_', ' '))}</span>`
      if (cut.source) h += ` <span style="font-size:9pt;color:${MUTED}">&larr; ${esc(cut.source)}</span>`
      if (cut.timecode_in && cut.timecode_out) h += ` <span class="tc">[${esc(cut.timecode_in)} &rarr; ${esc(cut.timecode_out)}]</span>`
      if (cut.duration) h += ` <span class="meta">(${esc(cut.duration)})</span>`
      h += `</p>`

      // VIDEO / AUDIO
      h += `<p style="margin-bottom:2pt"><span style="font-family:Consolas;font-size:9pt;color:${MUTED};font-weight:bold">VIDEO: </span>${esc(cut.description)}</p>`
      if (cut.audio) h += `<p style="margin-bottom:2pt"><span style="font-family:Consolas;font-size:9pt;color:${MUTED};font-weight:bold">AUDIO: </span>${esc(cut.audio)}</p>`

      // Text Overlay
      const ov = cut.text_overlay
      const ovText = typeof ov === 'string' ? ov : ov?.text
      if (ovText) {
        h += `<div class="olay"><span style="font-family:Consolas;font-size:8pt;color:${TITLECARD_PURPLE};font-weight:bold">TEXT OVERLAY</span>`
        if (typeof ov === 'object' && ov.type) h += ` <span class="meta">${esc(ov.type.replace('_', ' '))}</span>`
        h += `<div class="tx">&ldquo;${esc(ovText)}&rdquo;</div>`
        if (typeof ov === 'object') {
          const meta = [ov.position && `Position: ${ov.position}`, ov.style && `Style: ${ov.style}`, ov.timing && `Timing: ${ov.timing}`].filter(Boolean).join(' &nbsp;|&nbsp; ')
          if (meta) h += `<p class="meta" style="font-size:8pt">${esc(meta)}</p>`
        }
        h += `</div>`
      }

      // Graphics
      if (cut.graphics?.needed) {
        h += `<div class="gfx"><span style="font-family:Consolas;font-size:8pt;color:${BROLL_GREEN};font-weight:bold">GRAPHIC</span>`
        if (cut.graphics.type) h += ` <span class="meta">[${esc(cut.graphics.type.replace('_', ' '))}]</span>`
        h += `<p>${esc(cut.graphics.description)}</p>`
        if (cut.graphics.timing) h += `<p class="meta" style="font-size:8pt">Timing: ${esc(cut.graphics.timing)}</p>`
        h += `</div>`
      }

      // Transitions
      const tr = []
      if (cut.transition_in) tr.push(`IN: ${cut.transition_in}`)
      if (cut.transition_out) tr.push(`OUT: ${cut.transition_out}`)
      if (tr.length) h += `<p class="meta" style="font-size:8pt">${esc(tr.join('  |  '))}</p>`

      // Edit notes
      if (cut.editing_notes) h += `<p class="en">&#9986; ${esc(cut.editing_notes)}</p>`

      h += `</div>`
    }

    if (seq.pacing_notes) h += `<p style="color:${MUTED};font-size:9pt"><b style="color:${GOLD}">Pacing:</b> ${esc(seq.pacing_notes)}</p>`
    h += `<div class="hr"></div>`
  }

  // Post-production
  if (ec.post_production) {
    const pp = ec.post_production
    h += `<p class="lbl">POST-PRODUCTION</p>`

    if (pp.color_grading) {
      h += `<h3>Color Grading</h3>`
      h += `<p>${esc(pp.color_grading.overall_look || '')}</p>`
      if (pp.color_grading.per_type_treatment) {
        for (const [type, val] of Object.entries(pp.color_grading.per_type_treatment)) {
          h += `<p class="bul" style="color:${MUTED}">&bull; <b>${esc(type.replace('_', ' '))}:</b> ${esc(val)}</p>`
        }
      }
    }

    if (pp.sound_design) {
      h += `<h3>Sound Design</h3>`
      if (pp.sound_design.overall_mix) h += `<p>${esc(pp.sound_design.overall_mix)}</p>`
      if (pp.sound_design.ambient_beds) h += `<p style="color:${MUTED}">Ambience: ${esc(pp.sound_design.ambient_beds)}</p>`
      for (const s of pp.sound_design.sound_effects || []) h += `<p class="bul" style="color:${MUTED}">&bull; ${esc(s)}</p>`
    }

    if (pp.graphics_package?.length > 0) {
      h += `<h3>Graphics Package</h3>`
      for (const g of pp.graphics_package) {
        const pc = g.priority === 'essential' ? GOLD : MUTED
        h += `<p><span class="pill" style="color:${pc}">[${esc(g.priority || 'tbd')}]</span> <b>${esc(g.item)}:</b> <span style="color:${MUTED}">${esc(g.description)}</span></p>`
      }
    }
    h += `<div class="hr"></div>`
  }

  // Missing footage
  if (ec.missing_footage?.length > 0) {
    h += `<div class="wbox"><div class="t">Missing Footage</div>`
    for (const m of ec.missing_footage) {
      const pc = m.priority === 'critical' ? '#FF6666' : MUTED
      h += `<p><span class="pill" style="color:${pc}">[${esc(m.priority || 'tbd')}]</span> ${esc(m.description)}</p>`
      if (m.suggestion) h += `<p style="color:${MUTED};font-style:italic;margin-left:18pt;font-size:9pt">${esc(m.suggestion)}</p>`
    }
    h += `</div>`
  }

  // Delivery specs
  if (ec.delivery_specs) {
    const ds = ec.delivery_specs
    h += `<p class="lbl">DELIVERY SPECS</p>`
    h += `<p class="meta">${esc([ds.aspect_ratio, ds.resolution, ds.frame_rate, ds.audio_format].filter(Boolean).join('  |  '))}</p>`
  }

  saveAsDoc(h, `${safeName(ec.editor_cut_title)}_editors_cut.doc`)
}
