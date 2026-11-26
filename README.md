# Ibnu Qayyim Portfolio

Personal portfolio with a hero page, a project list and a single-password admin.
Stack: Next.js 15, PostgreSQL, Drizzle ORM, TypeScript.

## Requirements

- Node.js 24+
- A running PostgreSQL server (the pgAdmin bundle includes one)

## One-time setup

1. Edit `.env.local`, then copy it to `.env` because drizzle-kit reads `.env`:

```
DATABASE_URL=postgres://postgres:PASSWORD@localhost:5432/ibnuk
ADMIN_PASSWORD=choose-an-admin-password
```

2. Install dependencies:

```bash
npm install
```

- Local database: run `npm run migrate`, then `npm run seed` to load the curated project metadata.
- `DATABASE_URL` must point at the target database. The seed skips links that already exist, so it never overwrites projects you edited.
- After deploying, add projects in `/admin`. Put your own screenshots in `public/projects/`, enter the path `/projects/<file-name>` in the admin, and redeploy so the image is published.

## Running (dev)

```bash
npm run dev
```

Open:

- http://localhost:3000 for the home page (hero)
- http://localhost:3000/projects for the project list
- http://localhost:3000/admin to add, edit or delete projects with `ADMIN_PASSWORD`

## Other commands

```bash
npm run test       # unit tests (Vitest)
npm run build      # production build
npm run generate   # generate a new migration after a schema change
npm run migrate    # apply migrations
npm run seed       # load curated metadata; a link check prevents duplicates
```

## Deploy to Vercel

1. Run `vercel link`, then provision Vercel Postgres.
2. Set `DATABASE_URL` and `ADMIN_PASSWORD` in the Vercel dashboard.
3. Run `vercel deploy --prod`. `vercel.json` runs `next build && drizzle-kit migrate`, which creates the `projects` table in the production database.
