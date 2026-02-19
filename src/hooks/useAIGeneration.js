import { useState, useCallback } from 'react'
import { generateWithClaude } from '../services/claude'

/**
 * Shared hook for AI generation with loading, error, and retry.
 * @param {Function} buildPrompt - Function that returns the prompt string
 * @returns {{ data, isLoading, error, generate, reset }}
 */
export function useAIGeneration(buildPrompt) {
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const generate = useCallback(
    async (...args) => {
      setIsLoading(true)
      setError(null)
      try {
        const prompt = buildPrompt(...args)
        const result = await generateWithClaude(prompt)
        setData(result)
        return result
      } catch (err) {
        console.error('AI generation failed:', err)
        setError(err.message || 'Generation failed. Please retry.')
        return null
      } finally {
        setIsLoading(false)
      }
    },
    [buildPrompt]
  )

  const reset = useCallback(() => {
    setData(null)
    setError(null)
  }, [])

  return { data, setData, isLoading, error, generate, reset }
}
