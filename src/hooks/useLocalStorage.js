import { useState, useEffect } from 'react'

/**
 * useState that persists to localStorage.
 * @param {string} key - localStorage key
 * @param {*} initialValue - Default value if nothing in storage
 */
export function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    try {
      const stored = localStorage.getItem(`tarantino:${key}`)
      return stored ? JSON.parse(stored) : initialValue
    } catch {
      return initialValue
    }
  })

  useEffect(() => {
    try {
      localStorage.setItem(`tarantino:${key}`, JSON.stringify(value))
    } catch (err) {
      console.warn('Failed to save to localStorage:', err)
    }
  }, [key, value])

  return [value, setValue]
}
