import { useState } from 'react'

export default function FootageReview({ footage, setFootage, onComplete }) {
  const [editingId, setEditingId] = useState(null)

  const addFootage = () => {
    const newItem = {
      id: Date.now().toString(),
      label: '',
      type: 'interview',
      transcript: '',
      notes: '',
      duration: '',
      subjects: '',
    }
    setFootage([...footage, newItem])
    setEditingId(newItem.id)
  }

  const updateFootage = (id, field, value) => {
    setFootage(footage.map((f) => (f.id === id ? { ...f, [field]: value } : f)))
  }

  const removeFootage = (id) => {
    setFootage(footage.filter((f) => f.id !== id))
    if (editingId === id) setEditingId(null)
  }

  const typeStyles = {
    interview: { bg: 'bg-forge-interview/10', text: 'text-forge-interview' },
    broll: { bg: 'bg-forge-broll/10', text: 'text-forge-broll' },
    voiceover: { bg: 'bg-forge-narration/10', text: 'text-forge-narration' },
    event: { bg: 'bg-forge-titlecard/10', text: 'text-forge-titlecard' },
    screen: { bg: 'bg-forge-montage/10', text: 'text-forge-montage' },
  }

  return (
    <div className="mx-auto max-w-[900px] px-5 py-10">
      <div className="mb-8">
        <h2 className="font-display text-[28px] font-normal text-forge-cream">
          Footage & Transcript Review
        </h2>
        <p className="mt-2 text-[15px] text-white/40">
          Add your footage clips and their transcripts. Paste interview
          transcripts, describe B-roll, or note key moments from each piece of
          footage.
        </p>
      </div>

      {/* Footage List */}
      {footage.map((item, index) => {
        const ts = typeStyles[item.type] || typeStyles.interview
        return (
          <div
            key={item.id}
            className={`mb-4 overflow-hidden rounded-[14px] border bg-white/[0.01] transition-colors ${
              editingId === item.id
                ? 'border-forge-gold/25'
                : 'border-white/5'
            }`}
          >
            {/* Header Row */}
            <div
              onClick={() =>
                setEditingId(editingId === item.id ? null : item.id)
              }
              className="flex cursor-pointer items-center justify-between bg-white/[0.005] px-5 py-4"
            >
              <div className="flex items-center gap-3">
                <span className="min-w-[24px] font-mono text-[11px] font-semibold text-forge-gold/50">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span
                  className={`rounded-md px-2.5 py-0.5 font-body text-[11px] font-bold uppercase tracking-wide ${ts.bg} ${ts.text}`}
                >
                  {item.type === 'broll' ? 'B-Roll' : item.type}
                </span>
                <span
                  className={`text-[15px] ${item.label ? 'text-forge-cream' : 'text-white/25'}`}
                >
                  {item.label || 'Untitled clip'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                {item.duration && (
                  <span className="font-mono text-xs text-white/25">
                    {item.duration}
                  </span>
                )}
                <span
                  className="text-lg text-white/25 transition-transform"
                  style={{
                    transform:
                      editingId === item.id
                        ? 'rotate(180deg)'
                        : 'rotate(0deg)',
                  }}
                >
                  ⌄
                </span>
              </div>
            </div>

            {/* Expanded Form */}
            {editingId === item.id && (
              <div className="flex flex-col gap-3.5 px-5 pb-5">
                <div className="grid grid-cols-3 gap-3">
                  <Field
                    label="Clip Label"
                    value={item.label}
                    onChange={(v) => updateFootage(item.id, 'label', v)}
                    placeholder="e.g., Hem - Founder Interview"
                  />
                  <div>
                    <label className="mb-1.5 block font-body text-[11px] font-bold uppercase tracking-widest text-forge-gold/60">
                      Type
                    </label>
                    <select
                      value={item.type}
                      onChange={(e) =>
                        updateFootage(item.id, 'type', e.target.value)
                      }
                      className="w-full cursor-pointer rounded-lg border border-white/[0.06] bg-white/[0.02] px-3.5 py-2.5 text-sm text-forge-cream"
                    >
                      <option value="interview">Interview</option>
                      <option value="broll">B-Roll</option>
                      <option value="voiceover">Voiceover</option>
                      <option value="event">Event/Meeting</option>
                      <option value="screen">Screen Recording</option>
                    </select>
                  </div>
                  <Field
                    label="Duration"
                    value={item.duration}
                    onChange={(v) => updateFootage(item.id, 'duration', v)}
                    placeholder="e.g., 12:34"
                  />
                </div>

                {item.type === 'interview' && (
                  <Field
                    label="Interview Subject(s)"
                    value={item.subjects}
                    onChange={(v) => updateFootage(item.id, 'subjects', v)}
                    placeholder="e.g., Hem Patel, Co-founder"
                  />
                )}

                <div>
                  <label className="mb-1.5 block font-body text-[11px] font-bold uppercase tracking-widest text-forge-gold/60">
                    Transcript / Description
                    <span className="font-normal text-white/20">
                      {' '}
                      — Paste full transcript or describe what happens
                    </span>
                  </label>
                  <textarea
                    value={item.transcript}
                    onChange={(e) =>
                      updateFootage(item.id, 'transcript', e.target.value)
                    }
                    placeholder="Paste the transcript here, or describe what this footage contains..."
                    rows={8}
                    className="w-full resize-y rounded-lg border border-white/[0.06] bg-white/[0.02] p-3.5 text-sm leading-relaxed text-forge-cream placeholder-white/20"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block font-body text-[11px] font-bold uppercase tracking-widest text-forge-gold/60">
                    Notes / Key Moments
                  </label>
                  <textarea
                    value={item.notes}
                    onChange={(e) =>
                      updateFootage(item.id, 'notes', e.target.value)
                    }
                    placeholder="e.g., Great quote at 3:42 about fear of AI. Emotional moment at 7:15."
                    rows={3}
                    className="w-full resize-y rounded-lg border border-white/[0.06] bg-white/[0.02] p-3.5 text-sm leading-relaxed text-forge-cream placeholder-white/20"
                  />
                </div>

                <button
                  onClick={() => removeFootage(item.id)}
                  className="self-start rounded-md border border-red-400/20 px-3.5 py-1.5 text-xs text-red-400/50 transition hover:border-red-400/40 hover:text-red-400/70"
                >
                  Remove Clip
                </button>
              </div>
            )}
          </div>
        )
      })}

      {/* Add Button */}
      <button
        onClick={addFootage}
        className="mb-8 w-full rounded-[14px] border-2 border-dashed border-forge-gold/15 bg-transparent py-5 text-[15px] text-forge-gold/40 transition-colors hover:border-forge-gold/30 hover:text-forge-gold/70"
      >
        + Add Footage Clip
      </button>

      {footage.length > 0 && (
        <div className="flex justify-center">
          <button
            onClick={onComplete}
            className="rounded-lg bg-gradient-to-br from-forge-gold to-forge-gold-dark px-8 py-3.5 text-[15px] font-semibold text-forge-black"
          >
            Generate Screenplay & Edit Instructions →
          </button>
        </div>
      )}
    </div>
  )
}

function Field({ label, value, onChange, placeholder }) {
  return (
    <div>
      <label className="mb-1.5 block font-body text-[11px] font-bold uppercase tracking-widest text-forge-gold/60">
        {label}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-white/[0.06] bg-white/[0.02] px-3.5 py-2.5 text-sm text-forge-cream placeholder-white/20"
      />
    </div>
  )
}
