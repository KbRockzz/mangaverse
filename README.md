# MangaVerse

MangaVerse is a modern, full-stack manga reading application built with Next.js 15, React, TypeScript, and Prisma. It replaces an older Vite/React architecture, offering server-side rendering, better SEO, enhanced performance, and robust security.

## Features

- **Full-Stack Architecture**: Built with Next.js App Router (React Server Components + Client Components).
- **Authentication**: Secure role-based authentication (Admin/User) using NextAuth.js (Auth.js v5) with credential login.
- **Database**: SQLite with Prisma ORM for simplified development, easily migratable to PostgreSQL/MySQL.
- **UI & Design**: Modern glassmorphism UI, fully responsive, dark theme by default, using Lucide React icons.
- **Manga Dex API**: Seamless integration with the public MangaDex API to fetch real manga data and chapters.
- **Admin Dashboard**: Analytics charts using Recharts, CRUD operations for Manga, Chapters, and Users.
- **Global State & Caching**: Zustand for UI state (toasts, modals) and TanStack React Query for efficient data fetching and caching.

## Tech Stack

- **Framework**: Next.js 15 (TypeScript)
- **Database ORM**: Prisma
- **Auth**: NextAuth.js (v5)
- **State Management**: React Query, Zustand
- **Forms & Validation**: React Hook Form, Zod
- **Styling**: Vanilla CSS Modules with a global design system
- **Testing**: Vitest, React Testing Library
- **Icons**: Lucide React
- **Charts**: Recharts

## Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, or pnpm

### Installation

1. Clone the repository and navigate to the project folder.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables. Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="file:./dev.db"
   AUTH_SECRET="your-super-secret-auth-key-change-in-production"
   NEXTAUTH_URL="http://localhost:3000"
   ```

### Database Setup

Run the following commands to initialize the SQLite database and seed initial data:
```bash
npx prisma db push
npx prisma db seed
```
This will create a default admin user (`admin@mangaverse.com` / `Admin123!`) and a demo user (`user@mangaverse.com` / `User123!`), along with some sample manga and chapters.

### Running the App

Start the development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

## Testing

Run unit and component tests using Vitest:
```bash
npm run test
```

## Folder Structure

- `/src/app`: Next.js App Router pages and API routes.
- `/src/components`: Reusable UI components and layouts.
- `/src/lib`: Integrations (Prisma client, NextAuth, MangaDex API).
- `/src/hooks`: Custom React hooks (useAuth, useDebounce, etc.).
- `/src/store`: Zustand global state stores.
- `/src/types`: TypeScript interfaces and types.
- `/src/utils`: Helper functions.
- `/prisma`: Database schema and seed script.

## License

This project is created for educational purposes. Manga data is provided by [MangaDex](https://mangadex.org).
