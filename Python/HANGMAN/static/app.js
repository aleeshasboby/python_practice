/**
 * HANGMAN CYBER ARCADE - REACTIVE FRONTEND LOGIC
 * Supports both Live Python REST API Mode and Standalone Offline Mode.
 */

// ==========================================================================
// 1. EMBEDDED WORD PACKS & ORIGINAL HANGMAN.PY DATA (FOR DUAL-MODE / OFFLINE)
// ==========================================================================
const LOCAL_STAGES = [
  `
    +----+
     |   |
     o   |
    /|\\  |
    / \\  |
         |
    =========`,
  `
    +----+
     |   |
     o   |
    /|\\  |
    /    |
         |
    =========`,
  `
    +----+
     |   |
     o   |
    /|\\  |
         |
         |
    =========`,
  `
    +----+
     |   |
     o   |
    /|   |
         |
         |
    =========`,
  `
    +----+
     |   |
     o   |
     |   |
         |
         |
    =========`,
  `
    +----+
     |   |
     o   |
         |
         |
         |
    =========`,
  `
    +----+
     |   |
         |
         |
         |
         |
    =========`,
  `
    +----+
     |   |
         |
         |
         |
         |
    =========`
];

const LOCAL_CATEGORIES = {
  "Original Cast": {
    "shuraka": "Fierce warrior character",
    "tei": "Loyal friend and skilled companion",
    "jooha": "Clever strategist with sharp instincts",
    "dooshik": "Charismatic powerhouse with a heart of gold",
    "luke": "Brave adventurer walking his own path",
    "andrew": "Wise thinker and steadfast ally"
  },
  "Tech & Coding": {
    "python": "High-level programming language named after Monty Python",
    "algorithm": "Step-by-step problem-solving procedure",
    "frontend": "Everything the user directly sees and interacts with",
    "backend": "The server-side engine running behind the scenes",
    "reactive": "UI that updates automatically when data changes",
    "function": "Reusable block of code that performs an action",
    "variable": "Named storage container for holding values",
    "database": "Organized collection of structured data"
  },
  "World Animals": {
    "elephant": "Largest land mammal with an incredible trunk",
    "penguin": "Flightless bird dressed in a natural tuxedo",
    "kangaroo": "Pouched marsupial famed for giant leaps",
    "cheetah": "Fastest land animal on Earth",
    "dolphin": "Playful and highly intelligent marine mammal",
    "chameleon": "Master of camouflage with independently moving eyes",
    "octopus": "Eight-armed sea creature with three hearts",
    "flamingo": "Pink feathered bird that balances on one leg"
  },
  "Movies & Pop Culture": {
    "matrix": "Red pill or blue pill: enter the simulation",
    "inception": "Dreams within dreams inside a heist",
    "avatar": "Alien world of Pandora and giant blue beings",
    "pokemon": "Pocket monsters you gotta catch them all",
    "skyrim": "Dragonborn shouting Fus-Ro-Dah across snowy mountains",
    "pacman": "Classic arcade hero chomping dots and dodging ghosts"
  },
  "Space & Science": {
    "galaxy": "Vast cosmic system of stars, gas, and dark matter",
    "nebula": "Giant interstellar cloud of dust and gas",
    "gravity": "Invisible force pulling masses together",
    "telescope": "Optical instrument peering deep into the cosmos",
    "asteroid": "Rocky remnant floating through the solar system",
    "supernova": "Spectacular catastrophic explosion of a dying star"
  }
};

// ==========================================================================
// 2. SYNTHESIZED SOUND EFFECTS (WEB AUDIO API - ZERO EXTERNAL ASSETS)
// ==========================================================================
class SoundFX {
  constructor() {
    this.ctx = null;
    this.muted = localStorage.getItem("hangman_muted") === "true";
  }

  _init() {
    if (!this.ctx && typeof AudioContext !== "undefined") {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    localStorage.setItem("hangman_muted", this.muted.toString());
    return this.muted;
  }

  playKey() {
    if (this.muted) return;
    this._init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(320, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(160, this.ctx.currentTime + 0.05);
    gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.05);
  }

  playCorrect() {
    if (this.muted) return;
    this._init();
    if (!this.ctx) return;
    const notes = [523.25, 659.25]; // C5, E5
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.08);
      gain.gain.setValueAtTime(0.12, this.ctx.currentTime + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + idx * 0.08 + 0.2);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(this.ctx.currentTime + idx * 0.08);
      osc.stop(this.ctx.currentTime + idx * 0.08 + 0.2);
    });
  }

  playWrong() {
    if (this.muted) return;
    this._init();
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(140, this.ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(80, this.ctx.currentTime + 0.2);
    gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.2);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start();
    osc.stop(this.ctx.currentTime + 0.2);
  }

  playWin() {
    if (this.muted) return;
    this._init();
    if (!this.ctx) return;
    const arpeggio = [440, 554.37, 659.25, 880]; // A4, C#5, E5, A5
    arpeggio.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.1);
      gain.gain.setValueAtTime(0.18, this.ctx.currentTime + idx * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + idx * 0.1 + 0.35);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(this.ctx.currentTime + idx * 0.1);
      osc.stop(this.ctx.currentTime + idx * 0.1 + 0.35);
    });
  }

  playLose() {
    if (this.muted) return;
    this._init();
    if (!this.ctx) return;
    const notes = [280, 240, 200, 160];
    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime + idx * 0.14);
      gain.gain.setValueAtTime(0.15, this.ctx.currentTime + idx * 0.14);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + idx * 0.14 + 0.25);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(this.ctx.currentTime + idx * 0.14);
      osc.stop(this.ctx.currentTime + idx * 0.14 + 0.25);
    });
  }
}

// ==========================================================================
// 3. CONFETTI EFFECT ENGINE (CANVAS)
// ==========================================================================
class ConfettiCannon {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext("2d");
    this.particles = [];
    this.animationId = null;
    this.resize();
    window.addEventListener("resize", () => this.resize());
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  burst(count = 120) {
    const colors = ["#38bdf8", "#818cf8", "#10b981", "#f59e0b", "#ec4899", "#a855f7"];
    for (let i = 0; i < count; i++) {
      this.particles.push({
        x: this.canvas.width / 2 + (Math.random() - 0.5) * 200,
        y: this.canvas.height / 2 + (Math.random() - 0.5) * 100,
        vx: (Math.random() - 0.5) * 16,
        vy: (Math.random() - 1.5) * 14,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        vr: (Math.random() - 0.5) * 10,
        alpha: 1,
        decay: Math.random() * 0.015 + 0.01
      });
    }

    if (!this.animationId) {
      this.animate();
    }
  }

  animate() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.35; // gravity
      p.rotation += p.vr;
      p.alpha -= p.decay;

      if (p.alpha <= 0 || p.y > this.canvas.height) {
        this.particles.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate((p.rotation * Math.PI) / 180);
      this.ctx.fillStyle = p.color;
      this.ctx.globalAlpha = p.alpha;
      this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      this.ctx.restore();
    }

    if (this.particles.length > 0) {
      this.animationId = requestAnimationFrame(() => this.animate());
    } else {
      this.animationId = null;
    }
  }
}

// ==========================================================================
// 4. MAIN GAME CONTROLLER (REACTIVE APPLICATION)
// ==========================================================================
class HangmanApp {
  constructor() {
    this.sound = new SoundFX();
    this.confetti = new ConfettiCannon("confetti-canvas");

    this.state = {
      display: [],
      display_str: "",
      word_length: 0,
      lives: 7,
      max_lives: 7,
      mistakes: 0,
      correct_letters: [],
      incorrect_letters: [],
      game_over: false,
      won: false,
      category: "Original Cast",
      ascii_stage: "",
      ascii_stage_index: 7,
      score: 0,
      streak: 0,
      hint: null,
      hints_used: 0,
      max_hints: 2,
      hints_remaining: 2,
      revealed_word: null,
      asciiMode: localStorage.getItem("hangman_ascii_mode") === "true",
      isServerMode: false
    };

    // Client-side fallback state
    this.clientSecretWord = "";
    this.clientHint = "";

    // Stats
    this.stats = this.loadStats();

    this.initDOM();
    this.bindEvents();
    this.checkServerOrFallback();
  }

  loadStats() {
    const defaultStats = { played: 0, won: 0, currentStreak: 0, maxStreak: 0 };
    try {
      const saved = localStorage.getItem("hangman_player_stats");
      return saved ? JSON.parse(saved) : defaultStats;
    } catch {
      return defaultStats;
    }
  }

  saveStats() {
    try {
      localStorage.setItem("hangman_player_stats", JSON.stringify(this.stats));
    } catch (e) {
      console.warn("Could not save stats to localStorage", e);
    }
  }

  initDOM() {
    // DOM elements
    this.elements = {
      viewModeBtn: document.getElementById("view-mode-btn"),
      soundBtn: document.getElementById("sound-btn"),
      soundIcon: document.getElementById("sound-icon"),
      statsBtn: document.getElementById("stats-btn"),
      helpBtn: document.getElementById("help-btn"),
      categorySelect: document.getElementById("category-select"),
      hintBtn: document.getElementById("hint-btn"),
      customWordBtn: document.getElementById("custom-word-btn"),
      newGameBtn: document.getElementById("new-game-btn"),
      svgContainer: document.getElementById("svg-stage-container"),
      asciiContainer: document.getElementById("ascii-stage-container"),
      asciiCanvas: document.getElementById("ascii-canvas"),
      hangmanSvg: document.getElementById("hangman-svg"),
      currentCategoryName: document.getElementById("current-category-name"),
      livesCounter: document.getElementById("lives-counter"),
      heartsRow: document.getElementById("hearts-row"),
      healthFill: document.getElementById("health-fill"),
      pillStreak: document.getElementById("pill-streak"),
      pillScore: document.getElementById("pill-score"),
      hintBanner: document.getElementById("hint-banner"),
      hintContent: document.getElementById("hint-content"),
      closeHintBtn: document.getElementById("close-hint-btn"),
      wordLengthHint: document.getElementById("word-length-hint"),
      wordSlots: document.getElementById("word-slots"),
      wrongLettersList: document.getElementById("wrong-letters-list"),
      virtualKeyboard: document.getElementById("virtual-keyboard"),
      
      // Modals
      resultModal: document.getElementById("result-modal"),
      resultTitle: document.getElementById("result-title"),
      resultSubtitle: document.getElementById("result-subtitle"),
      resultBadge: document.getElementById("result-icon-badge"),
      revealedWordText: document.getElementById("revealed-word-text"),
      resScore: document.getElementById("res-score"),
      resMistakes: document.getElementById("res-mistakes"),
      resStreak: document.getElementById("res-streak"),
      modalNextBtn: document.getElementById("modal-next-btn"),
      
      statsModal: document.getElementById("stats-modal"),
      closeStatsBtn: document.getElementById("close-stats-btn"),
      statsPlayed: document.getElementById("stats-played"),
      statsWinRate: document.getElementById("stats-win-rate"),
      statsCurrentStreak: document.getElementById("stats-current-streak"),
      statsMaxStreak: document.getElementById("stats-max-streak"),
      resetStatsBtn: document.getElementById("reset-stats-btn"),
      
      helpModal: document.getElementById("help-modal"),
      closeHelpBtn: document.getElementById("close-help-btn"),
      
      customWordModal: document.getElementById("custom-word-modal"),
      closeCustomBtn: document.getElementById("close-custom-btn"),
      customWordForm: document.getElementById("custom-word-form"),
      customWordInput: document.getElementById("custom-word-input")
    };

    // SVG Hangman Body Parts in order of mistake (1 to 7)
    this.svgParts = [
      document.getElementById("svg-rope"),       // 1st mistake (6 lives left)
      document.getElementById("svg-head"),       // 2nd mistake (5 lives left)
      document.getElementById("svg-torso"),      // 3rd mistake (4 lives left)
      document.getElementById("svg-arm-left"),   // 4th mistake (3 lives left)
      document.getElementById("svg-arm-right"),  // 5th mistake (2 lives left)
      document.getElementById("svg-leg-left"),   // 6th mistake (1 life left)
      document.getElementById("svg-leg-right")   // 7th mistake (0 lives / lost)
    ];

    // Render sound state
    this.updateSoundIcon();

    // Render view mode button state
    this.updateViewModeUI();

    // Render virtual keyboard
    this.renderKeyboard();
  }

  updateSoundIcon() {
    this.elements.soundIcon.textContent = this.sound.muted ? "🔇" : "🔊";
  }

  updateViewModeUI() {
    if (this.state.asciiMode) {
      this.elements.viewModeBtn.classList.add("active");
      this.elements.viewModeBtn.querySelector(".btn-text").textContent = "SVG Mode";
      this.elements.svgContainer.classList.remove("active");
      this.elements.asciiContainer.classList.add("active");
    } else {
      this.elements.viewModeBtn.classList.remove("active");
      this.elements.viewModeBtn.querySelector(".btn-text").textContent = "ASCII Mode";
      this.elements.asciiContainer.classList.remove("active");
      this.elements.svgContainer.classList.add("active");
    }
  }

  bindEvents() {
    // Sound toggle
    this.elements.soundBtn.addEventListener("click", () => {
      this.sound.toggleMute();
      this.updateSoundIcon();
    });

    // View mode toggle
    this.elements.viewModeBtn.addEventListener("click", () => {
      this.state.asciiMode = !this.state.asciiMode;
      localStorage.setItem("hangman_ascii_mode", this.state.asciiMode.toString());
      this.updateViewModeUI();
    });

    // New Game button
    this.elements.newGameBtn.addEventListener("click", () => {
      this.startNewGame(this.elements.categorySelect.value);
    });

    // Category change dropdown
    this.elements.categorySelect.addEventListener("change", (e) => {
      this.startNewGame(e.target.value);
    });

    // Hint button
    this.elements.hintBtn.addEventListener("click", () => this.requestHint());
    this.elements.closeHintBtn.addEventListener("click", () => {
      this.elements.hintBanner.classList.add("hidden");
    });

    // Stats modal
    this.elements.statsBtn.addEventListener("click", () => this.openStatsModal());
    this.elements.closeStatsBtn.addEventListener("click", () => this.elements.statsModal.classList.add("hidden"));
    this.elements.resetStatsBtn.addEventListener("click", () => {
      if (confirm("Are you sure you want to reset all your statistics?")) {
        this.stats = { played: 0, won: 0, currentStreak: 0, maxStreak: 0 };
        this.saveStats();
        this.openStatsModal();
      }
    });

    // Help modal
    this.elements.helpBtn.addEventListener("click", () => this.elements.helpModal.classList.remove("hidden"));
    this.elements.closeHelpBtn.addEventListener("click", () => this.elements.helpModal.classList.add("hidden"));

    // Custom Word Modal
    this.elements.customWordBtn.addEventListener("click", () => {
      this.elements.customWordInput.value = "";
      this.elements.customWordModal.classList.remove("hidden");
      this.elements.customWordInput.focus();
    });
    this.elements.closeCustomBtn.addEventListener("click", () => {
      this.elements.customWordModal.classList.add("hidden");
    });
    this.elements.customWordForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const word = this.elements.customWordInput.value.trim().toLowerCase();
      if (word && /^[a-z]+$/.test(word)) {
        this.elements.customWordModal.classList.add("hidden");
        this.startNewGame("Custom Challenge", word);
      }
    });

    // Next round button in result modal
    this.elements.modalNextBtn.addEventListener("click", () => {
      this.elements.resultModal.classList.add("hidden");
      this.startNewGame(this.elements.categorySelect.value);
    });

    // Close modals when clicking backdrop
    [this.elements.resultModal, this.elements.statsModal, this.elements.helpModal, this.elements.customWordModal].forEach(modal => {
      modal.addEventListener("click", (e) => {
        if (e.target === modal && modal !== this.elements.resultModal) {
          modal.classList.add("hidden");
        }
      });
    });

    // Physical Keyboard Listener
    window.addEventListener("keydown", (e) => {
      // Don't intercept if an input is focused
      if (document.activeElement.tagName === "INPUT" || document.activeElement.tagName === "SELECT") {
        return;
      }

      if (e.key === "Escape") {
        this.elements.statsModal.classList.add("hidden");
        this.elements.helpModal.classList.add("hidden");
        this.elements.customWordModal.classList.add("hidden");
        return;
      }

      if (this.state.game_over && !this.elements.resultModal.classList.contains("hidden")) {
        if (e.key === "Enter" || e.key === " ") {
          this.elements.resultModal.classList.add("hidden");
          this.startNewGame(this.elements.categorySelect.value);
        }
        return;
      }

      const key = e.key.toLowerCase();
      if (/^[a-z]$/.test(key)) {
        this.handleGuess(key);
      }
    });
  }

  renderKeyboard() {
    const layout = [
      ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
      ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
      ["z", "x", "c", "v", "b", "n", "m"]
    ];

    this.elements.virtualKeyboard.innerHTML = "";

    layout.forEach(row => {
      const rowDiv = document.createElement("div");
      rowDiv.className = "keyboard-row";

      row.forEach(char => {
        const btn = document.createElement("button");
        btn.className = "key-btn";
        btn.id = `key-${char}`;
        btn.textContent = char.toUpperCase();
        btn.setAttribute("data-key", char);
        btn.setAttribute("aria-label", `Letter ${char.toUpperCase()}`);

        btn.addEventListener("click", () => {
          this.sound.playKey();
          this.handleGuess(char);
        });

        rowDiv.appendChild(btn);
      });

      this.elements.virtualKeyboard.appendChild(rowDiv);
    });
  }

  // ==========================================================================
  // 5. SERVER / OFFLINE HYBRID SYNC
  // ==========================================================================
  async checkServerOrFallback() {
    try {
      const res = await fetch("/api/state", { method: "GET" });
      if (res.ok) {
        this.state.isServerMode = true;
        const data = await res.json();
        this.updateState(data);
        return;
      }
    } catch {
      // Server not accessible (e.g. opened offline / direct html)
    }

    // Fallback to client-side game engine
    this.state.isServerMode = false;
    this.startNewGame("Original Cast");
  }

  async startNewGame(category = "Original Cast", customWord = null) {
    this.elements.hintBanner.classList.add("hidden");

    if (this.state.isServerMode) {
      try {
        const res = await fetch("/api/new-game", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ category, custom_word: customWord })
        });
        if (res.ok) {
          const data = await res.json();
          this.updateState(data);
          return;
        }
      } catch (err) {
        console.warn("API new-game failed, falling back to client mode", err);
        this.state.isServerMode = false;
      }
    }

    // Client-side game engine
    const wordsObj = LOCAL_CATEGORIES[category] || LOCAL_CATEGORIES["Original Cast"];
    if (customWord) {
      this.clientSecretWord = customWord.toLowerCase();
      this.clientHint = "Custom challenge word created by a player";
    } else {
      const keys = Object.keys(wordsObj);
      this.clientSecretWord = keys[Math.floor(Math.random() * keys.length)];
      this.clientHint = wordsObj[this.clientSecretWord] || "Mystery word";
    }

    const state = {
      display: Array(this.clientSecretWord.length).fill("_"),
      display_str: Array(this.clientSecretWord.length).fill("_").join(" "),
      word_length: this.clientSecretWord.length,
      lives: 7,
      max_lives: 7,
      mistakes: 0,
      correct_letters: [],
      incorrect_letters: [],
      game_over: false,
      won: false,
      category: customWord ? "Custom Challenge" : category,
      ascii_stage: LOCAL_STAGES[7],
      ascii_stage_index: 7,
      score: this.state.score,
      streak: this.state.streak,
      hint: null,
      hints_used: 0,
      max_hints: 2,
      hints_remaining: 2,
      revealed_word: null
    };

    this.updateState(state);
  }

  async handleGuess(letter) {
    if (this.state.game_over) return;
    letter = letter.toLowerCase();

    // Ignore if already guessed
    if (this.state.correct_letters.includes(letter) || this.state.incorrect_letters.includes(letter)) {
      return;
    }

    if (this.state.isServerMode) {
      try {
        const res = await fetch("/api/guess", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ letter })
        });
        if (res.ok) {
          const data = await res.json();
          const wasCorrect = data.correct_letters.includes(letter);
          if (wasCorrect) {
            this.sound.playCorrect();
          } else {
            this.sound.playWrong();
            this.triggerScreenShake();
          }
          this.updateState(data);
          return;
        }
      } catch (err) {
        console.warn("API guess failed, switching to client mode", err);
        this.state.isServerMode = false;
      }
    }

    // Client-side guess processing
    const isCorrect = this.clientSecretWord.includes(letter);
    if (isCorrect) {
      this.state.correct_letters.push(letter);
      this.sound.playCorrect();
    } else {
      this.state.incorrect_letters.push(letter);
      this.state.lives = Math.max(0, this.state.lives - 1);
      this.sound.playWrong();
      this.triggerScreenShake();
    }

    this.state.mistakes = this.state.incorrect_letters.length;
    this.state.display = this.clientSecretWord.split("").map(c => this.state.correct_letters.includes(c) ? c : "_");
    this.state.display_str = this.state.display.join(" ");

    // Check game over
    if (this.state.lives <= 0) {
      this.state.game_over = true;
      this.state.won = false;
      this.state.revealed_word = this.clientSecretWord;
      this.state.streak = 0;
    } else if (!this.state.display.includes("_")) {
      this.state.game_over = true;
      this.state.won = true;
      this.state.streak += 1;
      this.state.score += (100 * new Set(this.clientSecretWord).size) + (this.state.lives * 25);
    }

    this.state.ascii_stage_index = Math.max(0, Math.min(LOCAL_STAGES.length - 1, this.state.lives));
    this.state.ascii_stage = LOCAL_STAGES[this.state.ascii_stage_index];

    this.updateState(this.state);
  }

  async requestHint() {
    if (this.state.game_over) return;

    const remaining = this.state.hints_remaining !== undefined 
      ? this.state.hints_remaining 
      : Math.max(0, 2 - (this.state.hints_used || 0));

    if (remaining <= 0) {
      this.elements.hintContent.textContent = "⚠️ No hints remaining! Maximum of 2 hints per round reached.";
      this.elements.hintBanner.classList.remove("hidden");
      this.elements.hintBtn.disabled = true;
      this.elements.hintBtn.classList.add("disabled");
      return;
    }

    if (this.state.isServerMode) {
      try {
        const res = await fetch("/api/hint", { method: "POST" });
        if (res.ok) {
          const data = await res.json();
          this.updateState(data);
          if (data.hint_text || data.hint) {
            this.elements.hintContent.textContent = data.hint_text || data.hint;
            this.elements.hintBanner.classList.remove("hidden");
          }
          return;
        }
      } catch (err) {
        console.warn("API hint failed, using local fallback", err);
      }
    }

    // Client-side fallback hint (strictly 2 hints limit)
    this.state.hints_used = (this.state.hints_used || 0) + 1;
    this.state.hints_remaining = Math.max(0, 2 - this.state.hints_used);

    let hintMsg = "";
    if (this.state.hints_used === 1) {
      // Hint 1: Clue
      hintMsg = `💡 Clue (Hint 1/2): ${this.clientHint || "Think about the category!"}`;
    } else if (this.state.hints_used === 2) {
      // Hint 2: Letter Reveal
      const unguessed = this.clientSecretWord.split("").filter(c => !this.state.correct_letters.includes(c));
      if (unguessed.length > 0) {
        const revealed = unguessed[Math.floor(Math.random() * unguessed.length)];
        this.state.correct_letters.push(revealed);
        hintMsg = `💡 Letter Reveal (Hint 2/2): '${revealed.toUpperCase()}' is in the word!`;

        // Update display
        this.state.display = this.clientSecretWord.split("").map(c => this.state.correct_letters.includes(c) ? c : "_");
        this.state.display_str = this.state.display.join(" ");

        if (!this.state.display.includes("_")) {
          this.state.game_over = true;
          this.state.won = true;
          this.state.streak += 1;
          this.state.score += (100 * new Set(this.clientSecretWord).size) + (this.state.lives * 25);
        }
      } else {
        hintMsg = `💡 Clue (Hint 2/2): ${this.clientHint || "All letters solved!"}`;
      }
    }

    this.elements.hintContent.textContent = hintMsg;
    this.elements.hintBanner.classList.remove("hidden");
    this.updateState(this.state);
  }

  triggerScreenShake() {
    const playPanel = document.querySelector(".play-panel");
    playPanel.classList.remove("shake");
    void playPanel.offsetWidth; // trigger reflow
    playPanel.classList.add("shake");
  }

  // ==========================================================================
  // 6. REACTIVE UI RENDERER
  // ==========================================================================
  updateState(newState) {
    this.state = { ...this.state, ...newState };

    // 1. Category and Word Length
    this.elements.currentCategoryName.textContent = this.state.category;
    this.elements.wordLengthHint.textContent = `${this.state.word_length} letters`;

    // 2. Word Letter Slots
    this.renderWordSlots();

    // 3. Lives, Hearts & Health Bar
    this.renderLivesAndHealth();

    // 4. Hangman Stages (SVG & ASCII)
    this.renderHangmanStage();

    // 5. Wrong Letters Strip
    this.renderWrongLetters();

    // 6. Virtual Keyboard Key States
    this.updateKeyboardStates();

    // 7. Streak & Score
    this.elements.pillStreak.textContent = `${this.state.streak} 🔥`;
    this.elements.pillScore.textContent = this.state.score;

    // 8. Hint Button & Remaining Hints Counter (Max 2)
    const hintsLeft = this.state.hints_remaining !== undefined 
      ? this.state.hints_remaining 
      : Math.max(0, 2 - (this.state.hints_used || 0));

    const hintBtnText = document.getElementById("hint-btn-text");
    if (hintBtnText) {
      hintBtnText.textContent = `Hint (${hintsLeft})`;
    } else {
      this.elements.hintBtn.innerHTML = `<span class="btn-icon">💡</span> Hint (${hintsLeft})`;
    }

    if (hintsLeft <= 0 || this.state.game_over) {
      this.elements.hintBtn.disabled = true;
      this.elements.hintBtn.classList.add("disabled");
    } else {
      this.elements.hintBtn.disabled = false;
      this.elements.hintBtn.classList.remove("disabled");
    }

    // 9. Game Over / Win Modal handling
    if (this.state.game_over) {
      this.handleGameOver();
    }
  }

  renderWordSlots() {
    this.elements.wordSlots.innerHTML = "";
    this.state.display.forEach((letter) => {
      const slot = document.createElement("div");
      slot.className = "letter-slot";
      if (letter !== "_") {
        slot.classList.add("filled");
        slot.textContent = letter;
      }
      this.elements.wordSlots.appendChild(slot);
    });
  }

  renderLivesAndHealth() {
    this.elements.livesCounter.textContent = `${this.state.lives} / ${this.state.max_lives}`;

    // Hearts
    this.elements.heartsRow.innerHTML = "";
    for (let i = 0; i < this.state.max_lives; i++) {
      const heart = document.createElement("span");
      heart.className = `heart-badge ${i >= this.state.lives ? "lost" : ""}`;
      heart.textContent = "❤️";
      this.elements.heartsRow.appendChild(heart);
    }

    // Health Fill Bar
    const healthPercent = Math.max(0, Math.min(100, (this.state.lives / this.state.max_lives) * 100));
    this.elements.healthFill.style.width = `${healthPercent}%`;
  }

  renderHangmanStage() {
    // A. SVG Hangman
    // 7 mistakes = 0 lives. mistakes count goes from 0 up to 7
    const mistakesCount = this.state.max_lives - this.state.lives;

    this.svgParts.forEach((part, index) => {
      if (!part) return;
      if (index < mistakesCount) {
        part.classList.remove("hidden");
      } else {
        part.classList.add("hidden");
      }
    });

    if (this.state.lives <= 1) {
      this.elements.hangmanSvg.classList.add("danger");
    } else {
      this.elements.hangmanSvg.classList.remove("danger");
    }

    // B. Retro ASCII CRT Monitor
    const stageAscii = this.state.ascii_stage || LOCAL_STAGES[Math.max(0, Math.min(LOCAL_STAGES.length - 1, this.state.lives))];
    this.elements.asciiCanvas.textContent = stageAscii;
  }

  renderWrongLetters() {
    if (this.state.incorrect_letters.length === 0) {
      this.elements.wrongLettersList.innerHTML = `<span class="no-wrong-text">None yet — keep going!</span>`;
      return;
    }

    this.elements.wrongLettersList.innerHTML = "";
    this.state.incorrect_letters.forEach(letter => {
      const tag = document.createElement("span");
      tag.className = "wrong-tag";
      tag.textContent = letter.toUpperCase();
      this.elements.wrongLettersList.appendChild(tag);
    });
  }

  updateKeyboardStates() {
    const alphabet = "abcdefghijklmnopqrstuvwxyz".split("");
    alphabet.forEach(char => {
      const keyBtn = document.getElementById(`key-${char}`);
      if (!keyBtn) return;

      if (this.state.correct_letters.includes(char)) {
        keyBtn.className = "key-btn correct";
        keyBtn.disabled = true;
      } else if (this.state.incorrect_letters.includes(char)) {
        keyBtn.className = "key-btn incorrect";
        keyBtn.disabled = true;
      } else {
        keyBtn.className = "key-btn";
        keyBtn.disabled = this.state.game_over;
      }
    });
  }

  // ==========================================================================
  // 7. GAME OVER CELEBRATION & STATS TRACKING
  // ==========================================================================
  handleGameOver() {
    // Update player stats
    this.stats.played += 1;
    if (this.state.won) {
      this.stats.won += 1;
      this.stats.currentStreak += 1;
      if (this.stats.currentStreak > this.stats.maxStreak) {
        this.stats.maxStreak = this.stats.currentStreak;
      }
    } else {
      this.stats.currentStreak = 0;
    }
    this.saveStats();

    setTimeout(() => {
      if (this.state.won) {
        this.sound.playWin();
        this.confetti.burst(140);
        this.elements.resultBadge.className = "result-badge win";
        this.elements.resultBadge.textContent = "🏆";
        this.elements.resultTitle.textContent = "VICTORY!";
        this.elements.resultTitle.style.color = "var(--success)";
        this.elements.resultSubtitle.textContent = "Outstanding deduction! You saved the hangman!";
      } else {
        this.sound.playLose();
        this.elements.resultBadge.className = "result-badge lose";
        this.elements.resultBadge.textContent = "💀";
        this.elements.resultTitle.textContent = "GAME OVER";
        this.elements.resultTitle.style.color = "var(--danger)";
        this.elements.resultSubtitle.textContent = "Better luck next round! Don't give up!";
      }

      const revealed = (this.state.revealed_word || this.clientSecretWord || "").toUpperCase();
      this.elements.revealedWordText.textContent = revealed;

      this.elements.resScore.textContent = this.state.score;
      this.elements.resMistakes.textContent = this.state.incorrect_letters.length;
      this.elements.resStreak.textContent = `${this.state.streak} 🔥`;

      this.elements.resultModal.classList.remove("hidden");
    }, 450);
  }

  openStatsModal() {
    const winRate = this.stats.played > 0 ? Math.round((this.stats.won / this.stats.played) * 100) : 0;
    this.elements.statsPlayed.textContent = this.stats.played;
    this.elements.statsWinRate.textContent = `${winRate}%`;
    this.elements.statsCurrentStreak.textContent = this.stats.currentStreak;
    this.elements.statsMaxStreak.textContent = this.stats.maxStreak;
    this.elements.statsModal.classList.remove("hidden");
  }
}

// Start application when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  window.hangmanApp = new HangmanApp();
});
