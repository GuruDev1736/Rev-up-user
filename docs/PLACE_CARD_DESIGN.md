# Place Card Design Guide

## 🎨 New Enhanced Design

### Visual Structure

```
┌────────────────────────────────────┐
│                                    │
│        [IMAGE WITH OVERLAY]        │  ← Image (h-56)
│                                    │  ← Gradient overlay
│        📍 Location Badge           │  ← White badge bottom-left
│                                    │
├────────────────────────────────────┤
│                                    │
│  Place Name (Bold, Large)          │  ← Title (hover: red)
│                                    │
│  Description text that shows       │  ← 2-line clamp
│  preview of the location...        │
│                                    │
│  ┌──────────────────────────────┐ │
│  │  Explore Bikes            →  │ │  ← Gradient button
│  └──────────────────────────────┘ │
│                                    │
└────────────────────────────────────┘
```

## 🎯 Key Features

### 1. **Card Container**
- **Background**: White with shadow
- **Border Radius**: 2xl (rounded-2xl)
- **Hover Effect**: 
  - Shadow increases (shadow-2xl)
  - Lifts up 8px (transform -translate-y-2)
  - Smooth 300ms transition

### 2. **Image Section**
- **Height**: 14rem (h-56)
- **Overflow**: Hidden for zoom effect
- **Hover Effect**: Image scales to 110%
- **Overlay**: Black gradient (60% → 20% → transparent)
- **Duration**: 500ms smooth transition

### 3. **Location Badge**
- **Position**: Absolute, bottom-left
- **Background**: White with 95% opacity + blur
- **Style**: Rounded pill shape
- **Content**: 📍 icon + location text
- **Shadow**: Medium shadow for depth

### 4. **Content Area**
- **Padding**: 1.25rem (p-5)
- **Spacing**: Consistent gaps between elements

### 5. **Title**
- **Size**: text-xl
- **Weight**: font-bold
- **Color**: Gray-900 (default), Red-600 (hover)
- **Truncate**: 1 line (line-clamp-1)
- **Transition**: Color change on hover

### 6. **Description**
- **Size**: text-sm
- **Color**: Gray-600
- **Lines**: Max 2 (line-clamp-2)
- **Line Height**: Relaxed (leading-relaxed)

### 7. **Action Button**
- **Background**: Red gradient (600 → 700)
- **Hover**: Darker gradient (700 → 800)
- **Style**: Rounded-xl with full width
- **Padding**: px-5 py-3
- **Font**: Semibold
- **Icon**: Arrow with slide animation
- **Shadow**: Increases on hover

## 🎨 Color Palette

### Primary Colors
```css
Background:    #FFFFFF (white)
Text Primary:  #111827 (gray-900)
Text Secondary: #4B5563 (gray-600)
Accent:        #DC2626 (red-600)
Accent Hover:  #B91C1C (red-700)
```

### Shadows
```css
Default:  shadow-lg (8px blur)
Hover:    shadow-2xl (24px blur)
Button:   shadow-md → shadow-lg
```

### Gradients
```css
Image Overlay:    from-black/60 via-black/20 to-transparent
Button Default:   from-red-600 to-red-700
Button Hover:     from-red-700 to-red-800
Skeleton Loading: from-gray-200 to-gray-300
```

## ✨ Interactive States

### Hover Effects
1. **Card**: Lifts up with enhanced shadow
2. **Image**: Zooms in (scale-110)
3. **Title**: Changes to red color
4. **Button**: Darker gradient + larger shadow
5. **Arrow Icon**: Slides right 4px

### Transitions
- **Card Transform**: 300ms
- **Image Scale**: 500ms
- **Color Changes**: 300ms (default)
- **Button**: 300ms all properties
- **Arrow**: Transform only

## 📐 Spacing & Layout

### Grid Layout
```css
Mobile (< 768px):    1 column
Tablet (768-1024px): 2 columns
Desktop (> 1024px):  3 columns
Gap:                 2rem (gap-8)
```

### Internal Spacing
```css
Image Height:     14rem (h-56)
Content Padding:  1.25rem (p-5)
Title Margin:     0.5rem bottom
Description:      1rem bottom
Button Height:    3rem (py-3)
Badge Spacing:    0.75rem from edges
```

## 🎭 Loading Skeleton

### Structure
```
┌────────────────────────────────┐
│   [Gradient Gray Rectangle]    │  ← h-56
├────────────────────────────────┤
│  [Gray Bar 75% width]          │  ← Title
│  [Gray Bar 100% width]         │  ← Description line 1
│  [Gray Bar 85% width]          │  ← Description line 2
│  [Gray Rectangle full width]   │  ← Button
└────────────────────────────────┘
```

### Animation
- **Type**: Pulse animation
- **Gradient**: Gray-200 to Gray-300
- **Duration**: Continuous loop

## ⚠️ Error State

### Design
- **Container**: Red-50 background
- **Border**: 2px dashed red-200
- **Icon**: ⚠️ emoji (text-5xl)
- **Title**: Red-800, font-bold
- **Message**: Red-600
- **Button**: Red gradient with hover

## 📭 Empty State

### Design
- **Container**: Gray-50 background
- **Border**: 2px dashed gray-300
- **Icon**: 📍 emoji (text-6xl)
- **Title**: Gray-700, font-bold
- **Message**: Gray-500

## 🔧 Component Props

### PlaceCard Props
```typescript
interface Place {
  id: number;
  placeName: string;
  placeDescription: string;
  placeImage: string;
  placeLocation: string;
  createdAt?: number;
}
```

## 📱 Responsive Design

### Mobile (< 768px)
- Single column layout
- Full width cards
- Touch-friendly buttons (min-height: 48px)

### Tablet (768px - 1024px)
- 2 column grid
- Cards maintain aspect ratio
- Slightly reduced padding

### Desktop (> 1024px)
- 3 column grid
- Maximum container width
- Full hover effects active

## 🎯 Accessibility

### ARIA Labels
```jsx
aria-label={`Book a ride for ${place.placeName}`}
```

### Keyboard Navigation
- Cards focusable
- Button receives focus
- Enter/Space activates button

### Semantic HTML
- Proper heading hierarchy (h2)
- Descriptive alt text
- Meaningful link text

## 🚀 Performance

### Optimization
- ✅ Image lazy loading (Next.js)
- ✅ CSS transitions (GPU accelerated)
- ✅ Minimal re-renders
- ✅ Optimized hover states

### Best Practices
- Use `transform` instead of `top/left`
- Use `will-change` sparingly
- Debounce expensive operations
- Memoize card components if needed

## 🎨 CSS Classes Reference

### Card Container
```jsx
className="group relative rounded-2xl overflow-hidden bg-white 
           shadow-lg hover:shadow-2xl transition-all duration-300 
           transform hover:-translate-y-2"
```

### Image Container
```jsx
className="relative h-56 overflow-hidden"
```

### Image (with zoom)
```jsx
className="rounded-t-2xl object-cover w-full h-full 
           group-hover:scale-110 transition-transform duration-500"
```

### Location Badge
```jsx
className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-sm 
           px-3 py-1.5 rounded-full shadow-md"
```

### Title
```jsx
className="text-xl font-bold text-gray-900 mb-2 line-clamp-1 
           group-hover:text-red-600 transition-colors"
```

### Button
```jsx
className="w-full bg-gradient-to-r from-red-600 to-red-700 
           text-white font-semibold rounded-xl px-5 py-3 
           hover:from-red-700 hover:to-red-800 transition-all 
           duration-300 shadow-md hover:shadow-lg"
```

## ✅ Final Result

A modern, polished place card with:
- 🎨 Attractive gradient overlays
- ✨ Smooth hover animations
- 📍 Clear location indicators
- 🖼️ Image zoom effects
- 🎯 Clear call-to-action
- 📱 Fully responsive
- ♿ Accessible
- ⚡ Performant

This design creates a premium, engaging user experience that encourages exploration and interaction!
