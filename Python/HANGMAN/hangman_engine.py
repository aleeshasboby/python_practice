"""
Hangman Engine - Core Game Logic & Categories
Preserves and expands upon the original hangman.py code.
"""

import random
from typing import Dict, List, Optional, Tuple

# Original ASCII stages from hangman.py (ordered from 0 lives / game over to full lives)
STAGES = [
    r"""
    +----+
     |   |
     o   |
    /|\  |
    / \  |
         |
    =========
    """,
    r"""
    +----+
     |   |
     o   |
    /|\  |
    /    |
         |
    =========
    """,
    r"""
    +----+
     |   |
     o   |
    /|\  |
         |
         |
    =========
    """,
    r"""
    +----+
     |   |
     o   |
    /|   |
         |
         |
    =========
    """,
    r"""
    +----+
     |   |
     o   |
     |   |
         |
         |
    =========
    """,
    r"""
    +----+
     |   |
     o   |
         |
         |
         |
    =========
    """,
    r"""
    +----+
     |   |
         |
         |
         |
         |
    =========
    """,
    r"""
    +----+
     |   |
         |
         |
         |
         |
    =========
    """
]

# Word categories with hints
CATEGORIES: Dict[str, Dict[str, str]] = {
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
}


class HangmanGame:
    def __init__(self):
        self.chosen_word: str = ""
        self.category: str = "Original Cast"
        self.hint: str = ""
        self.correct_letters: List[str] = []
        self.incorrect_letters: List[str] = []
        self.max_lives: int = 7
        self.lives: int = 7
        self.game_over: bool = False
        self.won: bool = False
        self.score: int = 0
        self.streak: int = 0
        self.max_hints: int = 2
        self.hints_used: int = 0

    def new_game(self, category: str = "Original Cast", difficulty: str = "medium", custom_word: Optional[str] = None) -> Dict:
        """Initialize a new game round."""
        self.category = category if category in CATEGORIES or custom_word else "Original Cast"
        
        # Difficulty configuration
        if difficulty == "easy":
            self.max_lives = 7
            self.lives = 7
        elif difficulty == "hard":
            self.max_lives = 5
            self.lives = 5
        else: # medium
            self.max_lives = 7
            self.lives = 7

        if custom_word and custom_word.strip().isalpha():
            self.chosen_word = custom_word.strip().lower()
            self.hint = "Custom challenge word"
            self.category = "Custom Challenge"
        else:
            words = CATEGORIES.get(self.category, CATEGORIES["Original Cast"])
            self.chosen_word = random.choice(list(words.keys()))
            self.hint = words.get(self.chosen_word, "Mystery word")

        self.correct_letters = []
        self.incorrect_letters = []
        self.game_over = False
        self.won = False
        self.hints_used = 0

        # Auto-reveal a letter for easy mode if word is long enough
        if difficulty == "easy" and len(self.chosen_word) >= 5:
            reveal = random.choice([c for c in self.chosen_word if c in "aeiou"] or list(self.chosen_word))
            self.correct_letters.append(reveal)

        return self.get_state()

    def guess(self, letter: str) -> Dict:
        """Process a letter guess."""
        if self.game_over:
            return self.get_state()

        letter = letter.lower().strip()
        if not letter or len(letter) != 1 or not letter.isalpha():
            return self.get_state(error="Please guess a valid single letter A-Z.")

        if letter in self.correct_letters or letter in self.incorrect_letters:
            return self.get_state(error=f"You already guessed '{letter.upper()}'.")

        if letter in self.chosen_word:
            self.correct_letters.append(letter)
            # Check win condition
            if all(ch in self.correct_letters for ch in self.chosen_word):
                self.won = True
                self.game_over = True
                self.streak += 1
                base_points = 100 * len(set(self.chosen_word))
                life_bonus = self.lives * 25
                self.score += base_points + life_bonus
        else:
            self.incorrect_letters.append(letter)
            self.lives -= 1
            if self.lives <= 0:
                self.lives = 0
                self.game_over = True
                self.won = False
                self.streak = 0

        return self.get_state()

    def get_hint(self) -> Dict:
        """Provide a hint for the current word (maximum 2 hints per round)."""
        if self.game_over:
            return self.get_state()

        if self.hints_used >= self.max_hints:
            state = self.get_state(error="No hints remaining! Maximum of 2 hints per round reached.")
            state["hint_text"] = "⚠️ No hints remaining for this round!"
            return state

        self.hints_used += 1
        revealed_letter = None
        hint_msg = ""

        if self.hints_used == 1:
            # Hint 1 of 2: Word definition / clue
            hint_msg = f"💡 Clue (Hint 1/2): {self.hint}"
        elif self.hints_used == 2:
            # Hint 2 of 2: Reveal an unguessed letter
            unguessed = [ch for ch in self.chosen_word if ch not in self.correct_letters]
            if unguessed:
                revealed_letter = random.choice(unguessed)
                self.correct_letters.append(revealed_letter)
                hint_msg = f"💡 Letter Reveal (Hint 2/2): '{revealed_letter.upper()}' is in the word!"
                if all(ch in self.correct_letters for ch in self.chosen_word):
                    self.won = True
                    self.game_over = True
                    self.streak += 1
            else:
                hint_msg = f"💡 Clue (Hint 2/2): {self.hint}"

        state = self.get_state()
        state["hint_text"] = hint_msg
        if revealed_letter:
            state["revealed_letter"] = revealed_letter
        return state

    def get_ascii_stage(self) -> str:
        """Returns the corresponding ASCII stage matching original hangman.py logic."""
        index = max(0, min(len(STAGES) - 1, self.lives))
        return STAGES[index]

    def get_display_word(self) -> str:
        """Returns the word with masked unguessed letters."""
        return "".join([ch if ch in self.correct_letters else "_" for ch in self.chosen_word])

    def get_state(self, error: Optional[str] = None) -> Dict:
        """Export current game state as a clean dictionary."""
        display = [ch if ch in self.correct_letters else "_" for ch in self.chosen_word]
        
        full_word = self.chosen_word if self.game_over else None
        hints_remaining = max(0, self.max_hints - self.hints_used)

        return {
            "display": display,
            "display_str": " ".join(display),
            "word_length": len(self.chosen_word),
            "lives": self.lives,
            "max_lives": self.max_lives,
            "mistakes": len(self.incorrect_letters),
            "correct_letters": self.correct_letters,
            "incorrect_letters": self.incorrect_letters,
            "game_over": self.game_over,
            "won": self.won,
            "category": self.category,
            "ascii_stage": self.get_ascii_stage(),
            "ascii_stage_index": max(0, min(len(STAGES) - 1, self.lives)),
            "score": self.score,
            "streak": self.streak,
            "hint": self.hint if self.hints_used > 0 else None,
            "hints_used": self.hints_used,
            "max_hints": self.max_hints,
            "hints_remaining": hints_remaining,
            "revealed_word": full_word,
            "error": error
        }
