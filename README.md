# Digital Life Twin

> Intelligent management, analysis and prediction of your daily life.

A premium, modern Angular frontend for **Digital Life Twin** — a platform that helps you understand and improve your daily rhythm: planning, tasks, events, wellness, nutrition, sport and AI-powered recommendations, all in one calm and sophisticated interface.

This repository contains **only the Angular frontend**. All data comes from realistic mock services so a real backend can be connected later without rebuilding the UI.

---

## Features

- **Authentication** — mock login / register with polished validation (FR/EN/AR)
- **Dashboard** — "How is my day going?" bento overview: productivity, schedule, tasks, hydration, sleep, mood, stress, fatigue, free time, AI recommendation
- **Planning** — daily timeline with tasks, events, time blocks, free time and overload detection
- **Tasks** — list, search, filters, priority, categories, create / edit / delete / complete
- **Calendar** — monthly & weekly views, events, details, creation and editing
- **Wellness** — sleep, hydration, mood, stress, fatigue, daily score, weekly history (presented as indicators, never as medical diagnosis)
- **Nutrition** — meals, calories, macros and daily progress
- **Sport** — today's workout, weekly activity, history, intensity, calories, goal progress
- **AI Insights** — fatigue / dehydration / overload / sedentary risk cards with confidence and recommendations
- **AI Assistant** — chat interface with mock AI responses and suggested questions
- **Notifications** — reminders with read / unread / delete management
- **Profile & Settings** — personal info, goals, targets, preferences, quiet hours, appearance, notifications
- **Admin** — aggregated mock usage dashboard and users table (ADMIN only)
- **Public pages** — home, features, about, contact
- **i18n** — English, French and Arabic

## Demo credentials

| Field    | Value      |
| -------- | ---------- |
| Email    | `demo@digital-life-twin.com` |
| Password | `demo123`  |

> This is **mock authentication** for frontend development only. It is not real security. The auth service is designed so real JWT authentication can be integrated later.

## Tech stack

- **Angular 22** — standalone components, signals, reactive forms, lazy-loaded routes
- **TypeScript** — strict mode
- **Tailwind CSS 4** — design-system-driven styling
- **Chart.js** — charts
- **GSAP** — restrained, accessible animations (respects `prefers-reduced-motion`)
- **Lucide** — icons
- **Prettier** — code formatting

## Design system

Digital Life Twin is built on a small brand palette:

- **Deep Navy** `#1B3A57` — primary brand, navigation, headings, primary actions
- **Teal** `#2A9D9D` — accent, wellness, progress, interactive states
- **Soft White** `#F7F9FA` — main background and surfaces

All colors are centralized as semantic tokens; no arbitrary color values are scattered across components.

## Getting started

### Prerequisites

- Node.js 20+ (project pins `npm@11.17.0` via `packageManager`)

### Installation

```bash
npm install
```

### Development server

```bash
npm start
```

Open `http://localhost:4200/`.

### Production build

```bash
npm run build
```

Build artifacts are output to `dist/digital-life-twin`.

### Scripts

| Command          | Description                                |
| ---------------- | ------------------------------------------ |
| `npm start`      | Start the development server               |
| `npm run build`  | Production build                           |
| `npm run watch`  | Rebuild on changes (development config)    |
| `npm test`       | Run unit tests (`ng test`)                 |

## Project structure

```text
src/
└── app/
    ├── core/          # guards, services, models, i18n
    ├── shared/        # ui primitives, directives, pipes
    ├── layout/        # app shell, sidebar, header
    ├── features/      # auth, dashboard, planning, tasks, calendar,
    │                  # wellness, nutrition, sport, ai, assistant,
    │                  # notifications, profile, settings, admin, public
    └── app.config.ts  # application bootstrap configuration
```

Each feature area is isolated (components, models, services) and lazy-loaded where appropriate.

## Architecture notes

- **API readiness** — feature services are structured as future REST boundaries (e.g. `GET /api/tasks`, `POST /api/wellness/sleep`, `POST /api/ai/lifestyle-risk`). Today they return realistic mock data; swapping them for HTTP calls requires no UI changes.
- **Accessibility** — semantic HTML, keyboard navigation, visible focus states and reduced-motion support.
- **States** — every data-driven screen includes loading (skeleton), empty and error states with retry actions.

## Future work

- Connect real JWT authentication and a real backend API
- Replace mock data layer with REST services
- Real LLM-powered assistant
- Dark theme

---

Built with Angular. Licensed for academic use.
