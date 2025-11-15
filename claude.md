# Design System

## Colors

**Primary Background**
- Sand: `bg-[var(--brand-sand)]` - Main page background

**Coral Palette** (lightest to darkest)
- Lightest: `bg-[var(--brand-coral-lightest)]` - Subtle backgrounds
- Lighter: `bg-[var(--brand-coral-lighter)]` - Light interactive elements
- Light: `bg-[var(--brand-coral-light)]` - Buttons, interactive elements
- Coral: `bg-[var(--brand-coral)]` - Primary accent, hover states
- Strong: `bg-[var(--brand-coral-strong)]` - Strong hover, emphasis
- Dark: `bg-[var(--brand-coral-dark)]` - Borders, call-to-action
- Darkest: `bg-[var(--brand-coral-darkest)]` - Active states

**Text**
- Primary: `text-black`
- Secondary: `text-black/70` or `text-black/80`

## Buttons

**Icon Buttons**
- Size: `h-10 w-10` (40px × 40px)
- Shape: `rounded-full`
- Background: `bg-[var(--brand-coral-light)]` with `hover:bg-[var(--brand-coral)]`

**Pill Buttons**
- Padding: `px-5 py-4` or `px-6 py-2.5` or `px-8 py-3`
- Shape: `rounded-full`
- Background: `bg-[var(--brand-coral-light)]` with `hover:bg-[var(--brand-coral)]`

**Call-to-Action Buttons**
- Class: `btn-pill btn-coral`
- Shape: `rounded-full`

## Typography

**Headings**
- Large: `text-[22px] sm:text-[28px]` or `text-3xl sm:text-4xl`
- Weight: `font-semibold` or `font-bold`

**Body**
- Size: `text-base` (16px)
- Weight: `font-medium`

## Spacing

**Layout**
- Header height: `h-20`
- Container padding: `px-4 sm:px-6 py-6`
- Element gaps: `gap-2` or `gap-3`

**Border Radius**
- Buttons: `rounded-full`
- Cards/Dialogs: `rounded-2xl` or `rounded-3xl`
- Dropdown items: `rounded-t-2xl` (top), `rounded-b-2xl` (bottom)

## Transitions

- Standard: `transition-all duration-200`
- Interactive elements should have smooth hover states
