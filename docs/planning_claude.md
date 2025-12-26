# Contract Generator AI - Implementation Plan

## Project Overview

Build a full-stack contract generation system with:
- **AI-powered chat interface** (text-first, voice added later)
- **AI-powered research** via Tavily API
- **Professional .docx generation** (e-signature ready)
- **Research-first methodology** (10 mandatory research areas)

## User Decisions (Confirmed)

| Decision | Choice |
|----------|--------|
| MVP Focus | **Text-first** - Chat interface first, voice later |
| Authentication | **Skip for now** - Add later |
| Contract Types | **Service/Consulting agreements** - Primary focus |
| Research API | **Tavily** - AI-optimized search |

## Current State

- **Existing**: Documentation only (Claude.md, docs/Claude_prompt.md, docs/System_Prompt.md)
- **To Build**: Everything - greenfield project

---

## Phase 1: Project Scaffolding (Start Here)

### 1.1 Initialize Next.js Frontend
```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --turbopack
```
- [ ] Configure `postcss.config.mjs` with `@tailwindcss/postcss` only
- [ ] Set up `app/globals.css` with Tailwind v4 `@theme` directive
- [ ] Install: `framer-motion`
- [ ] Initialize shadcn/ui

### 1.2 Initialize Python Backend
- [ ] Create `backend/` directory
- [ ] Create `backend/main.py` - FastAPI entry point
- [ ] Create `backend/requirements.txt`:
  ```
  fastapi==0.115.0
  uvicorn==0.32.0
  python-docx==1.1.0
  anthropic==0.39.0
  tavily-python==0.5.0
  pydantic==2.10.0
  python-multipart==0.0.12
  ```
- [ ] Configure CORS for localhost:3000

### 1.3 Environment Setup
- [ ] Create `.env.example` and `.env.local`:
  ```
  ANTHROPIC_API_KEY=sk-ant-...
  TAVILY_API_KEY=tvly-...
  PYTHON_BACKEND_URL=http://localhost:8000
  ```

**Critical Files to Create:**
- `app/layout.tsx`
- `app/page.tsx`
- `app/globals.css`
- `postcss.config.mjs`
- `backend/main.py`

---

## Phase 2: Core UI Components

### 2.1 Layout & Navigation
- [ ] Root layout with Inter/Space Grotesk fonts
- [ ] Landing page with "Start Contract" CTA
- [ ] Simple navigation header

### 2.2 shadcn/ui Components
```bash
npx shadcn@latest add button card input textarea dialog tabs toast scroll-area
```

### 2.3 Animation Foundation
- [ ] Framer Motion page transitions
- [ ] Loading states with motion

**Critical Files:**
- `components/ui/*.tsx` (shadcn)
- `components/layout/Header.tsx`

---

## Phase 3: Chat & AI Integration (Core Feature)

### 3.1 Python Backend - Claude Integration
- [ ] `backend/ai/claude.py` - Claude API client with system prompt
- [ ] `backend/ai/prompts.py` - Contract generation prompts
- [ ] FastAPI endpoint: `POST /api/chat`

### 3.2 Chat UI Components
- [ ] `components/chat/ChatInterface.tsx` - Main chat container
- [ ] `components/chat/MessageBubble.tsx` - User/AI messages
- [ ] `components/chat/ChatInput.tsx` - Text input with send
- [ ] `components/chat/TypingIndicator.tsx` - AI thinking state

### 3.3 Chat Page
- [ ] `app/chat/page.tsx` - Chat interface page
- [ ] `app/api/chat/route.ts` - Next.js API route (proxy to Python)

**Critical Files:**
- `backend/ai/claude.py`
- `components/chat/ChatInterface.tsx`
- `app/chat/page.tsx`

---

## Phase 4: Research Module (Tavily Integration)

### 4.1 Research Engine
- [ ] `backend/research/searcher.py` - Tavily API integration
- [ ] Implement 10 mandatory research areas:
  1. Contract standards
  2. Industry norms
  3. Jurisdiction requirements
  4. Deal benchmarks
  5. Common disputes
  6. Recent developments
  7. Power dynamics
  8. Termination scenarios
  9. Enforceability
  10. Alternative structures

### 4.2 Research UI
- [ ] `components/research/ResearchProgress.tsx` - Progress indicator
- [ ] `components/research/ResearchSummary.tsx` - Display findings

**Critical Files:**
- `backend/research/searcher.py`
- `components/research/ResearchProgress.tsx`

---

## Phase 5: Contract Generation (DOCX Output)

### 5.1 Contract Generator
- [ ] `backend/contracts/generator.py` - DOCX generation with python-docx
- [ ] `backend/contracts/templates/service_agreement.py` - Service contract template
- [ ] `backend/contracts/clauses.py` - Clause library (protective, universal)
- [ ] `backend/contracts/formatting.py` - E-signature formatting

### 5.2 Contract Wizard UI
- [ ] `components/contracts/ContractWizard.tsx` - Step-by-step intake
- [ ] `components/contracts/ContractPreview.tsx` - Preview generated contract
- [ ] `components/contracts/ClauseSelector.tsx` - Optional clause selection

### 5.3 Contract Pages
- [ ] `app/contracts/page.tsx` - List/history
- [ ] `app/contracts/new/page.tsx` - New contract wizard
- [ ] Download endpoint for .docx files

**Critical Files:**
- `backend/contracts/generator.py`
- `backend/contracts/templates/service_agreement.py`
- `components/contracts/ContractWizard.tsx`

---

## Phase 6: Voice Interface (Future)

*Deferred - will add after MVP is complete*

- [ ] Install Faster-Whisper for STT
- [ ] Install Coqui TTS for speech synthesis
- [ ] Voice recording components
- [ ] Voice page integration

---

## Phase 7: Polish & Auth (Future)

*Deferred - add when ready for production*

- [ ] NextAuth.js setup
- [ ] User accounts
- [ ] Contract storage per user
- [ ] Deployment

---

## Technical Stack (Final)

### Frontend
| Package | Version | Purpose |
|---------|---------|---------|
| Next.js | 16.0.5 | Framework (App Router) |
| React | 19.2.0 | UI Library |
| TypeScript | 5.x | Type safety |
| Tailwind CSS | 4.x | Styling (CSS-first) |
| Framer Motion | latest | Animations |
| shadcn/ui | latest | UI components |

### Backend
| Package | Version | Purpose |
|---------|---------|---------|
| FastAPI | 0.115.0 | API framework |
| anthropic | 0.39.0 | Claude API |
| tavily-python | 0.5.0 | Research API |
| python-docx | 1.1.0 | DOCX generation |

---

## Implementation Order (Recommended)

```
Phase 1: Scaffolding     → Get both apps running
Phase 2: UI Components   → Basic layout and components
Phase 3: Chat & AI       → Core conversation working
Phase 4: Research        → 10-area research integration
Phase 5: Contract Gen    → DOCX output working
```

**MVP Complete** = User can chat → Research runs → Contract generated → Download .docx

---

## Key Files Summary

```
/Users/pavankumar/Developer/Clean-Contract/
├── app/
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Landing page
│   ├── globals.css             # Tailwind v4 config
│   ├── chat/page.tsx           # Chat interface
│   ├── contracts/
│   │   ├── page.tsx            # Contract list
│   │   └── new/page.tsx        # New contract wizard
│   └── api/
│       └── chat/route.ts       # Chat API proxy
├── components/
│   ├── ui/                     # shadcn components
│   ├── chat/                   # Chat components
│   ├── contracts/              # Contract components
│   └── research/               # Research components
├── backend/
│   ├── main.py                 # FastAPI entry
│   ├── ai/
│   │   ├── claude.py           # Claude client
│   │   └── prompts.py          # System prompts
│   ├── research/
│   │   └── searcher.py         # Tavily integration
│   └── contracts/
│       ├── generator.py        # DOCX generation
│       ├── clauses.py          # Clause library
│       └── templates/
│           └── service_agreement.py
├── .env.example
├── .env.local
├── postcss.config.mjs
└── package.json
```

---

## Ready to Start

When you approve this plan, I will begin with **Phase 1: Project Scaffolding**:
1. Initialize Next.js 16 with TypeScript and Tailwind v4
2. Set up the Python FastAPI backend structure
3. Configure environment variables
4. Verify both servers run correctly
