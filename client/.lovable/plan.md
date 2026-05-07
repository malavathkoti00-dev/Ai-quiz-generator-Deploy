## Full Frontend Rebuild: React.js + Plain CSS Only

### Phase 1: Strip Libraries & Setup CSS Foundation
- Remove Tailwind CSS, Framer Motion, Lucide, Recharts, and all Radix/shadcn dependencies
- Create global CSS design system (`styles/variables.css`, `styles/global.css`, `styles/components.css`)
- Define CSS custom properties for colors, spacing, typography, shadows

### Phase 2: Reusable Component System (Plain CSS)
- **Navbar** - responsive with hamburger menu
- **Sidebar** - collapsible, minimal
- **Button** - primary, secondary, ghost variants
- **Input** - clean outlined inputs
- **Card** - light shadow, rounded
- **Modal** - centered, soft shadow
- **Timer** - minimal circle timer
- **ScoreBoard** - clean, spaced layout
- **MCQOption** - hover highlight, selected/correct/wrong states
- **QuizCard** / **GameCard** - reusable card variants

### Phase 3: Core Pages (Rewrite existing)
- **Landing Page** - hero, gradient bg, CTA, feature sections with CSS icons
- **Create Quiz / PDF Upload** - drag & drop zone, dashed border, form layout
- **Quiz Player** - centered question card, smooth CSS transitions
- **Results** - circular progress (SVG+CSS), success/error colors

### Phase 4: New Pages - Auth & Dashboard
- **Login Page** - white card, soft shadows, rounded inputs
- **Signup Page** - matching style
- **Forgot Password** - simple form
- **Dashboard** - card-based layout, analytics preview, quick actions
- **Analytics Dashboard** - clean charts (SVG-based, no library)
- **History Page** - table/card list with filters + search

### Phase 5: Game Mode Pages
- **Game Lobby** - topic selection (chips), create/join room
- **Waiting Room** - player avatars, ready indicators, CSS animations
- **Game Arena** - scoreboard top, question card center, timer right, selector/answer/feedback states
- **Game Results** - winner display, score comparison, replay button

### Phase 6: Socket.io Frontend Prep
- Create `hooks/useSocket.ts` with event handlers: `join_room`, `start_game`, `next_round`, `submit_answer`, `update_score`
- Wire up game components to use socket hooks (mock mode for now)

**Total: ~25+ files to create/rewrite**