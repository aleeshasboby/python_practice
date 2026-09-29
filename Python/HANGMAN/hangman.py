"""
Hangman Game - Classic Terminal & Reactive Web Launcher
Original game logic with expanded Reactive Web App support.
"""

import random
import sys
import webbrowser

stages = [
    '''
    +----+
     |   |
     o   |
    /|\\  |
    / \\  |
         |
    ========= 
        ''',
    '''
    +----+
     |   |
     o   |
    /|\\  |
    /    |
         |
    ========= 
        ''',
    '''
    +----+
     |   |
     o   |
    /|\\  |
         |
         |
    ========= 
        ''',
    '''
    +----+
     |   |
     o   |
    /|   |
         |
         |
    ========= 
        ''',
    '''
    +----+
     |   |
     o   |
     |   |
         |
         |
    ========= 
        ''',
    '''
    +----+
     |   |
     o   |
         |
         |
         |
    ========= 
        ''',
    '''
    +----+
     |   |
         |
         |
         |
         |
    ========= 
        ''',
    '''
    +----+
     |   |
         |
         |
         |
         |
    ========= 
        '''
]

word_list = ["shuraka", "tei", "jooha", "dooshik", "luke", "andrew"]


def play_terminal():
    """Classic terminal game loop with the original hangman code."""
    chosen_word = random.choice(word_list)
    print("\n--- HANGMAN TERMINAL EDITION ---")
    correct_letters = []
    lives = 7

    for letter in chosen_word:
        print("-", end="")
    print()

    gameover = False

    while not gameover:
        guess = input("\nguess the letter : ").strip().lower()
        if not guess or len(guess) != 1 or not guess.isalpha():
            print("Please enter a single valid letter (a-z).")
            continue

        display = ""
        for letter in chosen_word:
            if letter == guess:
                display += letter
                correct_letters.append(letter)
            elif letter in correct_letters:
                display += letter
            else:
                display += "-"
        print(display)

        if guess not in chosen_word:
            print(stages[lives])
            lives -= 1
            if lives == -1:
                gameover = True
                print(f"\nYou lose! The word was: {chosen_word.upper()}")
        if "-" not in display:
            gameover = True
            print(f"\nYou win! Congratulations on solving: {chosen_word.upper()}")
    print("\nThanks for playing!\n")


def launch_web():
    """Launch the reactive web server and open the browser."""
    import app
    print("\n" + "=" * 55)
    print("   Launching Hangman Reactive Web Frontend...")
    print("   Opening: http://localhost:8000")
    print("  Press Ctrl+C in terminal anytime to stop the server.")
    print("=" * 55 + "\n")
    try:
        webbrowser.open("http://localhost:8000")
    except Exception:
        pass
    app.run_server(8000)


if __name__ == "__main__":
    if "--cli" in sys.argv:
        play_terminal()
    elif "--web" in sys.argv:
        launch_web()
    else:
        print("\n" + "=" * 50)
        print("            HANGMAN ARCADE  ")
        print("=" * 50)
        print(" [1]  Launch Reactive Web App (Browser + Audio + UI)")
        print(" [2]  Play Classic Terminal Game")
        print("=" * 50)
        choice = input(" Choose mode (1 or 2, default is 1): ").strip()

        if choice == "2":
            play_terminal()
        else:
            launch_web()