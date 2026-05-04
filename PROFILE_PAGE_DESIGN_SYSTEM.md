# TripVerse Profile Page Design System

## Color Palette

### Primary Colors
- **Deep Blue**: `#1e40af` - Used for primary gradients and accents
- **Cyan/Teal**: `#0891b2` - Used for gradient transitions and focus states
- **Bright Teal**: `#2DD4BF` - Used for highlights and card accents
- **Dark Green**: `#0d9488` - Used for status badges and input border accents

### Secondary Colors
- **White**: `#ffffff` - Base card and input background
- **Light Gray**: `#6B7280` - Label text
- **Dark Gray**: `#111827` - Body text
- **Gray Border**: `rgba(0, 0, 0, 0.1)` - Soft borders

### Error Colors
- **Red**: `#dc2626` - Error states
- **Light Red**: `rgba(254, 242, 242, 0.9)` - Error card background

---

## Gradient Themes

### 1. Main Background Gradient
```css
background: linear-gradient(
  135deg,
  #1e40af 0%,
  #0891b2 40%,
  #0d9488 75%,
  #2DD4BF 100%
);
```
- **Purpose**: Page background (full screen)
- **Direction**: 135° diagonal (top-left to bottom-right)
- **Color Distribution**: 60% Blue, 30% Teal, 10% Green

### 2. Soft Overlay Layer
```css
background: linear-gradient(
  to bottom right,
  rgba(255,255,255,0.08),
  rgba(255,255,255,0.02)
);
```
- **Purpose**: Softens the main gradient
- **Effect**: Premium, non-harsh look

### 3. Card Accent Line (Top Border)
```css
background: linear-gradient(to right, #2DD4BF, #0891b2, #1e40af);
```
- **Purpose**: Top 4px border on each card
- **Direction**: Left (Bright Teal) → Right (Deep Blue)

### 4. Input/Select Border Gradient
```css
background: linear-gradient(to right, #0d9488, #0891b2);
```
- **Purpose**: Input field borders
- **Direction**: Left (Dark Green) → Right (Cyan)

### 5. Button Gradient (Primary)
```css
background: linear-gradient(135deg, #2DD4BF, #0891b2);
```
- **Purpose**: "Edit Profile", "Change Email", "Change Password" buttons
- **Direction**: 135° diagonal
- **Hover**: Changes to `linear-gradient(135deg, #0d9488, #1e40af)`

---

## Radial Glow Effects

### Top-Right Glow (Teal)
```css
radial-gradient(
  circle at 80% 20%,
  rgba(45, 212, 191, 0.25),
  transparent 40%
);
```
- **Position**: Top-right corner
- **Color**: Bright Teal with 25% opacity
- **Fade**: Transparent at 40% radius

### Bottom-Left Glow (Blue)
```css
radial-gradient(
  circle at 20% 80%,
  rgba(30, 64, 175, 0.25),
  transparent 40%
);
```
- **Position**: Bottom-left corner
- **Color**: Deep Blue with 25% opacity
- **Fade**: Transparent at 40% radius

---

## Shadow & Depth Effects

### Card Shadow (Normal)
```css
box-shadow: 
  0 10px 30px rgba(21, 94, 117, 0.25),
  0 4px 10px rgba(0, 0, 0, 0.05);
```
- **Primary Shadow**: Teal-tinted depth shadow
- **Secondary Shadow**: Soft black shadow

### Input Focus Shadow
```css
box-shadow: 0 0 0 3px rgba(45, 212, 191, 0.2);
```
- **Color**: Teal glow
- **Spread**: 3px
- **Opacity**: 20%

### Status Badge Shadow
```css
box-shadow: 0 4px 12px rgba(13, 148, 136, 0.3);
```
- **Color**: Dark Green
- **Spread**: 12px
- **Opacity**: 30%

### Button Hover Shadow
```css
box-shadow: 0 8px 20px rgba(45, 212, 191, 0.4);
```
- **Color**: Bright Teal
- **Spread**: 20px
- **Opacity**: 40%

---

## Glass Effect (Glassmorphism)

### Card Base
```css
background: rgba(255, 255, 255, 0.85);
backdrop-filter: blur(12px);
-webkit-backdrop-filter: blur(12px);
border: 1px solid rgba(255, 255, 255, 0.3);
```
- **Background**: 85% opaque white
- **Blur**: 12px backdrop blur
- **Border**: Soft white glass edge

---

## Images & Assets

### World Map Background
- **Path**: `/public/images/cities/world map.png`
- **Location on Card**: Bottom-right full coverage (pseudo-element ::after)
- **Opacity**: 15%
- **Size**: Covers entire card (background-size: cover)
- **Position**: Absolute positioning (top: 0, left: 0, right: 0, bottom: 0)
- **Z-Index**: 0 (behind all content)
- **Border Radius**: 12px (matches card)

---

## Typography & Badge Styling

### Status Badge (Active)
```css
background: #0d9488;
color: #ffffff;
border: 1px solid #0d9488;
border-radius: 999px;
padding: 4px 12px;
font-size: 0.875rem;
font-weight: 600;
box-shadow: 0 4px 12px rgba(13, 148, 136, 0.3);
```
- **Color**: Dark Green (#0d9488)
- **Text**: White
- **Style**: Solid, pill-shaped badge

### Card Button (Primary)
```css
background: linear-gradient(135deg, #2DD4BF, #0891b2);
color: #FFFFFF;
border: none;
font-weight: 600;
```
- **Gradient**: Bright Teal to Cyan
- **Text**: White, bold (600)
- **No Border**: Clean appearance

---

## Transitions & Animations

### All Elements
```css
transition: all 0.3s ease-in-out;
```
- **Duration**: 300ms
- **Easing**: ease-in-out

### Input Focus
```css
transition: all 0.2s ease-in-out;
```
- **Duration**: 200ms (faster for inputs)

---

## Responsive Design Notes

- **Container**: Max-width 4xl (56rem)
- **Padding**: 1.5rem (px-4 py-8)
- **Card Spacing**: 1.5rem between cards (space-y-6)
- **Input Spacing**: 1rem between fields (space-y-4)
- **Border Radius**: 
  - Cards: 12px
  - Inputs: 6px (0.375rem)
  - Badges: 999px (full round)

---

## CSS Classes Reference

- `.premium-gradient-bg` - Page background with gradient
- `.premium-card` - Card styling with glassmorphism
- `.card-accent-line` - Top gradient border (::before pseudo-element)
- `.card-button-primary` - Primary button styling
- `.status-badge` - Status badge styling
- `.premium-input` - Input field styling
- `.premium-input:focus` - Input focus state

---

## Summary

**Color Harmony:**
- Primary: Deep Blue + Cyan Teal
- Accent: Bright Teal + Dark Green
- Opacity layering for glassmorphism effect
- Teal-tinted shadows for visual cohesion

**Visual Effects:**
- Glassmorphism with 12px blur
- Radial glows at corners for depth
- Gradient accents on cards and inputs
- Smooth 0.3s transitions throughout

**Premium Touches:**
- World map watermark at 15% opacity
- Soft glass borders
- Teal/green color coordination
- Professional depth with shadows
