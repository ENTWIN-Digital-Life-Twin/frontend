# Digital Life Twin

> Intelligent management, analysis and prediction of your daily life.

A premium, modern Angular frontend for **Digital Life Twin** — a platform that helps you understand and improve your daily rhythm: planning, tasks, events, wellness, nutrition, sport and AI-powered recommendations, all in one calm and sophisticated interface.

This repository contains the **Angular frontend**. It talks to the Spring Boot API Gateway at `http://localhost:8080` (proxied as `/api` in development).

---

## Features

- **Authentication** — JWT login / register / refresh / logout, plus Google Sign-In (FR/EN/AR)
- **Dashboard** — "How is my day going?" bento overview: productivity, schedule, tasks, hydration, sleep, mood, stress, fatigue, free time, AI recommendation
- **Planning** — daily timeline with tasks, events, time blocks, free time and overload detection
- **Tasks** — list, search, filters, priority, categories, create / edit / delete / complete
- **Calendar** — monthly & weekly views, events, details, creation and editing
- **Wellness** — sleep, hydration, mood, stress, fatigue, daily score, weekly history (presented as indicators, never as medical diagnosis)
- **Nutrition** — meals, calories, macros and daily progress
- **Sport** — today's workout, weekly activity, history, intensity, calories, goal progress
- **AI Insights** — fatigue / dehydration / overload / sedentary risk cards with confidence and recommendations
- **AI Assistant** — chat interface wired to `POST /api/v1/ai/chat`
- **Notifications** — reminders with read / unread / delete management
- **Profile & Settings** — personal info, goals, targets, preferences, quiet hours, appearance, notifications
- **Admin** — aggregated mock usage dashboard and users table (ADMIN only)
- **Public pages** — home, features, about, contact
- **i18n** — English, French and Arabic

## Backend (required)

The UI calls the **API Gateway** only. Start PostgreSQL and the backend modules first (from `../backend`):

```bash
docker compose up -d dlt-postgres
.\mvnw.cmd -pl auth-service -am spring-boot:run
.\mvnw.cmd -pl planning-service -am spring-boot:run
.\mvnw.cmd -pl wellness-service -am spring-boot:run
.\mvnw.cmd -pl notification-service -am spring-boot:run
.\mvnw.cmd -pl ai-service -am spring-boot:run
.\mvnw.cmd -pl api-gateway -am spring-boot:run
```

Or `docker compose up -d` for the full stack. Create an account from `/register` — there are no demo users.

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

Open `http://localhost:4200/`. `ng serve` proxies `/api` to the gateway on port `8080`.

Set `googleClientId` in `src/environments/environment.ts` to the same Google Identity Services web client ID as backend `GOOGLE_CLIENT_ID`. Authorized JavaScript origins in Google Cloud Console must include `http://localhost:4200`. Do not put the value in components. Production builds read `environment.prod.ts` (`googleClientId` empty until you set it).

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

- **API** — all feature services call the gateway (`/api` and `/api/v1`). Auth, planning, wellness, nutrition, sport, notifications, AI, profile and settings persist to the backend.
- **Accessibility** — semantic HTML, keyboard navigation, visible focus states and reduced-motion support.
- **States** — every data-driven screen includes loading (skeleton), empty and error states with retry actions.

## Not in the backend yet

These UI pieces stay local or placeholder until the API exists: admin extras, task subtasks, calendar participants, and some appearance/privacy toggles.

---

Built with Angular. Licensed for academic use.
