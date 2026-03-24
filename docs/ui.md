# UI Coding Standards

This document outlines the UI coding standards and best practices for the Lifting Diary Course project.

## Core Principle

**ONLY use shadcn UI components for all UI elements in this project.**

❌ **NO custom components should be created.**
✅ **ONLY use shadcn UI components.**

## Available shadcn UI Components

The following shadcn UI components are available and approved for use:

- `Button` - For all clickable actions
- `Card` - For card containers with `CardHeader`, `CardContent`, `CardTitle`, `CardDescription`
- `Input` - For text, email, date, number, and other input types
- `Label` - For form labels
- `Select` - For dropdown selections
- `Checkbox` - For boolean toggles
- `RadioGroup` - For single-choice selections
- `Textarea` - For multi-line text input
- `Badge` - For tags and labels
- `Alert` - For alerts and notifications
- `Dialog` - For modal dialogs
- `Dropdown Menu` - For context menus
- `Tabs` - For tabbed interfaces
- `Toast/Toaster` - For toast notifications
- `Pagination` - For paginated data
- `Skeleton` - For loading states
- `Progress` - For progress bars

## Adding New Components

If a shadcn UI component is needed but not yet installed, install it using:

```bash
npx shadcn@latest add <component-name> --yes
```

Never create custom styled components. Instead, install the required shadcn component.

## Styling Guidelines

### Classes to Use

Use the following classes for styling:

- **Tailwind CSS utility classes** - For responsive and custom styling
- **shadcn color tokens** - `text-primary`, `bg-muted`, `border-border`, etc.
- **Dark mode support** - Use `dark:` prefixes for dark mode styles

### Example: Proper Styling

```tsx
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function ExampleComponent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Example</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button variant="default">Primary Action</Button>
        <Button variant="outline">Secondary Action</Button>
        <Button variant="ghost">Tertiary Action</Button>
      </CardContent>
    </Card>
  );
}
```

### Example: Improper Styling (❌ DO NOT DO THIS)

```tsx
// ❌ WRONG - Creating custom styled divs
export function BadComponent() {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800 p-6">
      <h2 className="text-lg font-semibold">Title</h2>
    </div>
  );
}
```

## Date Formatting

All dates must be formatted using **`date-fns`** with the following format:

### Format Pattern

Use the pattern: `do MMM yyyy`

This produces dates like:
- `1st Sep 2025`
- `2nd Aug 2025`
- `3rd Jan 2026`
- `4th Jun 2024`
- `21st Dec 2025`
- `22nd Mar 2026`
- `23rd Oct 2024`
- `24th Feb 2026`

### Implementation

```tsx
import { format } from 'date-fns';

export function DateExample() {
  const date = new Date('2025-09-01');

  return <p>{format(date, 'do MMM yyyy')}</p>; // Outputs: 1st Sep 2025
}
```

### Approved Date Formats

Only use these date-fns format patterns:

| Use Case | Pattern | Example |
|----------|---------|---------|
| Display date | `do MMM yyyy` | `1st Sep 2025` |
| Display with time | `do MMM yyyy 'at' h:mm a` | `1st Sep 2025 at 9:30 AM` |
| Weekday + date | `EEEE, do MMM yyyy` | `Monday, 1st Sep 2025` |
| Time only | `h:mm a` | `9:30 AM` |
| Short month | `MMM d, yyyy` | `Sep 1, 2025` |

### Example: Dashboard Date Display

```tsx
import { format } from 'date-fns';

export function WorkoutCard({ startedAt, completedAt }) {
  return (
    <div>
      <p>Started: {format(new Date(startedAt), 'do MMM yyyy')} at {format(new Date(startedAt), 'h:mm a')}</p>
      {completedAt && (
        <p>Completed: {format(new Date(completedAt), 'do MMM yyyy')} at {format(new Date(completedAt), 'h:mm a')}</p>
      )}
    </div>
  );
}
```

## Button Variants

Always use shadcn Button variants:

```tsx
<Button variant="default">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="destructive">Destructive</Button>
<Button variant="link">Link</Button>
```

## Color Semantic Classes

Use semantic color classes for consistency:

- `text-foreground` - Main text
- `text-muted-foreground` - Secondary text
- `bg-background` - Page background
- `bg-muted` - Muted backgrounds
- `border-border` - Borders
- `text-primary` - Primary accent
- `text-destructive` - Error/danger

## Theming System

### Supported Themes

The project supports multiple themes for both light and dark modes:

#### Light Mode Themes
- `light` - Default light theme (white background, black text)
- `light-blue` - Light theme with blue accents
- `light-green` - Light theme with green accents
- `light-purple` - Light theme with purple accents

#### Dark Mode Themes
- `dark` - Default dark theme (black background, white text)
- `dark-blue` - Dark theme with blue accents
- `dark-green` - Dark theme with green accents
- `dark-purple` - Dark theme with purple accents

### Theme Toggle

The `ThemeToggle` component in the header provides:
1. **Mode Toggle** - Switch between light and dark modes
2. **Theme Selector** - Choose accent color theme
3. **Persistent Storage** - Theme preference saved to localStorage
4. **System Preference** - Respects OS dark mode preference

### Accessing Current Theme

Use the `useTheme()` hook in client components:

```tsx
'use client';

import { useTheme } from '@/components/theme-provider';

export function MyComponent() {
  const { theme, mode, toggleMode, setTheme } = useTheme();

  return (
    <div>
      <p>Current theme: {theme}</p>
      <p>Current mode: {mode}</p>
      <button onClick={toggleMode}>Toggle Dark Mode</button>
      <button onClick={() => setTheme('light-blue')}>Blue Theme</button>
    </div>
  );
}
```

### Theme Context Type

```typescript
interface ThemeContextType {
  theme: 'light' | 'dark' | 'light-blue' | 'light-green' | 'light-purple'
        | 'dark-blue' | 'dark-green' | 'dark-purple';
  mode: 'light' | 'dark';
  toggleMode: () => void;
  setTheme: (theme: string) => void;
}
```

### CSS Variables

Each theme defines custom CSS variables that are automatically applied:

```css
/* Light theme */
--primary: #3b82f6;      /* Blue */
--secondary: #6b7280;    /* Gray */
--background: #ffffff;   /* White */
--foreground: #000000;   /* Black */

/* Dark theme */
--primary: #60a5fa;      /* Light Blue */
--secondary: #d1d5db;    /* Light Gray */
--background: #000000;   /* Black */
--foreground: #ffffff;   /* White */
```

### No Manual Dark Mode Styling Needed

All components automatically adapt to the current theme. No need for manual `dark:` class additions—the theme system handles it:

```tsx
// ✅ CORRECT - Colors adapt automatically
<Card>
  <CardContent className="text-foreground bg-background">
    Content adapts to theme
  </CardContent>
</Card>

// ❌ WRONG - Manual dark mode (unnecessary)
<div className="text-black dark:text-white bg-white dark:bg-black">
  Don't do this - use semantic classes instead
</div>
```

## Icons

Use `lucide-react` for icons with shadcn components:

```tsx
import { Moon, Sun } from 'lucide-react';

<Button variant="ghost" size="icon">
  <Sun className="h-4 w-4" />
</Button>
```

## Component Structure

Always import and use shadcn components in this structure:

```tsx
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function MyComponent() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Title</CardTitle>
      </CardHeader>
      <CardContent>
        <Label>Label</Label>
        <Input placeholder="Enter text" />
        <Button>Submit</Button>
      </CardContent>
    </Card>
  );
}
```

## Server Components vs Client Components

- Use `'use client'` only when necessary (state, hooks, interactivity)
- Keep server components as the default
- Never use custom context providers - use shadcn's built-in providers (ThemeProvider, etc.)

## Responsive Design

Use Tailwind's responsive prefixes:

```tsx
<div className="text-sm md:text-base lg:text-lg">
  Responsive text
</div>
```

## Summary

✅ **DO:**
- Use only shadcn UI components
- Format dates with `date-fns` using `do MMM yyyy` pattern
- Use Tailwind CSS utilities for styling
- Use semantic color classes
- Install missing components with `npx shadcn@latest add <component>`

❌ **DON'T:**
- Create custom components
- Use hardcoded color values (use semantic classes)
- Mix styling approaches
- Create custom date formatting utilities
- Use unstyled HTML elements

