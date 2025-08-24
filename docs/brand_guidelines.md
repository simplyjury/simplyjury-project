# SimplyJury - Brand Guidelines (Charte Graphique)

## About the Project

**Tagline:** "Trouvez un jury qualifié n'a jamais été aussi simple."
*(Finding a qualified jury has never been so simple.)*

**Mission:** Facilitate exam management by quickly finding qualified juries through a simple, intuitive platform designed for the needs of training organizations.

---

## Logo Variations

### Stacked Logo (Logo Empilé)
- **Primary version** with typographic element and iconography
- **Icon:** Hand making "OK" sign - symbolizes simplicity, practicality, peace of mind, and success
- **Typography:** Custom reworked letters with curved endings for dynamism and roundness
- **Layout:** Slightly diagonal superposition in two parts adds movement

### Vertical Logo (Logo Vertical)
- Emphasizes the "OK" icon with larger size within the logo
- Icon positioned over the name

### Horizontal Logo (Logo Horizontal)
- Single line format: "SimplyJury" (one word with capital S and J)

### Iconography Only
- **Symbol:** "OK" sign from sign language
- **Meaning:** Circle formed with thumb and index finger, other fingers straight or relaxed
- **Style:** Minimalist and geometric
- **Symbolism:** Platform simplicity, practicality, peace of mind, and success

---

## Color Palette

### Primary Colors

#### Marine Blue (Primary)
- **Hex:** `#0d4a70`
- **RGB:** 13, 75, 112
- **CMYK:** 96/65/33/20
- **Pantone:** 7693 C
- **Meaning:** Assurance and seriousness

#### Mint Green
- **Hex:** `#13d090`
- **RGB:** 19, 208, 144
- **CMYK:** 68/0/58/0
- **Pantone:** 3395 C

#### Yellow
- **Hex:** `#fdce0f`
- **RGB:** 253, 206, 15
- **CMYK:** 1/19/92/0
- **Pantone:** 109 C

#### Violet
- **Hex:** `#bea1e5`
- **RGB:** 190, 161, 229
- **CMYK:** 32/41/0/0
- **Pantone:** 0631 C

### Secondary/Light Variations
- **Light Blue:** `#edf6f9`
- **Light Mint:** `#ccf5e8`, `#e8faf5`
- **Light Yellow:** `#fff2bf`, `#fee88c`
- **Light Violet:** `#cfbaed`, `#faf5fc`
- **Dark Blue:** `#0c608a`

---

## Typography

### Primary Font: Plus Jakarta Sans
- **Family:** Google Fonts (free and open-source)
- **Style:** Geometric sans-serif
- **Characteristics:** Combines curves and precision with rounded letters and straight finishes
- **Download:** Available on Google Fonts

#### Font Weights Available:
- **Light:** `Plus Jakarta Sans Light`
- **Regular:** `Plus Jakarta Sans Regular`
- **Medium:** `Plus Jakarta Sans Medium`
- **Semi Bold:** `Plus Jakarta Sans Semi Bold`
- **Bold:** `Plus Jakarta Sans Bold`
- **Extra Bold:** `Plus Jakarta Sans Extra Bold`

#### Typography Hierarchy:

```
Title (Titre)
- Font: Plus Jakarta Sans Bold
- Color: Marine Blue (#0d4a70)

Subtitle (Sous-titre)
- Font: Plus Jakarta Sans Medium
- Color: Black

Special Title (Titre spécial)
- Font: Plus Jakarta Sans Bold
- Color: White
- Usage: Fantasy use on short text

Body Text (Corps de texte)
- Font: Plus Jakarta Sans Regular
- Color: Marine Blue (#0d4a70)
- Size: 18pt
- Line height: 30pt
- Alignment: Left-justified
```

#### Typography Rules:
- **Line spacing:** Must not be less than font size (except for titles)
- **Base alignment:** Left-justified for body text
- **Title alignment:** Depends on body text alignment

---

## Graphic Elements

### Icon Style
- **Style:** Full and monochrome
- **Appearance:** Clean, emphasis on visibility
- **Structure:** Slightly rounded for lightness in full form
- **Colors:** Available in all 4 main brand colors

### Highlight Lines (Surlignage)
- **Purpose:** Integral part of SimplyJury identity
- **Style:** Imitate highlighter marker in handwritten movement
- **Usage:** 
  - Decorative elements to emphasize subjects (human or object)
  - Can pass in front and behind elements for dynamic effect
  - Can create shapes for photo insertion
- **Characteristics:** Fluid, energetic, always rounded extremities
- **Reference:** Administrative universe

### Geometric Shapes
- **Types:** Square, round, and square with one rounded corner
- **Usage:** Add graphics to identity
- **Colors:** Use entire color palette

---

## Photography Style

### General Approach
- **Style:** Bright, clear, and natural
- **Processing:** No filters, no apparent retouching
- **Values:** Human contact, expertise, dynamism, and professionalism

### Two Photographic Axes:

#### 1. Illustrative (Illustratif)
- **Content:** Professional life scenes representing SimplyJury users
- **People:** Interacting with their environment
- **Gaze:** Should NOT show connivance with camera/objective
- **Environment:** Natural professional settings

#### 2. Communicational
- **Content:** Portraits of diverse active individuals
- **Setting:** Studio shots without background
- **Integration:** Graphic elements added to dress the subject
- **Usage:** Clean portraits for versatile use

---

## Usage Guidelines

### Logo Usage
- **Minimum size:** 35mm length
- **Clear space:** Maintain security zone around logo (no other graphic elements should disturb readability)

### Logo Color Variations
All logo versions available in:
- Marine Blue typography with colored icon
- White typography with colored icon
- Icon colors: Yellow, Violet, Mint, Light Blue, Marine, White

### Incorrect Usage (Do Not):
- ❌ Modify composition
- ❌ Change font
- ❌ Ignore security zone around logo
- ❌ Use colors outside brand palette
- ❌ Deform, stretch, or contract
- ❌ Use unauthorized color combinations

---

## Implementation Notes for Development

### CSS Color Variables
```css
:root {
  --color-marine: #0d4a70;
  --color-mint: #13d090;
  --color-yellow: #fdce0f;
  --color-violet: #bea1e5;
  
  /* Light variations */
  --color-light-blue: #edf6f9;
  --color-light-mint-1: #ccf5e8;
  --color-light-mint-2: #e8faf5;
  --color-light-yellow-1: #fff2bf;
  --color-light-yellow-2: #fee88c;
  --color-light-violet-1: #cfbaed;
  --color-light-violet-2: #faf5fc;
  --color-dark-blue: #0c608a;
}
```

### Font Implementation
```css
@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,200;0,300;0,400;0,500;0,600;0,700;0,800;1,200;1,300;1,400;1,500;1,600;1,700;1,800&display=swap');

.font-jakarta {
  font-family: 'Plus Jakarta Sans', sans-serif;
}
```

### Logo Assets Required
- Stacked logo (vertical text layout)
- Vertical logo (icon over text)
- Horizontal logo (single line)
- Icon only
- All in multiple color variations (marine, white text with colored icons)

---

*Brand guidelines created by Getup Agency - 2025*