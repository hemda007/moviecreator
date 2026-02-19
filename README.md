# 🎬 DocuForge

AI-powered documentary production tool for Codebasics. Acts as your assistant director from story development through final edit instructions.

## Quick Start

```bash
# 1. Clone and install
git clone <your-repo-url>
cd docuforge
npm install

# 2. Add your Anthropic API key
cp .env.example .env
# Edit .env and add your key

# 3. Run
npm run dev
```

## The Pipeline

| Phase | What It Does |
|-------|-------------|
| **Story Development** | 15 AD-style questions to capture your vision |
| **Script & Structure** | AI generates acts, scenes, interview guides |
| **Footage Review** | Add clips, paste transcripts, tag key moments |
| **Screenplay & Edit** | AI maps footage to script with cut-by-cut instructions |

## Tech Stack

- React 18 + Vite
- Tailwind CSS
- Anthropic Claude API (Sonnet 4)

## Current Documentary

**"The 45-Day Transformation"** — How Codebasics is navigating the AI wave with an internal transformation bootcamp.
