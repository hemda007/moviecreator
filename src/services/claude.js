const API_URL = 'https://api.anthropic.com/v1/messages'
const MODEL = 'claude-sonnet-4-20250514'

/**
 * Call Claude API with a prompt and get parsed JSON back.
 * @param {string} prompt - The full prompt to send
 * @param {number} maxTokens - Max tokens for response
 * @returns {object} Parsed JSON response
 */
export async function generateWithClaude(prompt, maxTokens = 8000) {
  const apiKey = import.meta.env.VITE_ANTHROPIC_API_KEY

  if (!apiKey) {
    throw new Error(
      'Missing VITE_ANTHROPIC_API_KEY. Add it to your .env file.'
    )
  }

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens,
      system: 'Respond with valid JSON only. No markdown, no code fences, no commentary before or after the JSON.',
      messages: [{ role: 'user', content: prompt }],
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`API error ${response.status}: ${err}`)
  }

  const data = await response.json()
  const text = data.content
    .map((block) => (block.type === 'text' ? block.text : ''))
    .filter(Boolean)
    .join('\n')

  // Extract and parse JSON from AI response
  const parsed = extractJSON(text)
  if (parsed !== null) return parsed

  console.error('Failed to parse AI response:', text.substring(0, 500))
  throw new Error('AI returned invalid JSON. Please retry.')
}

/**
 * Attempt to extract a JSON object from a string that may contain
 * markdown fences, preamble text, or trailing commentary.
 */
function extractJSON(text) {
  // 1. Try parsing the raw text directly
  try {
    return JSON.parse(text)
  } catch {
    // continue to next strategy
  }

  // 2. Strip markdown code fences and try again
  const stripped = text.replace(/```(?:json)?\s*|```\s*/g, '').trim()
  try {
    return JSON.parse(stripped)
  } catch {
    // continue to next strategy
  }

  // 3. Find the outermost { ... } and try to parse that
  const firstBrace = stripped.indexOf('{')
  const lastBrace = stripped.lastIndexOf('}')
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    try {
      return JSON.parse(stripped.substring(firstBrace, lastBrace + 1))
    } catch {
      // all strategies exhausted
    }
  }

  return null
}
