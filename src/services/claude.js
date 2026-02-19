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

  // Strip markdown fences and parse JSON
  const clean = text.replace(/```json\s*|```\s*/g, '').trim()

  try {
    return JSON.parse(clean)
  } catch (parseErr) {
    console.error('Failed to parse AI response:', clean.substring(0, 500))
    throw new Error('AI returned invalid JSON. Please retry.')
  }
}
