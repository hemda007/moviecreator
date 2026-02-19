import { useState, useEffect, useRef } from 'react'

export function TypewriterText({ text, speed = 20, onComplete }) {
  const [displayed, setDisplayed] = useState('')
  const indexRef = useRef(0)

  useEffect(() => {
    setDisplayed('')
    indexRef.current = 0
    const interval = setInterval(() => {
      if (indexRef.current < text.length) {
        setDisplayed(text.slice(0, indexRef.current + 1))
        indexRef.current++
      } else {
        clearInterval(interval)
        onComplete?.()
      }
    }, speed)
    return () => clearInterval(interval)
  }, [text, speed])

  return <span>{displayed}</span>
}

export function Spinner() {
  return (
    <div className="h-12 w-12 animate-spin rounded-full border-[3px] border-forge-gold/20 border-t-forge-gold" />
  )
}

export function ErrorState({ message, onRetry }) {
  return (
    <div className="py-20 text-center">
      <p className="mb-5 text-red-400">{message}</p>
      <button
        onClick={onRetry}
        className="rounded-lg bg-gradient-to-br from-forge-gold to-forge-gold-dark px-7 py-3 text-sm font-semibold text-forge-black"
      >
        Retry
      </button>
    </div>
  )
}
