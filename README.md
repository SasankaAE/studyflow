# StudyFlow

StudyFlow is a Next.js 16 app-router project built with React 19, TypeScript, Tailwind CSS, and shadcn/ui. The current UI is a landing-page style shell with a responsive navigation header and auth entry points.

## Getting Started

Install dependencies and start the dev server:

```bash
npm install
npm run dev
```

Open the app at `http://localhost:3000`.

## Available Scripts

```bash
npm run dev       # start the development server
npm run build     # create a production build
npm run start     # run the production build
npm run lint      # run ESLint
npm run typecheck # run the TypeScript compiler
npm run format    # format TypeScript and TSX files with Prettier
```

## Project Structure

- `app/` - App Router routes, layout, and global styles
- `components/` - Shared UI and page components
- `components/ui/` - shadcn/ui primitives
- `lib/` - Utility helpers
- `public/` - Static assets

## UI Components

This project uses shadcn/ui. To add more components, use:

```bash
npx shadcn@latest add button
```

Import them with the `@` alias:

```tsx
import { Button } from "@/components/ui/button"
```
