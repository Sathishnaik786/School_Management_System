# Global Tailwind Responsive UI Instructions (For AI Only)

## Objective

Generate or modify UI that is fully responsive across: - Large
Monitors - Desktop Screens - Small Laptop Screens - Tablets - Mobile
Devices

Use Mobile-First Responsive Design using Tailwind CSS breakpoints.

------------------------------------------------------------------------

## Breakpoint System (Tailwind Standard)

  Device          Prefix    Min Width
  --------------- --------- -----------
  Mobile          default   0px
  Small Mobile    sm        640px
  Tablet          md        768px
  Laptop          lg        1024px
  Desktop         xl        1280px
  Large Monitor   2xl       1536px

------------------------------------------------------------------------

## Core Rules

### Mobile First

Always write base styles for mobile, then scale up using breakpoints.

Correct:

    p-4 sm:p-6 lg:p-8

Wrong:

    p-8 lg:p-4

------------------------------------------------------------------------

### No Fixed Widths

Never use: - Fixed pixel widths - Hard-coded layout sizes

Always prefer: - w-full - max-w-screen-\* - container - flex - grid

------------------------------------------------------------------------

### Fluid Layouts Only

Prefer: - Flexbox - CSS Grid - Tailwind Container

Avoid: - Absolute positioning heavy layouts - Fixed pixel positioning

------------------------------------------------------------------------

## Layout Structure

### Page Wrapper

    <div class="w-full max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8">

------------------------------------------------------------------------

### Grid Rules

Mobile: - 1 column

Tablet: - 2 columns

Laptop and Above: - 3--4 columns

Example:

    grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6

------------------------------------------------------------------------

## Navigation Rules

Mobile: - Hamburger Menu - Drawer Navigation

Tablet and Above: - Horizontal Navbar

------------------------------------------------------------------------

## Typography Scaling

Always scale text using breakpoints.

Example:

    text-sm sm:text-base lg:text-lg xl:text-xl

------------------------------------------------------------------------

## Component Responsiveness

### Cards

Rules: - Full width on mobile - Max width control on desktop -
Responsive padding

Example:

    w-full sm:max-w-md lg:max-w-lg xl:max-w-xl p-4 sm:p-6 lg:p-8

------------------------------------------------------------------------

## Tables

Mobile: Wrap tables inside horizontal scroll container.

    overflow-x-auto

Desktop: Normal table layout.

------------------------------------------------------------------------

## Images

Always:

    w-full h-auto object-cover

Never use fixed height + width together unless required.

------------------------------------------------------------------------

## Spacing System

Use responsive spacing scale:

    p-3 sm:p-4 lg:p-6 xl:p-8
    gap-3 sm:gap-4 lg:gap-6

------------------------------------------------------------------------

## Height Strategy

Avoid: - h-screen everywhere

Prefer: - min-h-screen - natural content height

------------------------------------------------------------------------

## Testing Requirements

UI must be tested at: - 320px - 375px - 768px - 1024px - 1440px -
1920px - 2560px

------------------------------------------------------------------------

## Accessibility Requirements

Must include: - Color contrast compliance - Focus states - Keyboard
navigation - ARIA labels when needed

------------------------------------------------------------------------

## Performance Rules

Prefer: - Lazy loaded images - Conditional rendering for heavy UI -
Reduced blur/shadow effects on mobile

------------------------------------------------------------------------

## Animation Rules

Mobile: - Minimal animations

Desktop: - Subtle transitions - Framer Motion allowed

------------------------------------------------------------------------

## Tailwind Best Practices

Allowed: - Utility-first classes - Responsive variants - Grid + Flex
combinations

Avoid: - Inline CSS - Fixed pixel layouts - Large absolute positioned UI
blocks

------------------------------------------------------------------------

## Validation Checklist

Before finalizing UI:

-   Works at 320px mobile
-   No horizontal scroll
-   No text overflow
-   Buttons thumb reachable on mobile
-   Tables scroll correctly on mobile
-   Grid collapses correctly
-   Navigation switches correctly
-   Typography scales smoothly

------------------------------------------------------------------------

## Final Requirement

UI must feel: - Natural on Mobile - Efficient on Laptop - Premium on
Large Monitor

No device should feel like an afterthought.
