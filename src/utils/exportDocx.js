import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  TabStopPosition,
  TabStopType,
  ShadingType,
} from 'docx'
import { saveAs } from 'file-saver'

// ─── DESIGN TOKENS ───
const GOLD = 'E8C547'
const CREAM = 'F5F0E8'
const DARK = '0A0A0A'
const MUTED = '999999'
const INTERVIEW_BLUE = '64C8FF'
const BROLL_GREEN = '64FF96'
const NARRATION_AMBER = 'FFC864'
const TITLECARD_PURPLE = 'C896FF'
const MONTAGE_PINK = 'FF96C8'

const CUT_TYPE_COLORS = {
  interview: INTERVIEW_BLUE,
  broll: BROLL_GREEN,
  narration: NARRATION_AMBER,
  title_card: TITLECARD_PURPLE,
  montage: MONTAGE_PINK,
  screen_recording: INTERVIEW_BLUE,
  transition: MUTED,
}

// ─── HELPERS ───

function heading(text, level = HeadingLevel.HEADING_1) {
  return new Paragraph({
    heading: level,
    spacing: { before: 300, after: 100 },
    children: [
      new TextRun({
        text,
        bold: true,
        color: level === HeadingLevel.HEADING_1 ? GOLD : CREAM,
        font: 'Georgia',
      }),
    ],
  })
}

function label(text) {
  return new Paragraph({
    spacing: { before: 200, after: 60 },
    children: [
      new TextRun({
        text: text.toUpperCase(),
        bold: true,
        size: 18,
        color: GOLD,
        font: 'Consolas',
        characterSpacing: 80,
      }),
    ],
  })
}

function body(text, { italic = false, color = CREAM, bold = false } = {}) {
  return new Paragraph({
    spacing: { after: 80 },
    children: [
      new TextRun({ text, italics: italic, bold, color, size: 22, font: 'Calibri' }),
    ],
  })
}

function bullet(text, { color = CREAM } = {}) {
  return new Paragraph({
    spacing: { after: 40 },
    indent: { left: 360 },
    children: [
      new TextRun({ text: '  •  ', color: GOLD, size: 20, font: 'Consolas' }),
      new TextRun({ text, color, size: 20, font: 'Calibri' }),
    ],
  })
}

function spacer() {
  return new Paragraph({ spacing: { before: 100, after: 100 }, children: [] })
}

function divider() {
  return new Paragraph({
    spacing: { before: 200, after: 200 },
    border: {
      bottom: { style: BorderStyle.SINGLE, size: 1, color: '333333' },
    },
    children: [],
  })
}

function tagPill(text, color = GOLD) {
  return new TextRun({
    text: `[${text}] `,
    bold: true,
    size: 18,
    color,
    font: 'Consolas',
  })
}

// ─── SCRIPT TO DOCX ───

export async function downloadScriptAsDocx(script) {
  const sections = []

  // Title page
  sections.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 600, after: 100 },
      children: [
        new TextRun({
          text: script.title || 'Untitled',
          bold: true,
          size: 56,
          color: GOLD,
          font: 'Georgia',
        }),
      ],
    })
  )
  if (script.subtitle) {
    sections.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 100 },
        children: [
          new TextRun({
            text: script.subtitle,
            italics: true,
            size: 28,
            color: MUTED,
            font: 'Georgia',
          }),
        ],
      })
    )
  }
  sections.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 60 },
      children: [
        new TextRun({ text: `Duration: ${script.total_duration_estimate || ''}`, size: 20, color: MUTED, font: 'Consolas' }),
      ],
    })
  )
  if (script.story_summary) {
    sections.push(spacer())
    sections.push(body(script.story_summary, { italic: true, color: MUTED }))
  }
  sections.push(divider())

  // Characters
  if (script.characters?.length > 0) {
    sections.push(label('Cast'))
    script.characters.forEach((c) => {
      sections.push(
        new Paragraph({
          spacing: { before: 120, after: 40 },
          children: [
            new TextRun({ text: c.name, bold: true, size: 24, color: GOLD, font: 'Calibri' }),
            new TextRun({ text: `  —  ${c.role}`, size: 20, color: MUTED, font: 'Calibri' }),
          ],
        })
      )
      if (c.arc) sections.push(body(c.arc, { italic: true, color: MUTED }))
    })
    sections.push(divider())
  }

  // Chapters
  script.chapters?.forEach((chapter) => {
    const title =
      chapter.chapter_number > 0
        ? `Chapter ${chapter.chapter_number}: ${chapter.chapter_title}`
        : chapter.chapter_title
    sections.push(heading(title, HeadingLevel.HEADING_2))

    sections.push(
      new Paragraph({
        spacing: { after: 60 },
        children: [
          new TextRun({ text: `~${chapter.duration_estimate}`, size: 18, color: MUTED, font: 'Consolas' }),
        ],
      })
    )
    if (chapter.purpose) sections.push(body(chapter.purpose, { color: MUTED }))

    // Music suggestion
    if (chapter.music_suggestion) {
      const ms = chapter.music_suggestion
      const parts = [ms.mood, ms.tempo, ms.instruments].filter(Boolean).join('  |  ')
      if (parts) {
        sections.push(
          new Paragraph({
            spacing: { before: 80, after: 40 },
            children: [
              tagPill('MUSIC', MONTAGE_PINK),
              new TextRun({ text: parts, size: 18, color: MONTAGE_PINK, font: 'Consolas' }),
            ],
          })
        )
      }
      if (ms.reference) {
        sections.push(body(`Ref: ${ms.reference}`, { italic: true, color: MUTED }))
      }
    }

    sections.push(spacer())

    // Beats
    chapter.beats?.forEach((beat) => {
      switch (beat.type) {
        case 'scene_heading':
          sections.push(
            new Paragraph({
              spacing: { before: 200, after: 80 },
              children: [
                new TextRun({
                  text: beat.content.toUpperCase(),
                  bold: true,
                  size: 22,
                  color: GOLD,
                  font: 'Consolas',
                }),
              ],
            })
          )
          break

        case 'direction':
          sections.push(
            new Paragraph({
              spacing: { after: 60 },
              children: [
                new TextRun({
                  text: `[${beat.content}]`,
                  italics: true,
                  size: 20,
                  color: MUTED,
                  font: 'Consolas',
                }),
              ],
            })
          )
          break

        case 'dialogue':
          sections.push(
            new Paragraph({
              spacing: { before: 80, after: 80 },
              indent: { left: 720 },
              children: [
                new TextRun({
                  text: `${beat.speaker}: `,
                  bold: true,
                  size: 22,
                  color: INTERVIEW_BLUE,
                  font: 'Calibri',
                }),
                new TextRun({
                  text: `"${beat.content}"`,
                  size: 22,
                  color: CREAM,
                  font: 'Calibri',
                }),
              ],
            })
          )
          break

        case 'narration':
          sections.push(
            new Paragraph({
              spacing: { before: 80, after: 80 },
              indent: { left: 480 },
              border: {
                left: { style: BorderStyle.SINGLE, size: 3, color: NARRATION_AMBER },
              },
              children: [
                new TextRun({
                  text: beat.content,
                  italics: true,
                  size: 22,
                  color: NARRATION_AMBER,
                  font: 'Calibri',
                }),
              ],
            })
          )
          break

        case 'tool_demo':
          sections.push(
            new Paragraph({
              spacing: { before: 120, after: 120 },
              alignment: AlignmentType.CENTER,
              shading: { type: ShadingType.SOLID, color: '1A1A2E' },
              children: [
                new TextRun({
                  text: `SCREEN RECORDING: ${beat.tool_name}`,
                  bold: true,
                  size: 20,
                  color: INTERVIEW_BLUE,
                  font: 'Consolas',
                }),
              ],
            })
          )
          if (beat.description) {
            sections.push(
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { after: 80 },
                children: [
                  new TextRun({ text: beat.description, italics: true, size: 20, color: MUTED, font: 'Calibri' }),
                ],
              })
            )
          }
          break

        default:
          sections.push(body(beat.content, { color: MUTED }))
      }
    })

    sections.push(divider())
  })

  // Music Suggestions
  if (script.music_suggestions) {
    const ms = script.music_suggestions
    sections.push(label('Music & Soundtrack'))
    if (ms.overall_vision) sections.push(body(ms.overall_vision))
    if (ms.soundtrack_style) sections.push(body(`Style: ${ms.soundtrack_style}`, { color: MUTED }))

    if (ms.key_moments?.length > 0) {
      sections.push(spacer())
      sections.push(heading('Key Musical Moments', HeadingLevel.HEADING_3))
      ms.key_moments.forEach((m) => {
        sections.push(
          new Paragraph({
            spacing: { after: 60 },
            children: [
              new TextRun({ text: m.moment, bold: true, size: 20, color: CREAM, font: 'Calibri' }),
              new TextRun({ text: `  —  ${m.music}`, size: 20, color: MUTED, font: 'Calibri' }),
            ],
          })
        )
      })
    }

    if (ms.recommended_genres?.length > 0) {
      sections.push(spacer())
      sections.push(body(`Genres: ${ms.recommended_genres.join(', ')}`, { color: MONTAGE_PINK }))
    }
    if (ms.reference_tracks?.length > 0) {
      sections.push(spacer())
      sections.push(heading('Reference Tracks', HeadingLevel.HEADING_3))
      ms.reference_tracks.forEach((t) => bullet(t, { color: MUTED }))
    }
    sections.push(divider())
  }

  // Production Notes
  if (script.production_notes) {
    const pn = script.production_notes
    sections.push(label('Production Notes'))
    if (pn.editors_note) sections.push(body(pn.editors_note, { italic: true }))
    if (pn.music_direction) {
      sections.push(spacer())
      sections.push(body(`Music Direction: ${pn.music_direction}`, { color: MUTED }))
    }
    if (pn.visual_style) {
      sections.push(body(`Visual Style: ${pn.visual_style}`, { color: MUTED }))
    }
    if (pn.missing_footage?.length > 0) {
      sections.push(spacer())
      sections.push(heading('Missing Footage', HeadingLevel.HEADING_3))
      pn.missing_footage.forEach((m) => bullet(m, { color: 'FF6666' }))
    }
    if (pn.additional_interviews_needed?.length > 0) {
      sections.push(spacer())
      sections.push(heading('Additional Interviews Needed', HeadingLevel.HEADING_3))
      pn.additional_interviews_needed.forEach((m) => bullet(m))
    }
  }

  const doc = new Document({
    background: { color: DARK },
    styles: {
      default: {
        document: {
          run: { color: CREAM, font: 'Calibri', size: 22 },
        },
      },
    },
    sections: [{ children: sections }],
  })

  const blob = await Packer.toBlob(doc)
  const filename = `${(script.title || 'script').replace(/[^a-zA-Z0-9 ]/g, '').replace(/\s+/g, '_')}_script.docx`
  saveAs(blob, filename)
}

// ─── EDITOR CUT TO DOCX ───

export async function downloadEditorCutAsDocx(ec) {
  const sections = []

  // Title
  sections.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 400, after: 60 },
      children: [
        new TextRun({
          text: "EDITOR'S CUT",
          bold: true,
          size: 18,
          color: GOLD,
          font: 'Consolas',
          characterSpacing: 120,
        }),
      ],
    })
  )
  sections.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 80 },
      children: [
        new TextRun({
          text: ec.editor_cut_title || 'Untitled',
          bold: true,
          size: 48,
          color: GOLD,
          font: 'Georgia',
        }),
      ],
    })
  )
  sections.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 60 },
      children: [
        new TextRun({ text: `${ec.version || 'v1'}  |  Runtime: ${ec.total_runtime_estimate || ''}`, size: 20, color: MUTED, font: 'Consolas' }),
      ],
    })
  )
  sections.push(divider())

  // Editor Letter
  if (ec.editor_letter) {
    sections.push(label('Letter to the Editor'))
    sections.push(body(ec.editor_letter, { italic: true }))
    sections.push(divider())
  }

  // Sequences
  ec.sequences?.forEach((seq) => {
    sections.push(
      new Paragraph({
        spacing: { before: 300, after: 40 },
        children: [
          tagPill(`SEQ ${seq.sequence_number}`, GOLD),
          new TextRun({
            text: seq.sequence_title,
            bold: true,
            size: 32,
            color: CREAM,
            font: 'Georgia',
          }),
          new TextRun({ text: `   ~${seq.duration_estimate}`, size: 18, color: MUTED, font: 'Consolas' }),
        ],
      })
    )
    if (seq.purpose) sections.push(body(seq.purpose, { color: MUTED }))

    // Music cue
    if (seq.music_cue) {
      const mc = seq.music_cue
      const desc = mc.track_description || (typeof mc === 'string' ? mc : '')
      if (desc) {
        sections.push(
          new Paragraph({
            spacing: { before: 80, after: 40 },
            children: [
              tagPill('MUSIC', MONTAGE_PINK),
              new TextRun({ text: desc, size: 20, color: MONTAGE_PINK, font: 'Calibri' }),
            ],
          })
        )
      }
      if (mc.dynamics) sections.push(body(mc.dynamics, { italic: true, color: MUTED }))
    }

    sections.push(spacer())

    // Cuts
    seq.cuts?.forEach((cut) => {
      const typeColor = CUT_TYPE_COLORS[cut.type] || MUTED

      // Cut header line
      const headerRuns = [
        tagPill(cut.cut_number, MUTED),
        new TextRun({
          text: (cut.type || '').replace('_', ' ').toUpperCase(),
          bold: true,
          size: 18,
          color: typeColor,
          font: 'Consolas',
        }),
      ]
      if (cut.source) {
        headerRuns.push(new TextRun({ text: `   ← ${cut.source}`, size: 18, color: MUTED, font: 'Calibri' }))
      }
      if (cut.timecode_in && cut.timecode_out) {
        headerRuns.push(new TextRun({ text: `   [${cut.timecode_in} → ${cut.timecode_out}]`, size: 18, color: GOLD, font: 'Consolas' }))
      }
      if (cut.duration) {
        headerRuns.push(new TextRun({ text: `  (${cut.duration})`, size: 16, color: MUTED, font: 'Consolas' }))
      }
      sections.push(new Paragraph({ spacing: { before: 160, after: 40 }, children: headerRuns }))

      // VIDEO
      sections.push(
        new Paragraph({
          spacing: { after: 40 },
          children: [
            new TextRun({ text: 'VIDEO: ', bold: true, size: 18, color: MUTED, font: 'Consolas' }),
            new TextRun({ text: cut.description, size: 20, color: CREAM, font: 'Calibri' }),
          ],
        })
      )

      // AUDIO
      if (cut.audio) {
        sections.push(
          new Paragraph({
            spacing: { after: 40 },
            children: [
              new TextRun({ text: 'AUDIO: ', bold: true, size: 18, color: MUTED, font: 'Consolas' }),
              new TextRun({ text: cut.audio, size: 20, color: CREAM, font: 'Calibri' }),
            ],
          })
        )
      }

      // Text Overlay
      const overlay = cut.text_overlay
      const overlayText = typeof overlay === 'string' ? overlay : overlay?.text
      if (overlayText) {
        const overlayRuns = [
          new TextRun({ text: 'TEXT OVERLAY: ', bold: true, size: 18, color: TITLECARD_PURPLE, font: 'Consolas' }),
          new TextRun({ text: `"${overlayText}"`, bold: true, size: 22, color: TITLECARD_PURPLE, font: 'Calibri' }),
        ]
        if (typeof overlay === 'object') {
          const meta = [overlay.type, overlay.position, overlay.style].filter(Boolean).join('  |  ')
          if (meta) {
            overlayRuns.push(new TextRun({ text: `   ${meta}`, size: 16, color: MUTED, font: 'Consolas' }))
          }
        }
        sections.push(new Paragraph({ spacing: { before: 60, after: 40 }, children: overlayRuns }))
      }

      // Graphics
      if (cut.graphics?.needed) {
        sections.push(
          new Paragraph({
            spacing: { before: 60, after: 40 },
            children: [
              new TextRun({ text: `GRAPHIC [${cut.graphics.type || 'graphic'}]: `, bold: true, size: 18, color: BROLL_GREEN, font: 'Consolas' }),
              new TextRun({ text: cut.graphics.description, size: 20, color: CREAM, font: 'Calibri' }),
            ],
          })
        )
      }

      // Transitions
      const transRuns = []
      if (cut.transition_in) transRuns.push(new TextRun({ text: `IN: ${cut.transition_in}   `, size: 16, color: MUTED, font: 'Consolas' }))
      if (cut.transition_out) transRuns.push(new TextRun({ text: `OUT: ${cut.transition_out}`, size: 16, color: MUTED, font: 'Consolas' }))
      if (transRuns.length > 0) sections.push(new Paragraph({ spacing: { after: 40 }, children: transRuns }))

      // Editing notes
      if (cut.editing_notes) {
        sections.push(
          new Paragraph({
            spacing: { after: 60 },
            children: [
              new TextRun({ text: 'EDIT: ', bold: true, size: 16, color: NARRATION_AMBER, font: 'Consolas' }),
              new TextRun({ text: cut.editing_notes, italics: true, size: 18, color: NARRATION_AMBER, font: 'Calibri' }),
            ],
          })
        )
      }
    })

    // Pacing
    if (seq.pacing_notes) sections.push(body(`Pacing: ${seq.pacing_notes}`, { color: MUTED }))

    sections.push(divider())
  })

  // Post-production
  if (ec.post_production) {
    const pp = ec.post_production
    sections.push(label('Post-Production'))

    if (pp.color_grading) {
      sections.push(heading('Color Grading', HeadingLevel.HEADING_3))
      sections.push(body(pp.color_grading.overall_look || ''))
      if (pp.color_grading.per_type_treatment) {
        Object.entries(pp.color_grading.per_type_treatment).forEach(([type, treatment]) => {
          sections.push(bullet(`${type.replace('_', ' ')}: ${treatment}`))
        })
      }
    }

    if (pp.sound_design) {
      sections.push(heading('Sound Design', HeadingLevel.HEADING_3))
      if (pp.sound_design.overall_mix) sections.push(body(pp.sound_design.overall_mix))
      if (pp.sound_design.ambient_beds) sections.push(body(`Ambience: ${pp.sound_design.ambient_beds}`, { color: MUTED }))
      pp.sound_design.sound_effects?.forEach((s) => bullet(s))
    }

    if (pp.graphics_package?.length > 0) {
      sections.push(heading('Graphics Package', HeadingLevel.HEADING_3))
      pp.graphics_package.forEach((g) => {
        sections.push(
          new Paragraph({
            spacing: { after: 60 },
            children: [
              tagPill(g.priority || 'tbd', g.priority === 'essential' ? GOLD : MUTED),
              new TextRun({ text: `${g.item}: `, bold: true, size: 20, color: CREAM, font: 'Calibri' }),
              new TextRun({ text: g.description, size: 20, color: MUTED, font: 'Calibri' }),
            ],
          })
        )
      })
    }

    sections.push(divider())
  }

  // Missing footage
  if (ec.missing_footage?.length > 0) {
    sections.push(label('Missing Footage'))
    ec.missing_footage.forEach((m) => {
      sections.push(
        new Paragraph({
          spacing: { after: 60 },
          children: [
            tagPill(m.priority || 'tbd', m.priority === 'critical' ? 'FF6666' : MUTED),
            new TextRun({ text: m.description, size: 20, color: CREAM, font: 'Calibri' }),
          ],
        })
      )
      if (m.suggestion) sections.push(body(m.suggestion, { italic: true, color: MUTED }))
    })
    sections.push(divider())
  }

  // Delivery specs
  if (ec.delivery_specs) {
    const ds = ec.delivery_specs
    sections.push(label('Delivery Specs'))
    const specs = [ds.aspect_ratio, ds.resolution, ds.frame_rate, ds.audio_format].filter(Boolean).join('  |  ')
    sections.push(body(specs, { color: MUTED }))
  }

  const doc = new Document({
    background: { color: DARK },
    styles: {
      default: {
        document: {
          run: { color: CREAM, font: 'Calibri', size: 22 },
        },
      },
    },
    sections: [{ children: sections }],
  })

  const blob = await Packer.toBlob(doc)
  const filename = `${(ec.editor_cut_title || 'editor_cut').replace(/[^a-zA-Z0-9 ]/g, '').replace(/\s+/g, '_')}.docx`
  saveAs(blob, filename)
}
