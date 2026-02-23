/**
 * Build the prompt for Editor's Cut — detailed editing instructions
 * generated from the documentary script + original transcripts.
 *
 * This produces a cut-by-cut editing plan with:
 *   - Timecode references from transcripts
 *   - Text overlay instructions
 *   - Graphics & animation specs
 *   - Music cues per sequence
 *   - Transition instructions
 *   - Color grading & sound design notes
 *
 * @param {object} script - Generated script from ScriptViewer
 * @param {Array<{name: string, transcript: string}>} transcripts
 * @param {object} storyBrief - { direction, title, tone, duration }
 * @returns {string} Full prompt for Claude
 */
export function buildEditorCutPrompt(script, transcripts, storyBrief) {
  const transcriptBlock = transcripts
    .map(
      (t, i) =>
        `--- TRANSCRIPT ${i + 1}: ${t.name.toUpperCase()} ---
${t.transcript.substring(0, 5000)}
--- END ${t.name.toUpperCase()} ---`
    )
    .join('\n\n')

  const scriptSummary = JSON.stringify(script, null, 2).substring(0, 6000)

  return `You are an expert documentary editor who creates extremely detailed, editor-friendly edit decision lists. You've been given a documentary script and the original interview transcripts. Your job is to create a comprehensive editing instruction document that makes it incredibly easy for a video editor to assemble the final cut.

DOCUMENTARY SCRIPT:
${scriptSummary}

ORIGINAL TRANSCRIPTS (for timecode reference — estimate timecodes based on word position in transcript, assuming ~150 words per minute of speech):
${transcriptBlock}

DIRECTOR'S BRIEF:
- Title: ${storyBrief.title || 'Untitled Documentary'}
- Tone: ${storyBrief.tone || 'Mix of raw honesty and inspiration'}
- Duration: ${storyBrief.duration || '20-30 minutes'}

YOUR TASK:

Create a detailed, cut-by-cut editing instruction document. For EVERY cut, provide:
1. EXACT source — which transcript/interview clip and estimated timecode
2. What appears on screen (video description)
3. What the viewer hears (audio — dialogue, music, ambient)
4. Text overlays — lower thirds, titles, captions with exact text, font style suggestion, position, and timing
5. Graphics & animations — any motion graphics, data visualizations, icons, illustrations needed
6. Transitions — how to get to/from this cut (hard cut, dissolve, fade, wipe, etc.)
7. Technical editing notes — speed changes, color treatment, split screen, picture-in-picture, etc.

TIMECODE ESTIMATION RULES:
- For each transcript, assume the interview starts at 00:00
- Estimate ~150 words per minute of natural speech
- When you reference a quote, calculate its approximate position in the transcript based on word count before it
- Format timecodes as MM:SS or HH:MM:SS

Respond ONLY with valid JSON in this exact format (no markdown, no backticks):
{
  "editor_cut_title": "Title — Editor's Cut",
  "version": "Editor's Cut v1",
  "total_runtime_estimate": "e.g., 25 minutes",
  "editor_letter": "A detailed letter to the editor explaining the vision, pacing priorities, emotional arc, and what matters most in this edit. Be specific and passionate.",
  "sequences": [
    {
      "sequence_number": 1,
      "sequence_title": "e.g., Cold Open",
      "duration_estimate": "e.g., 1:30",
      "purpose": "Why this sequence exists and what it should make the viewer feel",
      "music_cue": {
        "track_description": "Describe the music — mood, instruments, tempo",
        "entry_point": "When music starts (e.g., from the top, after first line)",
        "dynamics": "How music evolves through this sequence (builds, drops, fades)"
      },
      "cuts": [
        {
          "cut_number": "1.1",
          "type": "interview|broll|narration|title_card|montage|transition|screen_recording",
          "source": "Which transcript/person this comes from (e.g., 'Naveen Interview')",
          "timecode_in": "Estimated start timecode in source (e.g., 04:22)",
          "timecode_out": "Estimated end timecode in source (e.g., 04:45)",
          "duration": "Length of this cut (e.g., 23s)",
          "description": "What appears on screen — be specific about framing, angle",
          "audio": "What the viewer hears — dialogue transcript, music level, ambient",
          "text_overlay": {
            "type": "lower_third|title_card|caption|subtitle|stat|quote_card",
            "text": "Exact text to display (null if none)",
            "position": "e.g., bottom-left, center, top-right",
            "style": "e.g., Clean white sans-serif, gold accent bar, animated slide-in",
            "timing": "When it appears and disappears relative to cut start"
          },
          "graphics": {
            "needed": true,
            "type": "e.g., animated_stat|logo_animation|icon_overlay|data_viz|illustration",
            "description": "Detailed description of what the graphic should look like and do",
            "timing": "When it appears in the cut"
          },
          "transition_in": "How this cut starts (e.g., hard cut, dissolve from previous)",
          "transition_out": "How this cut ends (e.g., cut to next, 0.5s dissolve)",
          "editing_notes": "Any special instructions — speed ramps, color shift, split screen, zoom, ken burns, etc."
        }
      ],
      "pacing_notes": "Overall rhythm and feel for this sequence"
    }
  ],
  "post_production": {
    "color_grading": {
      "overall_look": "The look and feel — warm, desaturated, high contrast, etc.",
      "per_type_treatment": {
        "interviews": "Color treatment for interview clips",
        "broll": "Color treatment for b-roll footage",
        "screen_recordings": "Color treatment for screen recordings/demos"
      }
    },
    "sound_design": {
      "overall_mix": "General sound mix guidance — dialogue levels, music balance",
      "ambient_beds": "Background ambience suggestions",
      "sound_effects": ["Specific sound effects needed and where"],
      "music_notes": "Final music mixing notes"
    },
    "graphics_package": [
      {
        "item": "Name/type of graphic",
        "description": "What it looks like, colors, animation style",
        "where_used": "Which cuts reference this graphic",
        "priority": "essential|nice_to_have"
      }
    ],
    "title_sequence": {
      "style": "How the opening titles should look and animate",
      "text": "Exact title text",
      "duration": "How long the title sequence lasts"
    },
    "end_credits": {
      "style": "Credits style",
      "content": "What to include in credits"
    }
  },
  "missing_footage": [
    {
      "description": "What's missing",
      "priority": "critical|important|nice_to_have",
      "suggestion": "How to get it or what to use as alternative"
    }
  ],
  "delivery_specs": {
    "aspect_ratio": "16:9",
    "resolution": "4K or 1080p",
    "frame_rate": "24fps for cinematic feel",
    "audio_format": "Stereo mix + separate dialogue/music/sfx stems"
  }
}`
}
