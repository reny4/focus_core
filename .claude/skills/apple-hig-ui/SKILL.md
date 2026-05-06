---
name: apple-hig-ui
description: Apply Apple Human Interface Guidelines (HIG) principles — Clarity, Deference, Depth — to Focus Core UI components built with Next.js App Router, Tailwind CSS, and shadcn/ui. Use when creating or modifying React components (*.tsx), layouts, pages, modals, forms, buttons, dialogs, navigation elements, the timer display, task list, or stats panels. Also use when choosing colors, spacing, typography, or animation values.
---

# Apple HIG UI Skill — Focus Core

Translate Apple's Human Interface Guidelines into Tailwind CSS + shadcn/ui decisions for the Focus Core project. The timer digit is the UI. Everything else is infrastructure.

## When to Use This Skill

- Creating or modifying any React component (`*.tsx`)
- Implementing a layout, page, or modal
- Choosing colors, spacing, typography, or animation values
- Designing a form, button, dialog, or navigation element
- Implementing the timer display, task list, or stats panel

## Core Design Philosophy

### 1. Clarity
Every element communicates its purpose unambiguously.
- Text legible at every size; no decorative type competing with content
- Icons paired with text labels for primary actions
- Buttons labeled with verbs describing the outcome ("Finish session", not "OK")

### 2. Deference
The UI steps back; content takes center stage.
- Backgrounds are neutral, never competing with foreground content
- Navigation chrome is minimal — present but not dominant
- **In Focus Core: the large timer digit IS the UI. Everything else is secondary**

### 3. Depth
Hierarchy through scale, weight, and subtle layering — NOT decoration.
- Cards/panels use thin borders rather than heavy shadows
- Motion communicates state change, not decoration

---

## Design Tokens

### Color System (semantic, light/dark adaptive)

Use shadcn/ui CSS variables. Never hardcode hex values.

| Role | Tailwind / CSS var | HIG equivalent |
|------|--------------------|----------------|
| App background (Level 0) | `bg-background` | `systemBackground` |
| Card/panel (Level 1) | `bg-card` | `secondarySystemBackground` |
| Grouped bg (Level 2) | `bg-muted` | `tertiarySystemBackground` |
| Primary text | `text-foreground` | `label` |
| Secondary text | `text-muted-foreground` | `secondaryLabel` (~60% opacity) |
| Tertiary text | `text-muted-foreground/50` | `tertiaryLabel` (~30% opacity) |
| Accent/tint | `text-primary` / `bg-primary` | Single brand color, used sparingly |
| Destructive | `text-destructive` / `bg-destructive` | Red — ONLY for discard/delete |
| Success | `text-green-600 dark:text-green-400` | ONLY for session completion |

**Rules:**
- No color used merely for decoration
- Never use multiple accent colors simultaneously
- No gradient backgrounds

### Typography Scale (web equivalent of iOS Dynamic Type)

Font stack in `tailwind.config.ts`:
```
font-sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'sans-serif']
```

| Role | Tailwind class | Use |
|------|---------------|-----|
| Large Title (34pt) | `text-4xl font-bold` | Timer display ONLY |
| Title 1 (28pt) | `text-3xl font-bold` | Section headers |
| Title 2 (22pt) | `text-2xl font-semibold` | Card titles |
| Title 3 (20pt) | `text-xl font-semibold` | Sub-headers |
| Headline (17pt semibold) | `text-base font-semibold` | List item titles |
| Body (17pt) | `text-base` | Default body text |
| Callout (16pt) | `text-[1rem]` | Secondary info |
| Subhead (15pt) | `text-sm` | Metadata |
| Footnote (13pt) | `text-xs tracking-wide` | Timestamps, captions |

Minimum font size: **12px** (accessibility hard limit).

### Spacing System (8pt grid)

| Value | Tailwind | Use |
|-------|----------|-----|
| 4px | `gap-1` / `p-1` | Micro spacing (icon gap) |
| 8px | `gap-2` / `p-2` | Tight spacing |
| 16px | `gap-4` / `p-4` | Standard padding (inset) |
| 20px | `gap-5` / `p-5` | List item padding |
| 24px | `gap-6` / `p-6` | Section gap |
| 32px | `gap-8` / `p-8` | Large section gap |
| **44px** | `min-h-[44px]` | **Minimum touch target (non-negotiable)** |

### Border Radius

| Element | Tailwind | px |
|---------|----------|----|
| Badges, tags | `rounded` | 6px |
| Buttons, inputs | `rounded-lg` | 8px |
| Cards, panels | `rounded-xl` | 12px |
| Bottom sheets | `rounded-t-2xl` | 20px |
| Toggle/pill | `rounded-full` | — |

### Shadows / Elevation (restrained)

| Level | Tailwind | Use |
|-------|----------|-----|
| Card | `shadow-sm` | Standard card |
| Floating panel | `shadow-md` | Dropdowns, popovers |
| Modal overlay | `backdrop-blur-sm bg-black/20` | Sheet backdrop |

**NO decorative drop-shadows.**

### Motion / Animation

```css
/* Apple ease-out */
transition-timing-function: cubic-bezier(0.25, 0.46, 0.45, 0.94);
```

| Context | Duration |
|---------|----------|
| Button press, micro | 250ms |
| Panel open/close | 350ms |
| Page transition | 500ms |
| counting_down → counting_up | 300ms opacity cross-fade |

**Rules:**
- NO spring physics, NO bouncing, NO sliding carousels
- Wrap ALL transitions in `prefers-reduced-motion`:

```tsx
// globals.css
@media (prefers-reduced-motion: reduce) {
  * { transition-duration: 0ms !important; animation-duration: 0ms !important; }
}
```

---

## Component-Specific Rules

### Timer Display

```tsx
// counting_down: neutral
<span className="text-4xl font-bold tabular-nums text-foreground">
  {formatted}
</span>

// counting_up: accent (quiet positive signal, NOT warning)
<span className="text-4xl font-bold tabular-nums text-primary">
  {formatted}
</span>
```

- `font-variant-numeric: tabular-nums` — prevents layout shift
- **No pulsing, blinking, or animation on the digit during normal operation**
- Timer digit must be the single largest element on screen

### Buttons

| Type | Classes |
|------|---------|
| Primary (Start, Finish) | `bg-primary text-primary-foreground rounded-lg min-h-[44px] px-6` |
| Secondary | `variant="outline"` or `variant="ghost"` |
| Destructive (Discard confirm) | `bg-destructive text-destructive-foreground rounded-lg min-h-[44px]` |
| Disabled | `opacity-40 cursor-not-allowed` |

- All buttons: `min-h-[44px]` touch target
- Use padding to meet 44×44px without forced width

### FocusTask List

```tsx
<li className="flex items-center min-h-[44px] px-4 gap-3">
  {/* Tag color dot */}
  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: tag.color }} />
  {/* Task name */}
  <span className="text-base font-semibold flex-1">{task.name}</span>
  {/* Trailing */}
  <ChevronRightIcon className="w-4 h-4 text-muted-foreground" />
</li>
{/* Inset separator — starts after the leading icon */}
<Separator className="ml-9" />
```

- Selected/active row: `bg-primary/10`

### Dialogs

**Discard confirmation (Alert style — centered):**
```tsx
<AlertDialog>
  <AlertDialogContent className="rounded-xl">
    <AlertDialogTitle>セッションを破棄しますか？</AlertDialogTitle>
    <AlertDialogDescription>この操作は取り消せません。</AlertDialogDescription>
    <AlertDialogFooter>
      {/* Cancel LEFT, Destructive RIGHT — iOS convention */}
      <AlertDialogCancel>キャンセル</AlertDialogCancel>
      <AlertDialogAction className="bg-destructive text-destructive-foreground">
        破棄する
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

**6h Review dialog (Bottom sheet — soft interruption):**
```tsx
<Sheet>
  <SheetContent side="bottom" className="rounded-t-2xl">
    {/* Drag handle */}
    <div className="mx-auto w-12 h-1.5 rounded-full bg-muted-foreground/20 mb-4" />
    {/* User can see timer behind the sheet */}
  </SheetContent>
</Sheet>
```

### Navigation

**Desktop:** Left sidebar + main content (2-column layout)

**Mobile bottom tab bar (3 tabs max):**
```tsx
<nav className="fixed bottom-0 inset-x-0 border-t bg-background/80 backdrop-blur-sm">
  <div className="flex h-[56px]">
    {tabs.map(tab => (
      <button
        key={tab.id}
        className={cn(
          "flex-1 flex flex-col items-center justify-center gap-0.5 min-h-[44px]",
          isActive ? "text-primary" : "text-muted-foreground"
        )}
        aria-label={tab.label}
      >
        <tab.Icon className="w-5 h-5" />
        <span className="text-[10px] font-medium">{tab.label}</span>
      </button>
    ))}
  </div>
</nav>
```

- Icon + label always; never icon alone
- Active: `text-primary`, Inactive: `text-muted-foreground`
- No hamburger menus

### Forms (CreateTag, CreateFocusTask)

- Label above input (never floating labels)
- Validation errors inline below field, never toast-only
- Destructive submit (archive) always requires confirmation dialog

```tsx
<div className="space-y-2">
  <Label htmlFor="name">タスク名</Label>
  <Input id="name" {...register("name")} className="rounded-lg" />
  {errors.name && (
    <p className="text-xs text-destructive">{errors.name.message}</p>
  )}
</div>
```

### Empty States

```tsx
<div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
  <TaskIcon className="w-12 h-12 text-muted-foreground/40" aria-hidden />
  <div className="space-y-1">
    <p className="text-base font-semibold">タスクを追加しましょう</p>
    <p className="text-sm text-muted-foreground">集中したい作業を登録してください</p>
  </div>
  <Button className="rounded-lg min-h-[44px]">タスクを作成</Button>
</div>
```

- "Get started" language, NOT "No items found"

### Stats / Charts (Recharts)

- Bar fills: `var(--primary)` (single color)
- Axes: `text-muted-foreground`, no heavy grid lines (dotted or none)
- No chart animations on initial load
- Heatmap: 4 opacity levels of accent — `primary/0`, `primary/30`, `primary/60`, `primary/80`, `primary/100`

```tsx
// Heatmap cell example
<div
  className="w-3 h-3 rounded-sm"
  style={{ backgroundColor: `hsl(var(--primary) / ${opacity})` }}
  aria-label={`${date}: ${minutes}分`}
/>
```

---

## What NOT to Produce

```
✗ Heavy drop shadows on cards
✗ Gradient backgrounds
✗ Multiple accent colors simultaneously
✗ Decorative dividers or ornamental elements
✗ Animations that persist while user is focused (timer screen must be still)
✗ Font sizes below 12px
✗ Touch targets below 44×44px
✗ Color-only communication (always pair color with icon or text)
✗ Floating labels on form inputs
✗ Toast-only validation errors
```

---

## tailwind.config.ts Overrides

```ts
// tailwind.config.ts
import type { Config } from 'tailwindcss'

const config: Config = {
  theme: {
    extend: {
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'sans-serif'],
      },
      borderRadius: {
        // Override shadcn defaults to match Apple HIG scale
        sm: '6px',   // badges, tags
        DEFAULT: '8px',  // buttons, inputs
        md: '8px',
        lg: '12px',  // cards
        xl: '16px',
        '2xl': '20px', // sheets
      },
      transitionTimingFunction: {
        'apple': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      },
      transitionDuration: {
        'micro': '250ms',
        'panel': '350ms',
        'page': '500ms',
      },
    },
  },
}
export default config
```

---

## AI Assistant Instructions

When this skill is active, for every UI file created or modified:

1. **State** which HIG principle(s) the component primarily serves (Clarity / Deference / Depth)
2. **Explain** Tailwind class token decisions when non-obvious
3. **Flag** deviations with: `{/* HIG: deviation — [reason] */}`
4. **Produce** components that work in both light and dark mode by default (use CSS vars, never hardcode hex)
5. **Include** `aria-label` / `role` attributes on all interactive elements
6. **Verify** every interactive element meets the 44px touch target minimum

Always:
- Use `tabular-nums` on timer/duration displays
- Use `min-h-[44px]` on all clickable elements
- Put Cancel left, destructive action right in confirmation dialogs
- Use bottom sheet (`Sheet side="bottom"`) for soft interruptions
- Use `AlertDialog` for blocking confirmations (Discard only)

Never:
- Hardcode hex colors — use `bg-primary`, `text-muted-foreground`, etc.
- Animate the timer digit during normal operation
- Use toast as the sole source of validation error feedback
- Create touch targets smaller than 44×44px
- Use more than one accent color in a single view
