# 🎮 Hangman // Cyber Arcade Edition

A modern, reactive Hangman game built with Python and a high-performance, responsive web frontend. Preserves and elevates the original `hangman.py` code with visual vector animations, retro CRT ASCII mode, synthesized sound effects, custom word challenges, and player statistics.

---

## ⚡ Quick Start

### 1. Launch the Reactive Web Game (Recommended)
Run the Python server (no external `pip` dependencies needed — uses Python's standard library):

```bash
python3 app.py
```
Or run the interactive launcher:
```bash
python3 hangman.py
```

Then open your browser to **[http://localhost:8000](http://localhost:8000)**.

> **💡 Offline / Direct Mode:** You can also simply double-click and open `static/index.html` directly in any web browser! The game includes an embedded client-side fallback engine that works 100% offline.

### 2. Play in Classic Terminal Mode
To play directly in your terminal:

```bash
python3 hangman.py --cli
```

---

## 🌟 Key Features

### 🎨 Modern Reactive UI & Design
- **Cyber-Arcade Aesthetic:** Dark cosmic navy palette, glowing neon accents, and backdrop glassmorphism cards.
- **Dual Visualizer:**
  - **Vector SVG Mode:** Dynamically animates the gallows, rope, head, torso, arms, and legs as mistakes are made.
  - **Retro CRT ASCII Mode:** Toggles a vintage CRT green-phosphor monitor displaying the exact ASCII art stages from lines 2–66 of `hangman.py`.
- **Flip-in Word Slots:** Letter reveal animations with pop and screen shake on incorrect guesses.
- **Interactive Virtual Keyboard:** QWERTY tactile keys with live color-coded feedback (emerald green for correct, muted dark for incorrect). Full physical keyboard typing support (A–Z) is also supported.
- **Health & Lives System:** 7 heart badges and a gradient health bar tracking remaining chances.

### 🔊 Zero-Dependency Web Audio Effects
Built directly using the native **Web Audio API** (no external audio files required):
- Soft typewriter key clicks.
- Uplifting dual-tone chime on correct letter.
- Low buzz on mistake.
- Triumphant 4-note ascending fanfare on victory.
- Descending minor tones on game over.
- One-click mute/unmute toggle.

### 📚 Word Categories & Custom Challenges
- **Original Cast:** The classic character names from `hangman.py` (`shuraka`, `tei`, `jooha`, `dooshik`, `luke`, `andrew`).
- **Tech & Coding:** `python`, `algorithm`, `frontend`, `reactive`, `backend`, `database`, etc.
- **World Animals:** `elephant`, `penguin`, `kangaroo`, `cheetah`, `chameleon`, etc.
- **Movies & Pop Culture:** `matrix`, `inception`, `avatar`, `pokemon`, `skyrim`, etc.
- **Space & Science:** `galaxy`, `nebula`, `gravity`, `telescope`, `supernova`, etc.
- **🎯 Challenge a Friend:** Set any secret custom word for a friend to solve!

### 📊 Stats, Streaks & Victory Confetti
- Tracks games played, win rate percentage, current winning streak, and best streak in `localStorage`.
- Full HTML5 Canvas particle confetti burst on victory.

---

## 📁 Project Architecture

```
.
├── app.py                # Standard library Python HTTP server & REST API
├── hangman_engine.py     # Modular game engine, ASCII stages, and categories
├── hangman.py            # Main entrypoint (Launcher for Web or Terminal)
├── static/
│   ├── index.html        # Semantic, accessible HTML5 layout
│   ├── style.css         # Modern design system, CRT scanlines, and animations
│   └── app.js            # Reactive game controller, audio synth, and canvas confetti
└── README.md             # Project documentation
```
