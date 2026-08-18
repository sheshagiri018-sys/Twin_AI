# UniTwin AI — Website

An AI-driven, self-learning Digital Twin platform website for predictive monitoring and maintenance of machines. Built as a static, dependency-free site (HTML/CSS/JS) — ready for GitHub Pages.

## Structure🚩
```
index.html       → all page sections (hero, architecture, digital twin, dashboard, hardware, etc.)
styles.css        → design tokens, section styles, custom cursor, 3D-mount/overlay styles
script.js         → canvas/SVG animations, interactive architecture diagram, digital twin
                    simulation, live dashboard charts, alerts, anomaly simulation, custom
                    cursor, loader sequence, GSAP ScrollTrigger reveals
three-scene.js    → Three.js layer: procedural 3D industrial motor, cinematic hero scene
                    with sensor markers, interactive Digital Twin scene (drag-rotate,
                    wheel-zoom, exploded view, live reactivity to sensor data)
assets/
  prototype.png   → uploaded breadboard prototype photo
```

## 3D / cinematic upgrade👾
- **Hero**: a procedurally built 3D industrial motor (Three.js, no external model files) with
  ambient rotation, cursor-driven camera parallax, a lightweight particle field, and live
  sensor markers (Temperature, Current, Voltage, Vibration, Humidity) projected onto the
  model in screen space.
- **Digital Twin**: the same motor rendered in an interactive scene — drag to rotate, scroll
  to zoom, "Exploded View" separates the housing/shaft/bearing/fan/base with a GSAP
  animation, and the model reacts live to the simulation sliders (shaft speed ← current,
  jitter ← vibration, aura color ← health/status).
- **Simulate Anomaly**: a one-click demonstration that ramps vibration/temperature up,
  narrates AI analysis steps ("ABNORMAL VIBRATION PATTERN IDENTIFIED", etc.), reduces the
  health score, triggers the alert console, then decays back to normal. Simulation only —
  no claims are made about real model accuracy.
- **Scroll storytelling**: GSAP ScrollTrigger draws the system-architecture connector line in
  as you scroll into that section, and staggers the solution-flow steps in from alternating
  sides.
- **Custom cursor**: a small dot + trailing ring on desktop, auto-disabled on touch devices
  and when `prefers-reduced-motion: reduce` is set.
- **Loading sequence**: "INITIALIZING UNITWIN AI → LOADING DIGITAL TWIN → CONNECTING SENSOR
  LAYER → INITIALIZING AI ENGINE → SYSTEM READY" with a real progress bar.
- **Automatic fallback**: if WebGL isn't available (or fails to init), `three-scene.js` adds a
  `no-webgl` class to `<body>` which hides the 3D mounts entirely — the original 2D canvas /
  SVG digital twin and architecture diagram (already in the DOM) take over seamlessly, so the
  site never shows a broken canvas.
- **Performance**: pixel ratio is capped (1.5–2×), particle counts are reduced under 760px
  viewports, and all 3D animation loops respect `prefers-reduced-motion`.
- Three.js and GSAP (+ ScrollTrigger) are loaded from the cdnjs CDN — no build step, no
  `node_modules`, works as a plain static site on GitHub Pages.

## Run locally
No build step needed. Just open `index.html` in a browser, or serve the folder:
```
npx serve .
```

## Deploy on GitHub Pages⭐
1. Push this repo to GitHub.
2. Repo Settings → Pages → Source: `main` branch, `/ (root)`.
3. Your site will be live at `https://<username>.github.io/<repo>/`.

## Notes
- All dashboard/sensor readings are **simulated prototype data**, clearly labeled in the UI.
- The Digital Twin section includes interactive sliders (Temperature, Current, Voltage,
  Vibration, Humidity) that drive the health score, twin visualization, dashboard, charts,
  and alert console in real time.
- The System Architecture section is fully interactive (hover for tooltips) and includes a
  full-screen zoom/pan mode via "Open Full System Architecture".
- Replace `assets/prototype.png` with your own hardware photos as needed — just keep the
  same filename or update the `<img>` src in `index.html`.
