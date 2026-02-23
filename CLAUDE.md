# Tarantino — AI-Powered Documentary Production Tool

## What This Is
An internal tool for **Codebasics** to streamline documentary filmmaking — from story development through final edit instructions. Built as a React (Vite) web app that uses the Anthropic API (Claude) as the AI backbone.

## Current Focus
A documentary about **how Codebasics is navigating the AI wave with an internal 45-day transformation bootcamp** — involving multiple interviews, behind-the-scenes footage, and team transformation stories.

## Architecture

```
tarantino/
├── src/
│   ├── components/
│   │   ├── PhaseNav.jsx              # Top navigation across 4 phases
│   │   ├── StoryDevelopment.jsx      # Phase 1: AD-style questionnaire
│   │   ├── ScriptGeneration.jsx      # Phase 2: AI generates doc structure
│   │   ├── FootageReview.jsx         # Phase 3: Upload/paste footage & transcripts
│   │   ├── ScreenplayEdit.jsx        # Phase 4: AI generates edit instructions
│   │   └── ui/                       # Shared UI components
│   │       ├── TypewriterText.jsx
│   │       ├── Spinner.jsx
│   │       └── common.jsx            # Shared styles & small components
│   ├── services/
│   │   └── claude.js                 # Anthropic API wrapper
│   ├── prompts/
│   │   ├── scriptGeneration.js       # Prompt template for Phase 2
│   │   ├── screenplayGeneration.js   # Prompt template for Phase 4
│   │   └── interviewCoach.js         # (Future) Real-time interview coaching
│   ├── data/
│   │   └── storyQuestions.js         # The 15 AD questions config
│   ├── hooks/
│   │   ├── useLocalStorage.js        # Persist state across sessions
│   │   └── useAIGeneration.js        # Shared hook for AI generation with retry
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css                     # Global styles, CSS variables, fonts
├── CLAUDE.md                         # ← This file (project context for Claude Code)
├── .env.example                      # VITE_ANTHROPIC_API_KEY placeholder
├── package.json
├── vite.config.js
└── README.md
```

## Design System

- **Aesthetic**: Cinematic, dark, editorial — like a film production tool, not a SaaS dashboard
- **Background**: #0A0A0A deep black
- **Primary accent**: #E8C547 warm gold (like a film reel / Oscar gold)
- **Text**: #F5F0E8 warm off-white
- **Fonts**: 
  - Display: Playfair Display (serif, elegant)
  - Body: DM Sans (clean, readable)
  - Mono: JetBrains Mono (timecodes, technical labels)
- **Animations**: Subtle — typewriter effects, smooth transitions, minimal spinners
- **Cut type color coding**:
  - Interview: #64C8FF (cool blue)
  - B-Roll: #64FF96 (green)
  - Narration/VO: #FFC864 (warm amber)
  - Title cards: #C896FF (purple)
  - Montage: #FF96C8 (pink)

## The 4-Phase Pipeline

### Phase 1: Story Development (Assistant Director)
- Presents 15 carefully ordered questions one at a time
- Questions cover: title, logline, central question, audience, tone, duration, characters, story arc, key moments, conflict/tension, visual style, interviews planned, b-roll plans, desired outcome, distribution
- Supports text, textarea, and single-select question types
- Progress bar with question counter

### Phase 2: Script & Structure Generation
- Takes all Phase 1 answers → sends to Claude API
- Generates: acts, scenes, interview guides, b-roll suggestions, music notes, opening hook, closing image
- Output is structured JSON rendered as a beautiful production document
- Regenerate button available

### Phase 3: Footage Review
- User adds footage clips manually (later: auto-import from folders)
- Each clip has: label, type (interview/broll/voiceover/event/screen), duration, transcript, notes
- Expandable/collapsible clip cards
- Key moments can be tagged with timecodes in notes

### Phase 4: Screenplay & Edit Instructions  
- Takes script structure (Phase 2) + footage inventory (Phase 3) → sends to Claude API
- Generates: cut-by-cut edit plan with source clips, timecodes, audio direction, text overlays, transitions
- Also generates: color grading notes, sound design notes, graphics needed, missing footage warnings, editor letter
- Color-coded by cut type for quick scanning

## Key Technical Decisions

1. **API calls happen client-side** — for now this is internal-only, so the API key is in .env. Later we can add a simple backend proxy.
2. **State persists via localStorage** — no database needed yet. All project data saved to browser.
3. **No authentication** — internal tool, single user at a time.
4. **Prompts are in separate files** — easy to iterate on prompt engineering without touching UI code.

## Coding Guidelines

- Use functional components with hooks
- Keep components focused — one file per phase, shared UI in `ui/`
- Tailwind CSS for utility classes + CSS variables for the design system
- All AI prompts should request JSON output and parse defensively
- Error states should be user-friendly with retry options
- Every AI generation should show a typewriter-style loading message

## Future Roadmap (don't build yet, but architect for it)

1. **Transcript auto-import**: Drag-drop video files → auto-transcribe via Whisper API
2. **Interview Coach**: Real-time AI suggestions during filming based on script gaps
3. **Multi-project support**: Save/load different documentary projects
4. **Timeline export**: Export edit instructions as EDL/XML for Premiere Pro/DaVinci Resolve
5. **Collaboration**: Multiple team members adding footage/notes
6. **AI storyboard**: Generate visual storyboard frames using image generation
7. **Extend beyond documentaries**: Short films, course intros, testimonial compilations

## Environment Variables

```
VITE_ANTHROPIC_API_KEY=your-api-key-here
```

## Running Locally

```bash
npm install
npm run dev
```

## Important Notes

- This is a Codebasics internal tool — not for public release (yet)
- The first documentary is about the 45-day AI transformation bootcamp
- Hem (founder) is the director — the tool should feel like talking to a sharp assistant director
- Quality of AI-generated scripts matters more than speed — use claude-sonnet-4-20250514 for generation
- Keep the UI dark and cinematic — this is a filmmaker's tool, not a corporate dashboard
