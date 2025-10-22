# Visual Animation Guide - SimplyJury Homepage

## Section-by-Section Animation Breakdown

### 🎯 Hero Section

**Current State**: Static elements
**Enhanced State**: Dynamic parallax with floating elements

```
Animation Sequence:
0.0s → Background shapes start parallax movement
0.2s → Badge fades in from top
0.4s → Heading words reveal sequentially (stagger 0.1s each)
0.8s → Subtitle fades in from bottom
1.0s → CTA buttons slide up with bounce
1.2s → Hero image floats in with continuous animation
1.4s → Floating cards appear with spring effect
```

**Parallax Layers**:
- Layer 1 (0.3x): Yellow circle, violet square (background)
- Layer 2 (0.5x): Mint green shape
- Layer 3 (0.7x): Floating cards
- Layer 4 (1.0x): Main content

---

### 🎨 Features Section

**Animation Pattern**: Sequential card reveal

```
Trigger: Section 20% in viewport
Cards animate in sequence (100ms stagger):

Card 1 (Search) → 0.0s
Card 2 (Message) → 0.1s  
Card 3 (Shield) → 0.2s
Card 4 (Calendar) → 0.3s

Each card:
- Slides up 60px
- Fades from 0 to 1
- Icon scales from 0.5 to 1 with bounce
```

---

### 📋 How It Works Section

**Animation Pattern**: Directional slides

```
Left Card (Jury):
- Slides from left (-100px to 0)
- Fades in (0 to 1)
- Duration: 0.7s

Right Card (Organisme):
- Slides from right (100px to 0)
- Fades in (0 to 1)
- Duration: 0.7s

Step Numbers:
- Scale from 0.5 to 1
- Rotate from -180° to 0°
- Bounce effect on complete
```

---

### 📊 Stats Section

**Animation Pattern**: Counter animations

```
When section enters viewport:

Numbers count up:
300+ → Counts from 0 to 300 (1.5s duration)
3h → Counts from 0 to 3 (1.2s duration)
300+ → Counts from 0 to 300 (1.5s duration)

Icon backgrounds:
- Circular fill animation (0 to 100%)
- Synchronized with counter
- Pulse effect on completion
```

---

## 🎬 Animation Code Examples

### Fade In Up Component
```tsx
<motion.div
  initial={{ opacity: 0, y: 60 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, amount: 0.3 }}
  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
>
  {children}
</motion.div>
```

### Parallax Effect
```tsx
const { scrollY } = useScroll();
const y = useTransform(scrollY, [0, 1000], [0, -300]);

<motion.div style={{ y }}>
  {/* Parallax content */}
</motion.div>
```

### Counter Animation
```tsx
const count = useMotionValue(0);
const rounded = useTransform(count, Math.round);

useEffect(() => {
  const animation = animate(count, targetValue, {
    duration: 1.5,
    ease: "easeOut"
  });
  return animation.stop;
}, []);
```

---

## 🎨 Color-Coded Animation Timeline

```
Hero Section (0-2s)
████████████████████ Marine Blue

Features (2-3.5s)
████████ Mint Green

How It Works (3.5-5s)
██████████ Violet

Stats (5-7s)
████████████ Yellow

Support (7-8.5s)
█████████ Marine Blue

Newsletter (8.5-10s)
██████████ Mint Green
```

---

## 📱 Mobile Adaptations

- Parallax: 50% intensity
- Animations: 0.4s (faster)
- Stagger: 50ms (tighter)
- Floating: Reduced amplitude
- 3D effects: Disabled

---

## ♿ Accessibility

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```
