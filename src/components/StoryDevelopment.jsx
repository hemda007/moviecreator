import { useState, useEffect, useRef } from 'react'
import { STORY_QUESTIONS } from '../data/storyQuestions'

export default function StoryDevelopment({ answers, setAnswers, onComplete }) {
  const [currentQ, setCurrentQ] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const inputRef = useRef(null)

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 300)
  }, [currentQ])

  const q = STORY_QUESTIONS[currentQ]
  const progress = ((currentQ + 1) / STORY_QUESTIONS.length) * 100

  const handleNext = () => {
    if (currentQ < STORY_QUESTIONS.length - 1) {
      setIsTransitioning(true)
      setTimeout(() => {
        setCurrentQ(currentQ + 1)
        setIsTransitioning(false)
      }, 200)
    } else {
      onComplete()
    }
  }

  const handleBack = () => {
    if (currentQ > 0) {
      setIsTransitioning(true)
      setTimeout(() => {
        setCurrentQ(currentQ - 1)
        setIsTransitioning(false)
      }, 200)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && q.type !== 'textarea') {
      e.preventDefault()
      if (answers[q.id]) handleNext()
    }
    if (e.key === 'Enter' && e.ctrlKey && q.type === 'textarea') {
      e.preventDefault()
      if (answers[q.id]) handleNext()
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-5 py-10">
      {/* Progress */}
      <div className="mb-3 flex items-center gap-3">
        <div className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/5">
          <div
            className="h-full rounded-full bg-gradient-to-r from-forge-gold to-forge-gold-dark transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="font-mono text-xs tabular-nums text-white/30">
          {currentQ + 1}/{STORY_QUESTIONS.length}
        </span>
      </div>

      {/* AD label */}
      <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-forge-gold/15 bg-forge-gold/5 px-3.5 py-1.5">
        <span className="text-sm">🎬</span>
        <span className="font-body text-[11px] font-semibold uppercase tracking-widest text-forge-gold">
          Assistant Director
        </span>
      </div>

      {/* Question */}
      <div
        className="transition-all duration-200"
        style={{
          opacity: isTransitioning ? 0 : 1,
          transform: isTransitioning ? 'translateY(10px)' : 'translateY(0)',
        }}
      >
        <h2 className="mb-7 font-display text-2xl font-light leading-relaxed text-forge-cream">
          {q.question}
        </h2>

        {q.type === 'text' && (
          <input
            ref={inputRef}
            type="text"
            value={answers[q.id] || ''}
            onChange={(e) => setAnswers({ ...answers, [q.id]: e.target.value })}
            onKeyDown={handleKeyDown}
            placeholder={q.placeholder}
            className="w-full border-b-2 border-forge-gold/30 bg-transparent px-0 py-4 text-lg text-forge-cream placeholder-white/20 transition-colors focus:border-forge-gold"
          />
        )}

        {q.type === 'textarea' && (
          <div>
            <textarea
              ref={inputRef}
              value={answers[q.id] || ''}
              onChange={(e) =>
                setAnswers({ ...answers, [q.id]: e.target.value })
              }
              onKeyDown={handleKeyDown}
              placeholder={q.placeholder}
              rows={6}
              className="w-full resize-y rounded-xl border border-forge-gold/20 bg-white/[0.02] p-4 text-base leading-relaxed text-forge-cream placeholder-white/20 transition-colors focus:border-forge-gold/50"
            />
            <div className="mt-2 font-mono text-[11px] text-white/20">
              Ctrl + Enter to continue
            </div>
          </div>
        )}

        {q.type === 'select' && (
          <div className="flex flex-col gap-2">
            {q.options.map((opt) => (
              <button
                key={opt}
                onClick={() => {
                  setAnswers({ ...answers, [q.id]: opt })
                  setTimeout(handleNext, 300)
                }}
                className={`rounded-lg border px-5 py-3.5 text-left text-[15px] transition-all ${
                  answers[q.id] === opt
                    ? 'border-forge-gold bg-forge-gold/10 text-forge-gold'
                    : 'border-white/10 bg-white/[0.01] text-white/60 hover:border-white/20'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="mt-10 flex items-center justify-between">
        <button
          onClick={handleBack}
          disabled={currentQ === 0}
          className={`rounded-lg border border-white/10 px-5 py-2.5 text-sm ${
            currentQ === 0
              ? 'cursor-not-allowed text-white/15'
              : 'cursor-pointer text-white/50 hover:border-white/20'
          }`}
        >
          ← Back
        </button>
        {q.type !== 'select' && (
          <button
            onClick={handleNext}
            disabled={!answers[q.id]}
            className={`rounded-lg px-7 py-3 text-sm font-semibold transition-all ${
              answers[q.id]
                ? 'cursor-pointer bg-gradient-to-br from-forge-gold to-forge-gold-dark text-forge-black'
                : 'cursor-not-allowed bg-white/5 text-white/20'
            }`}
          >
            {currentQ === STORY_QUESTIONS.length - 1
              ? 'Generate Script →'
              : 'Continue →'}
          </button>
        )}
      </div>
    </div>
  )
}
