/**
 * Build the prompt for Transcript → Documentary Script generation.
 *
 * This is the "magic" prompt that replaces the manual work of:
 *   1. Reading all transcripts
 *   2. Finding the narrative arc
 *   3. Selecting the best quotes
 *   4. Structuring into chapters
 *   5. Adding narration, scene directions, tool demo placeholders
 *
 * @param {Array<{name: string, transcript: string}>} transcripts
 * @param {object} storyBrief - { direction, title, tone, duration }
 * @returns {string} Full prompt for Claude
 */
export function buildTranscriptScriptPrompt(transcripts, storyBrief) {
  const transcriptBlock = transcripts
    .map(
      (t, i) =>
        `--- TRANSCRIPT ${i + 1}: ${t.name.toUpperCase()} ---
${t.transcript.substring(0, 6000)}
--- END ${t.name.toUpperCase()} ---`
    )
    .join('\n\n')

  return `You are a world-class documentary filmmaker. You have been given raw interview transcripts from team members of a company. Your job is to find the story hidden inside these transcripts and craft a professional documentary script.

DIRECTOR'S BRIEF:
- Working Title: ${storyBrief.title || 'Untitled Documentary'}
- Story Direction: ${storyBrief.direction || 'Find the best story from the transcripts'}
- Tone: ${storyBrief.tone || 'Mix of raw honesty and inspiration'}
- Target Duration: ${storyBrief.duration || '20-30 minutes'}
${storyBrief.additionalNotes ? `- Additional Notes: ${storyBrief.additionalNotes}` : ''}

RAW TRANSCRIPTS:
${transcriptBlock}

YOUR TASK:

1. READ all transcripts carefully. Note that these are raw speech-to-text outputs — they contain retakes, false starts, and filler. Extract the REAL content.

2. FIND THE STORY ARC. Look for:
   - A triggering event (what started everything?)
   - Rising action (early reactions, first attempts, breakthroughs)
   - Complications (doubts, setbacks, hard truths)
   - Climax (the turning point / key realization)
   - Resolution (where things stand now, what changed)

3. SELECT THE BEST QUOTES. For each person, pick their most powerful, authentic, emotional lines. Clean up speech disfluencies but keep the voice natural. Never fabricate quotes — only use what they actually said.

4. STRUCTURE INTO CHAPTERS. Create a screenplay-style documentary script with:
   - A cold open (hook the viewer in 60 seconds)
   - 6-10 chapters, each with a clear purpose
   - Scene headings (INT./EXT., location, time)
   - Stage directions in [brackets]
   - Dialogue attributed to speakers with their actual quotes
   - Narrator voiceover (V.O.) to bridge sections and add context
   - Placeholders for tool demos / screen recordings where people mention building specific tools

5. END WITH IMPACT. The closing should land emotionally.

Respond ONLY with valid JSON in this exact format (no markdown, no backticks, no preamble):
{
  "title": "Documentary title",
  "subtitle": "A subtitle or tagline",
  "total_duration_estimate": "e.g., 25 minutes",
  "story_summary": "2-3 sentence summary of the story you found in the transcripts",
  "characters": [
    {
      "name": "Person name",
      "role": "Their role/context (inferred from transcript)",
      "arc": "Their personal journey in 1 sentence",
      "best_quotes": ["Their top 2-3 most powerful quotes"]
    }
  ],
  "chapters": [
    {
      "chapter_number": 0,
      "chapter_title": "Cold Open",
      "purpose": "Why this chapter exists in the story",
      "duration_estimate": "e.g., 1:30",
      "beats": [
        {
          "type": "scene_heading",
          "content": "INT. LOCATION — TIME"
        },
        {
          "type": "direction",
          "content": "Stage direction describing visuals"
        },
        {
          "type": "dialogue",
          "speaker": "PERSON NAME",
          "content": "Their actual quote from the transcript"
        },
        {
          "type": "narration",
          "content": "Narrator voiceover text"
        },
        {
          "type": "tool_demo",
          "tool_name": "Name of the tool/product they built",
          "description": "What to show in the screen recording"
        }
      ]
    }
  ],
  "production_notes": {
    "missing_footage": ["Things you'd want to capture that aren't in the transcripts"],
    "music_direction": "Overall music/sound guidance",
    "visual_style": "How this should look and feel",
    "tools_to_demo": [
      {
        "tool_name": "Name",
        "built_by": "Person",
        "what_to_show": "Description of screen recording needed"
      }
    ],
    "additional_interviews_needed": ["People or topics you'd want more footage on"],
    "editors_note": "A letter to the editor explaining vision and priorities"
  }
}`
}
