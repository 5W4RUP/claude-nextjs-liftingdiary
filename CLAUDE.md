# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## ⚠️ CRITICAL: ALWAYS REFER TO /docs DIRECTORY FIRST

**Before generating any code, ALWAYS consult the relevant documentation files in the `/docs` directory.**

Current documentation files:
- **`docs/ui.md`** - UI component standards, shadcn component usage, and date formatting guidelines
- **`docs/data-mutations.md`** - Data mutation patterns, server actions, Zod validation, and Drizzle ORM integration
- Additional docs will be added as the project grows

When implementing features:
1. ✅ **FIRST** - Check the relevant `/docs` file for standards and patterns
2. ✅ **SECOND** - Apply the documented standards and best practices
3. ✅ **THIRD** - Write code that adheres to project conventions

**NEVER skip this step.** The `/docs` directory is the source of truth for coding standards.

## Critical: This is NOT the Next.js You Know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

## Project Overview

This is a **Next.js 16.2.1** project built with modern web technologies. It's a bootstrapped Create Next App using the App Router with TypeScript, Tailwind CSS 4, and React 19. The project is structured as a full-stack Next.js application.

## Tech Stack

- **Next.js**: 16.2.1 (App Router only)
- **React**: 19.2.4
- **TypeScript**: 5.x
- **Styling**: Tailwind CSS 4 with PostCSS
- **Node Types**: 20.x
- **Linting**: ESLint 9.x with Next.js config

## Project Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout wrapper
│   ├── page.tsx            # Home page (/)
│   └── globals.css         # Global styles
public/                      # Static assets
```

Path aliases configured: `@/*` → `src/*` for clean imports.

## Common Development Commands

### Development
- `npm run dev` - Start dev server (http://localhost:3000 with hot reload)

### Production
- `npm run build` - Compile for production
- `npm start` - Run production server

### Linting
- `npm run lint` - Run ESLint checks

## Development Patterns

### Creating Routes

Routes in the App Router are created by file structure:
- `src/app/page.tsx` → `/`
- `src/app/dashboard/page.tsx` → `/dashboard`
- `src/app/blog/[slug]/page.tsx` → `/blog/:slug` (dynamic)

Pages are **server components** by default. Add `'use client'` at the top for client-side interactivity.

### Styling

- Use Tailwind CSS utility classes directly in JSX (e.g., `className="flex gap-4 dark:bg-black"`)
- Global styles in `src/app/globals.css`
- Dark mode classes supported (prefix with `dark:`)
- Geist fonts pre-configured with CSS variables injected in root layout

### Images

Use the `next/image` component for optimized images (included in the template).

## TypeScript Configuration

- **Strict mode** enabled
- **Target**: ES2017
- **Module**: esnext
- **jsx**: react-jsx (React 19 transform)
- **Incremental builds** enabled
- Plugins: Next.js compiler plugin configured

## Important Caveats

1. **Version-specific APIs**: Always consult `node_modules/next/dist/docs/` for Next.js 16-specific patterns
2. **No Pages Router**: This project uses App Router exclusively
3. **Deprecations**: Monitor for deprecation notices when implementing features
4. **Breaking changes**: Conventions may differ significantly from older versions — verify before copying patterns

## Documentation Standards

### UI Implementation
When implementing UI features:
- **ALWAYS** refer to `docs/ui.md` first
- **ONLY** use shadcn UI components — no custom components
- Format dates using `date-fns` with the `do MMM yyyy` pattern
- Use semantic color classes from the design system
- Never hardcode styling — use Tailwind utilities and shadcn components

### Adding New Standards
When establishing new coding patterns or conventions:
1. Create or update the relevant `/docs` file
2. Document the pattern with examples
3. Reference the doc file in this CLAUDE.md
4. Use the documented pattern in all subsequent code
