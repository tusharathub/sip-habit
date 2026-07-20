# UI Skill Design Guide: SketchPad (Peach/Cream/Charcoal)

This guide documents the design system, colors, spacing, and hand-drawn sketch styles used in the **Sip Habit** app. Use this guide to recreate the same premium hand-drawn UI for any web or standalone companion app.

---

## 🎨 Color Palette (Peach & Cream)

| Token | Color Value | Description & Intent |
| :--- | :--- | :--- |
| **Cream Page Bg** | `#F5F0E8` | Warm parchment paper style background |
| **Cream Card Bg** | `#FAF8F3` | Slightly lighter cream background for primary card containers |
| **Cream Pressed** | `#EDE7DB` | Darker warm cream shade used for active, hover, or pressed states |
| **Charcoal** | `#2D3436` | Signature outline border color, headings, and primary text |
| **Charcoal Soft** | `#4A4E50` | Softer charcoal tone for body copy and paragraph text |
| **Peach / Salmon** | `#E8C4B8` | Main branding accent color for primary buttons, active markers, and highlights |
| **Peach Light** | `#F0D5CB` | Light peach shade for progress bars, tags, and badge backgrounds |
| **Peach Soft** | `rgba(232, 196, 184, 0.18)` | Transparent tint for container backgrounds (previously teal soft) |
| **Muted Grey** | `#7A7A6E` | Earthy muted grey color for disabled tags, subtitles, and captions |

---

## ✏️ Reusable Design Patterns

The main style mimics a hand-drawn 3D whiteboard or wireframe document. To keep things clean, avoid complex shadows and gradients; instead, rely on flat shapes, thick line-art borders, and offset solid color blocks.

### 1. The Sketch Card Style
Every card container must use:
- **Background**: Light Cream (`#FAF8F3`)
- **Border**: Thick Charcoal (`#2D3436`), width `2.5px`
- **Border Radius**: `18px`
- **3D Offset Shadow (Flat Drop Shadow)**:
  - Instead of standard blur shadows, use a flat drop shadow shifted bottom-right.
  - **CSS equivalent**: `box-shadow: 4px 4px 0px 0px #2D3436`
  - **React Native equivalent**: `shadowOffset: { width: 4, height: 4 }, shadowOpacity: 0.35, shadowRadius: 0`

### 2. Nested / Inner Cards
For sub-items or lists nested inside a parent card:
- **Background**: Page Cream (`#F5F0E8`)
- **Border**: Charcoal (`#2D3436`), width `2px`
- **Border Radius**: `14px`
- **Offset Shadow**: `box-shadow: 3px 3px 0px 0px #2D3436`

### 3. Primary Buttons (Peach/Salmon)
- **Background**: Peach/Salmon (`#E8C4B8`)
- **Border**: Thick Charcoal (`#2D3436`), width `2.5px`
- **Border Radius**: `14px`
- **Offset Shadow**: `box-shadow: 3px 3px 0px 0px #2D3436`
- **Hover/Pressed state**: Background shifts to `#D4A494`, drop shadow offset reduces to `1px 1px 0px 0px` for a pressed feel.

### 4. Secondary/Outline Buttons
- **Background**: Light Cream (`#FAF8F3`)
- **Border**: Thick Charcoal (`#2D3436`), width `2.5px`
- **Border Radius**: `14px`
- **Offset Shadow**: `box-shadow: 3px 3px 0px 0px #2D3436`

### 5. Tag Badges / Pills
- **Background**: Peach Light (`#F0D5CB`)
- **Border**: Charcoal (`#2D3436`), width `1.5px`
- **Border Radius**: `20px`

---

## 🏗️ Tailwind / CSS Utility Variables

When implementing this theme on a website, inject these custom tokens into your configuration:

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        cream: {
          DEFAULT: '#F5F0E8', // Page Background
          light: '#FAF8F3',   // Card Background
          dark: '#EDE7DB',    // Pressed/Hover
        },
        charcoal: {
          DEFAULT: '#2D3436', // Borders & Primary Headings
          soft: '#4A4E50',    // Paragraph text
        },
        peach: {
          DEFAULT: '#E8C4B8', // Primary Accent
          light: '#F0D5CB',   // Fills & tags
          dark: '#D4A494',    // Pressed primary
          soft: 'rgba(232, 196, 184, 0.18)',
        },
        muted: '#7A7A6E',
      },
      boxShadow: {
        'sketch': '4px 4px 0px 0px #2D3436',
        'sketch-inner': '3px 3px 0px 0px #2D3436',
        'sketch-active': '1px 1px 0px 0px #2D3436',
      },
      borderWidth: {
        '3': '2.5px',
      }
    }
  }
}
```

---

## 💻 Sample Web Element Recipes

### Card Markup Example:
```html
<div class="bg-cream-light border-3 border-charcoal rounded-[18px] shadow-sketch p-5">
  <span class="text-[10px] font-extrabold tracking-widest text-muted uppercase">Intake Tracker</span>
  <h2 class="text-xl font-black text-charcoal mt-1">Goal Status</h2>
  <button class="w-full bg-peach border-3 border-charcoal rounded-[14px] shadow-sketch-inner hover:shadow-sketch-active active:translate-x-[2px] active:translate-y-[2px] py-3 text-sm font-bold text-charcoal mt-4">
    LOG INTAKE
  </button>
</div>
```
