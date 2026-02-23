const API_URL = 'https://api.anthropic.com/v1/messages'
const MODEL = 'claude-sonnet-4-20250514'

/**
 * Call Claude API with a prompt and get parsed JSON back.
 * @param {string} prompt - The full prompt to send
 * @param {number} maxTokens - Max tokens for response
 * @returns {object} Parsed JSON response
 */
export async function generateWithClaude(prompt, maxTokens = 16000) {
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

  // Check if the response was truncated due to max_tokens
  const stopReason = data.stop_reason
  const text = data.content
    .map((block) => (block.type === 'text' ? block.text : ''))
    .filter(Boolean)
    .join('\n')

  // Extract and parse JSON from AI response
  const parsed = extractJSON(text)
  if (parsed !== null) return parsed

  console.error('Failed to parse AI response:', text.substring(0, 500))
  if (stopReason === 'max_tokens') {
    throw new Error('AI response was cut off (too long). Retrying usually fixes this.')
  }
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
      // continue to next strategy
    }
  }

  // 4. Try to repair truncated JSON by closing open brackets/braces
  if (firstBrace !== -1) {
    try {
      return repairTruncatedJSON(stripped.substring(firstBrace))
    } catch {
      // all strategies exhausted
    }
  }

  return null
}

/**
 * Attempt to repair truncated JSON by closing unclosed brackets and braces.
 * This handles cases where the AI hit max_tokens mid-response.
 */
function repairTruncatedJSON(text) {
  // Remove any trailing incomplete string value (after last complete key-value)
  let repaired = text.replace(/,\s*"[^"]*"?\s*:?\s*"?[^"{}[\]]*$/, '')

  // Count open/close brackets
  const opens = []
  let inString = false
  let escaped = false

  for (const ch of repaired) {
    if (escaped) {
      escaped = false
      continue
    }
    if (ch === '\\') {
      escaped = true
      continue
    }
    if (ch === '"') {
      inString = !inString
      continue
    }
    if (inString) continue

    if (ch === '{' || ch === '[') opens.push(ch)
    else if (ch === '}' && opens.length && opens[opens.length - 1] === '{') opens.pop()
    else if (ch === ']' && opens.length && opens[opens.length - 1] === '[') opens.pop()
  }

  // Close any remaining open brackets in reverse order
  while (opens.length) {
    const open = opens.pop()
    repaired += open === '{' ? '}' : ']'
  }

  return JSON.parse(repaired)
}
