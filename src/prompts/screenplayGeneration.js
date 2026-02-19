/**
 * Build the prompt for Phase 4: Screenplay & Edit Instructions
 * @param {object} script - Generated script from Phase 2
 * @param {Array} footage - Footage inventory from Phase 3
 * @returns {string} Full prompt for Claude
 */
export function buildScreenplayPrompt(script, footage) {
  const footageSummary = footage
    .map(
      (f, i) =>
        `CLIP ${i + 1}: "${f.label}" (${f.type}, ${f.duration || 'unknown duration'})
Subject: ${f.subjects || 'N/A'}
Transcript/Description: ${f.transcript?.substring(0, 2000) || 'No transcript'}
Key Notes: ${f.notes || 'None'}`
    )
    .join('\n\n')

  const scriptSummary = JSON.stringify(script, null, 2).substring(0, 4000)

  return `You are an expert documentary editor and screenplay writer. Given the following documentary script structure and available footage, create a detailed screenplay with editing instructions.

DOCUMENTARY SCRIPT STRUCTURE:
${scriptSummary}

AVAILABLE FOOTAGE:
${footageSummary}

Create a detailed screenplay with editing instructions in the following JSON format ONLY (no markdown, no backticks):
{
  "screenplay_title": "Title",
  "total_runtime_estimate": "e.g., 22 minutes",
  "sequences": [
    {
      "sequence_number": 1,
      "sequence_title": "e.g., Cold Open",
      "duration_estimate": "e.g., 1:30",
      "cuts": [
        {
          "cut_number": "1.1",
          "type": "interview|broll|narration|title_card|montage|transition",
          "source_clip": "Which footage clip to use (reference by label)",
          "timecode_suggestion": "e.g., 03:42 - 04:15 (if known from notes)",
          "description": "What appears on screen",
          "audio": "What the viewer hears (dialogue, music, ambient)",
          "text_overlay": "Any lower thirds, titles, or text (null if none)",
          "transition": "Cut/dissolve/fade to next",
          "editing_notes": "Specific technical instructions for the editor"
        }
      ],
      "pacing_notes": "Overall feel and rhythm of this sequence",
      "music_cue": "Music direction for this sequence"
    }
  ],
  "color_grading_notes": "Overall color treatment guidance",
  "sound_design_notes": "Overall sound mix guidance",
  "graphics_needed": ["List of graphics/animations to create"],
  "missing_footage_notes": ["Footage gaps that need to be shot"],
  "editor_summary": "A letter to the editor explaining the overall vision and feel"
}`
}
