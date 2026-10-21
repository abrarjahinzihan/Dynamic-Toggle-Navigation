# NexusNav | Dynamic Toggle Navigation System

A modern, responsive, and accessible **Dynamic Toggle Navigation** system built with semantic HTML5, **Tailwind CSS v3**, custom animations, and modern JavaScript.

An enterprise-ready, accessible, framework-agnostic navigation architecture engineered for modern web applications, dashboards, and landing pages.

---

## 🌟 Key Architecture & Capabilities

| Capability | Implementation Details |
| :--- | :--- |
| **Interactive Navigation Menu with Open/Close Toggle Animations** | Fluid hamburger-to-X 3-bar morphing animation with spring easing (`cubic-bezier(0.68, -0.6, 0.32, 1.6)`). Smooth off-canvas mobile drawer with backdrop blur overlay and staggered item animations. |
| **Mobile-Friendly Responsive Navigation** | Seamless transition between desktop pill navigation and mobile drawer at the 768px breakpoint. Includes body scroll lock (`body.lock-scroll`), touch outside / backdrop click closing, and `Escape` key support. |
| **Interactive Links & Buttons with Smooth Hover/Active States** | Dynamic hardware-accelerated sliding indicator pill (`.nav-active-pill`) tracking hover and active items with real-time coordinate calculation. Gradient buttons with glowing hover effects and interactive dropdown submenus. |
| **Scrollspy & Sticky Compact Navbar** | Throttled scroll listener that detects viewport sections, auto-highlights navigation items, and smoothly compacts the navbar header on scroll. |
| **Dark & Light Mode Themes** | Smooth CSS custom properties transition with persistent user preference in `localStorage`. |
| **Live DOM & Event Inspector Console** | Real-time terminal on the page displaying every triggered event (`click`, `scroll`, `keydown`, `resize`, `mutation`) and live state variables for easy demonstration and debugging. |

---

## 🛠️ Core Engineering Architecture

1. **High-Performance Event Engine**:
   - `click`: Hamburger button, drawer close, backdrop, links, dropdowns, theme toggles, sandbox controls.
   - `scroll`: Throttled scroll listener for sticky navbar compacting and scrollspy section tracking.
   - `keydown`: Accessibility listener for `Escape` (27) to close open drawers or dropdowns.
   - `resize`: Viewport listener that automatically closes the mobile drawer and re-aligns pill positions if screen expands past mobile breakpoint.
   - `mouseenter` / `mouseleave`: Dynamic tracking for sliding indicator pill animations.

2. **GPU-Accelerated Transitions & Animations**:
   - Hardware-accelerated `transform` and `opacity` properties ensuring smooth 60 FPS performance.
   - Custom `cubic-bezier` timing curves for springy morphing and smooth easing.
   - Staggered `transition-delay` on drawer list items (`--stagger-index`).
   - CSS Grid 0fr-to-1fr transition for the mobile accordion submenu.

3. **Adaptive Responsive Layouts**:
   - Mobile-first and desktop-adaptive layout without layout thrashing or overflow glitches.
   - Off-canvas drawer sliding from right with `backdrop-filter: blur(8px)`.
   - Prevent background page scrolling when drawer is open.

4. **DOM Synchronization & State Engine**:
   - Class toggling (`.is-active`, `.is-open`, `.scrolled`, `.lock-scroll`).
   - Accessibility ARIA attribute management (`aria-expanded`, `aria-hidden`).
   - Element dimension and coordinate calculation (`getBoundingClientRect`).

---

## 🚀 How to Run Locally

You can run this project using any local static file server or directly open `index.html` in your web browser:

### Option 1: Python HTTP Server (Recommended)
```bash
python -m http.server 3000
```
Then open [http://localhost:3000](http://localhost:3000) in your browser.

### Option 2: Node.js (npx serve)
```bash
npx serve .
```

### Option 3: Direct Browser Launch
Double click `index.html` in your file explorer to open it directly in Chrome, Edge, Firefox, or Safari.

---

## 📁 File Structure

```
├── index.html       # Semantic HTML5 markup, Tailwind CSS v3 utility classes, header, drawer & demo
├── script.js        # Event engine, DOM manipulation, sliding pill, scrollspy & state engine
└── README.md        # Project documentation and specifications
```
