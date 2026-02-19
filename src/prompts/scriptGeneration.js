/**
 * Build the prompt for Phase 2: Script & Structure Generation
 * @param {object} answers - All story development answers from Phase 1
 * @returns {string} Full prompt for Claude
 */
export function buildScriptPrompt(answers) {
  return `You are an expert documentary filmmaker and screenwriter. Based on the following story brief from the director, create a detailed documentary script/structure.

STORY BRIEF:
- Title: ${answers.title || 'Untitled'}
- Logline: ${answers.logline || 'Not provided'}
- Central Question: ${answers.core_question || 'Not provided'}
- Target Audience: ${answers.audience || 'General'}
- Tone: ${answers.tone || 'Not specified'}
- Duration: ${answers.duration || 'Medium'}
- Key Characters: ${answers.key_characters || 'Not provided'}
- Story Arc: ${answers.story_arc || 'Not provided'}
- Key Moments: ${answers.key_moments || 'Not provided'}
- Conflict/Tension: ${answers.conflict || 'Not provided'}
- Visual Style: ${answers.visual_style || 'Not specified'}
- Interviews Planned: ${answers.interviews_planned || 'Not specified'}
- B-Roll Plans: ${answers.b_roll || 'Not specified'}
- Desired Outcome: ${answers.desired_outcome || 'Not specified'}
- Distribution: ${answers.distribution || 'Not specified'}

Please generate a comprehensive documentary structure in the following JSON format ONLY (no markdown, no backticks, no preamble):
{
  "title": "Final documentary title",
  "logline": "Refined one-line logline",
  "total_duration_estimate": "e.g., 25-30 minutes",
  "acts": [
    {
      "act_number": 1,
      "act_title": "e.g., The Wake-Up Call",
      "duration_estimate": "e.g., 5-7 min",
      "purpose": "What this act accomplishes narratively",
      "scenes": [
        {
          "scene_number": "1.1",
          "scene_title": "Opening",
          "description": "What happens in this scene",
          "interview_subjects": ["Who speaks here"],
          "sample_interview_questions": ["What questions to ask"],
          "b_roll_suggestions": ["What visuals to capture"],
          "mood": "The emotional tone",
          "narration_notes": "Any voiceover or text overlay suggestions"
        }
      ]
    }
  ],
  "interview_guide": [
    {
      "subject": "Person name/role",
      "focus_areas": ["What to explore with them"],
      "key_questions": ["Specific questions to ask"],
      "emotional_beats": "What emotion to draw out"
    }
  ],
  "music_and_sound_notes": "Overall audio direction",
  "visual_style_guide": "Specific visual guidelines",
  "opening_hook": "How the first 30 seconds should look/feel",
  "closing_image": "How the documentary should end"
}`
}
