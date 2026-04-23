# rejantov-pb

A personal portfolio and blog site built with Next.js and Supabase. Two distinct experiences under one roof — a clean portfolio for professional presence, and a chaotic 2000s-style blog for everything else (tech, books, League of Legends, hiking, life).

## What it is

**Portfolio** — A minimal, purple-tinted terminal-themed showcase with:
- Hero section (intro, bio, contact)
- Tabbed sections: Projects, Experience, Education, CV/Resume
- Social links (GitHub, LinkedIn, etc.)
- Downloadable resume with inline PDF preview

**Blog** — Intentionally maximal, 2000s-overloaded aesthetic with:
- Purple-heavy, info-dense layout
- Support for images, videos, and PDFs in posts
- Topics: tech, books, League of Legends, hiking, life in general
- Admin-only posting (no public submissions)

## Stack

- **Framework**: Next.js 16.2 (App Router, Server Components)
- **Database & Auth**: Supabase (PostgreSQL + Auth + Storage)
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui + Radix UI
- **Icons**: Lucide React
- **Language**: TypeScript

## Project Structure

```
app/
  page.tsx              # Portfolio home
  admin/                # Admin dashboard (protected)
    page.tsx
    profile/            # Edit profile info
    experience/         # Work history CRUD
    projects/           # Projects CRUD
    education/          # Education CRUD
    social-links/       # Social links CRUD
    resume/             # Resume upload & management
    new/                # New blog post
    edit/[id]/          # Edit blog post
  blog/                 # Public blog
    page.tsx
    [slug]/             # Individual blog post
  login/                # Admin login page
  api/
    upload/resume/      # Resume PDF upload endpoint

components/
  portfolio/            # Public-facing portfolio sections
    hero.tsx
    portfolio-tabs.tsx
    projects.tsx
    experience.tsx
    education.tsx
    cv-section.tsx
  admin/                # Admin UI components
    experience-manager.tsx
    resume-manager.tsx
    ...

lib/
  supabase/             # Supabase clients (server, client, middleware, admin)
```

## Database Tables

| Table | Purpose |
|---|---|
| `profile` | Name, title, bio, contact email |
| `projects` | Portfolio project cards |
| `work_experience` | Employment timeline |
| `education` | Education/certification timeline |
| `social_links` | Hero icons and URLs |
| `blog_posts` | Blog posts (title, slug, content, published flag) |
| `resumes` | Uploaded PDFs — tracks which one is active |

## Storage

Supabase Storage bucket `resumes` — stores uploaded PDF files. The active resume is shown to visitors; all others are accessible to the admin.

## Auth & Access

- Admin login at `/login`
- Session tied to browser session (closing browser = logout)
- Only the configured admin email can access `/admin/*`
- Blog posts can be published or kept as drafts

## Local Development

1. Clone the repo
2. Copy `.env.local.example` to `.env.local` and fill in your Supabase credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=...
   NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   ADMIN_EMAIL=your@email.com
   ```
3. Install dependencies:
   ```bash
   pnpm install
   ```
4. Run the dev server:
   ```bash
   pnpm dev
   ```

## Supabase Setup

You'll need to run the table migrations in the Supabase SQL editor and create a public `resumes` storage bucket with the appropriate RLS policies.
