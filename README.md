# LockIn

<div align="center">

**A unified personal knowledge graph, concept tracking engine, study planner, and spaced repetition platform.**

[![Next.js](https://img.shields.io/badge/Next.js-16.3.5-black?style=flat&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.8-blue?style=flat&logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-6.19.3-2d3748?style=flat&logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=flat&logo=postgresql)](https://www.postgresql.org/)
[![Auth.js](https://img.shields.io/badge/Auth.js-v5_Beta-purple?style=flat&logo=auth0)](https://authjs.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?style=flat&logo=typescript)](https://www.typescriptlang.org/)

</div>

---

## Overview

**LockIn** reimagines self-directed study and knowledge acquisition as an interconnected, living graph. Rather than isolating bookmarks, flashcards, and calendar events across disjointed applications, LockIn anchors every resource, task, and project directly to underlying fundamental concepts. 

Styled with an **Apple Human Interface Guidelines (HIG)** aesthetic, LockIn provides an uncluttered, high-focus environment powered by modern Server Actions, robust data validation, and real-time interactive visualizations.

---

## Key Features

### 🧠 Interconnected Knowledge Graph & Concept Engine
- **Directed Relation Topology**: Interlink concepts using semantic relation types:
  - `PREREQUISITE_FOR`: Map out strict learning prerequisites.
  - `RELATED_TO`: Associate complementary ideas across different domains.
  - `PART_OF`: Build parent-child topic hierarchies.
  - `EXTENDS`: Model advanced specializations.
- **Mastery Levels**: Monitor concept progression across 4 structured tiers (`NOVICE` $\rightarrow$ `FAMILIAR` $\rightarrow$ `PROFICIENT` $\rightarrow$ `MASTERED`).
- **Interactive Force-Directed Canvas**: Native HTML5 Canvas physics simulation with pan, zoom, node drag-and-drop, and real-time filtering without heavy third-party bundle bloat.

### 🔁 Spaced Repetition Flashcards (SuperMemo SM-2)
- **SM-2 Active Recall Engine**: Automated calculation of ease factors ($EF$), repetition intervals, and dynamic due dates based on user ratings ($0 = \text{Blackout}, 1 = \text{Hard}, 2 = \text{Good}, 3 = \text{Easy}$).
- **Active Recall Player**: Distraction-free review player supporting hints, markdown notes, keyboard shortcuts, and instant retention stats.
- **Automated Queueing**: Real-time aggregation of cards due today, streak calculation, and historical review tracking.

### ⏱️ Study Planner & Focus Suite
- **Apple Watch-Style Activity Rings**: Custom SVG multi-ring meters measuring daily task completion, weekly hour goals, and focus velocity.
- **Synthesized Focus Timer**: Supports Pomodoro (25m), Deep Work (50m), Review (15m), and Quick Study (10m) modes with zero-asset Web Audio API harmonic chimes ($C_5 \rightarrow E_5 \rightarrow G_5 \rightarrow C_6$).
- **Semester Sprint Planner**: Structure academic or self-study quarters with target weekly hours, color-coded themes, and milestone tracking.

### 📁 Hierarchical Resource Taxonomy & macOS Finder Aesthetics
- **3-Level Strict Organization**: `Field` (Level 1) $\rightarrow$ `Subject` (Level 2) $\rightarrow$ `Topic` (Level 3).
- **macOS Finder Folders**: Custom SVG folder icons with multi-color Apple tint palettes, hover tilt dynamics, and drill-down views.
- **OpenGraph Unfurling**: Automatic metadata scraper fetching page titles, summaries, and favicons for saved study resources.

### 🎯 Skills, Practical Projects & Public Showcase
- **Skill Progression Trees**: Quantifiable progress bars ($0-100\%$) linked to categories and real-world projects.
- **Tech Stack Auto-Detection**: Automatic icon resolution for frameworks and tools.
- **Shareable Public Portfolio** (`/u/[username]`): Showcase verified competencies, completed projects, and mastery statistics with fine-grained privacy controls.

### 🔍 Unified Command Palette (`Cmd + K`)
- Instant full-text search across 6 models simultaneously: Resources, Concepts, Skills, Projects, Tasks, and Categories.

### 📊 Analytics & Learning Velocity
- **365-Day Consistency Heatmap**: GitHub-style activity matrix tracking daily focus sessions and iterations.
- **Velocity & Mastery Distributions**: Visual funnels and charts measuring study pace and concept retention.

---

## Tech Stack

| Layer | Technology | Details |
| :--- | :--- | :--- |
| **Framework** | [Next.js 16](https://nextjs.org/) (App Router) | Turbopack, Server Components, React Server Actions |
| **UI Library** | [React 19](https://react.dev/) | React 19 hooks, concurrent rendering, and transitions |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com/) | Modern `@theme` tokens, Apple HIG design, dark/light themes |
| **Database & ORM** | [PostgreSQL 16](https://www.postgresql.org/) + [Prisma 6](https://www.prisma.io/) | Strongly typed relational schema, cascade constraints, composite indices |
| **Auth & Security** | [Auth.js / NextAuth v5](https://authjs.dev/) | JWT strategy, credentials provider (bcryptjs), Google OAuth |
| **Validation** | [Zod](https://zod.dev/) & React Hook Form | Full runtime validation across all forms and Server Actions |
| **Icons** | [Lucide React](https://lucide.dev/) | Consistent, lightweight vector iconography |

---

## System Architecture

```mermaid
graph TD
    subgraph Client Layer
        Browser["Next.js 16 Client (React 19)"]
        CanvasGraph["HTML5 Canvas Force Graph"]
        AudioSynth["Web Audio API Synthesis"]
    end

    subgraph Security & Routing
        Proxy["Middleware / Proxy Guard"]
        NextAuth["Auth.js v5 (JWT & Sessions)"]
        RBAC["Centralized RBAC (can())"]
    end

    subgraph Server & Data Layer
        Actions["Server Actions (src/actions)"]
        ZodVal["Zod Schema Validation"]
        PrismaORM["Prisma Client v6"]
        Postgres[(PostgreSQL 16)]
    end

    Browser --> Proxy
    Proxy --> Actions
    Actions --> ZodVal
    ZodVal --> RBAC
    RBAC --> PrismaORM
    PrismaORM --> Postgres
```

---

## Getting Started

### 1. Prerequisites
- **Node.js**: v20 or higher
- **Package Manager**: [pnpm](https://pnpm.io/) v9+ (recommended) or npm
- **Database**: PostgreSQL 14+ (Local, Docker/Podman, Neon, or Supabase)

### 2. Clone and Install Dependencies

```bash
git clone https://github.com/rahul-ydv1/lockin.git
cd lockin

pnpm install
```

### 3. Environment Configuration

Copy the example configuration to `.env`:

```bash
cp .env.example .env
```

Configure your environment variables:

```env
# PostgreSQL Database Connection Strings
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/lockin?schema=public"
DIRECT_URL="postgresql://postgres:postgres@localhost:5432/lockin?schema=public"

# Auth.js / NextAuth v5
AUTH_SECRET="your-32-character-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# Optional: Google OAuth
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
```

### 4. Running PostgreSQL via Docker / Podman (Optional)

If you don't have a local PostgreSQL instance running, launch one with Docker or Podman:

```bash
# Using Podman
podman run -d --name lockin-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=lockin \
  -p 5432:5432 \
  docker.io/library/postgres:16-alpine

# Or using Docker
docker run -d --name lockin-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=lockin \
  -p 5432:5432 \
  postgres:16-alpine
```

### 5. Database Setup & Seeding

Sync the database schema and populate it with sample categories, concepts, resources, and focus sessions:

```bash
# Push schema directly to database
pnpm db:push

# Seed demo account and realistic study data
pnpm db:seed
```

### 6. Start the Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

#### Demo Credentials
The database seed script initializes a fully populated research profile:
- **Email**: `alex@lockin.study`
- **Password**: `password123`
- **Username**: `alexchen` (view public portfolio at `/u/alexchen`)

---

## Available Scripts

| Command | Description |
| :--- | :--- |
| `pnpm dev` | Starts the Next.js development server with Turbopack |
| `pnpm build` | Generates Prisma client and builds for production |
| `pnpm start` | Runs the compiled production build |
| `pnpm lint` | Runs ESLint across all files |
| `pnpm db:push` | Pushes schema changes directly to PostgreSQL |
| `pnpm db:generate` | Generates latest Prisma Client type definitions |
| `pnpm db:seed` | Seeds database with comprehensive sample study data |

---

## Directory Structure

```text
lockin/
├── prisma/
│   ├── schema.prisma          # Prisma schema with 14 relational models
│   └── seed.ts                # Realistic dataset seed script
├── src/
│   ├── actions/               # Next.js Server Actions (Domain mutations & queries)
│   │   ├── analytics.ts       # Heatmap, velocity, & mastery metrics
│   │   ├── auth.ts            # Registration & session logic
│   │   ├── categories.ts      # 3-level taxonomy hierarchy
│   │   ├── concepts.ts        # Knowledge graph nodes & relations
│   │   ├── flashcards.ts      # SM-2 spaced repetition algorithms
│   │   ├── planner.ts         # Tasks, Pomodoro sessions, & semesters
│   │   ├── profile.ts         # User profiles & public showcase
│   │   ├── projects.ts        # Practical project tracking
│   │   ├── resources.ts       # Study materials & notes
│   │   ├── search.ts          # Parallel multi-domain search
│   │   ├── skills.ts          # Skill trees & progress
│   │   └── tags.ts            # Multi-colored tags
│   ├── app/
│   │   ├── (auth)/            # Sign-in & Sign-up routes
│   │   ├── (dashboard)/       # Core authenticated application views
│   │   ├── api/               # Health check, OG unfurler, Auth endpoints
│   │   ├── u/[username]/      # Public shareable profile page
│   │   ├── globals.css        # Tailwind CSS v4 @theme design tokens
│   │   └── layout.tsx         # Root layout with theme provider
│   ├── components/            # Modular UI components (Apple HIG design)
│   │   ├── analytics/         # Heatmap & mastery funnel widgets
│   │   ├── concepts/          # Knowledge graph canvas & drawers
│   │   ├── flashcards/        # Active recall player & manager
│   │   ├── planner/           # Activity rings & focus timer
│   │   ├── resources/         # macOS Finder-style folder grids & tables
│   │   └── search/            # Command palette modal
│   ├── lib/
│   │   ├── auth.ts            # NextAuth configuration & callbacks
│   │   ├── db.ts              # Global Prisma client singleton
│   │   ├── permissions.ts     # Centralized RBAC (OWNER, ADMIN, USER)
│   │   └── validations/       # Zod schemas for all domain inputs
│   └── types/                 # Shared TypeScript interfaces
├── .env.example               # Template environment configuration
├── package.json
└── tsconfig.json
```

---

## License

This project is private and proprietary. All rights reserved.
