import random
stages=['''
    +----+
     |   |
     o   |
    /|\  |
    / \  |
         |
    ========= 
        ''', '''
    +----+
     |   |
     o   |
    /|\  |
    /    |
         |
    ========= 
        ''', '''
    +----+
     |   |
     o   |
    /|\  |
         |
         |
    ========= 
        ''', '''
    +----+
     |   |
     o   |
    /|   |
         |
         |
    ========= 
        ''', '''
    +----+
     |   |
     o   |
     |   |
         |
         |
    ========= 
        ''', '''
    +----+
     |   |
     o   |
         |
         |
         |
    ========= 
        ''', '''
    +----+
     |   |
         |
         |
         |
         |
    ========= 
        ''', '''
    +----+
     |   |
         |
         |
         |
         |
    ========= 
        ''']

word_list=["shuraka","tei","jooha","dooshik","luke","andrew"]
chosen_word=random.choice(word_list)
print(chosen_word)
correct_letters=[]
lives=6

for letter in chosen_word:
    print("-",end="")

gameover=False

while not gameover:
    guess=input("\nguess the letter :").lower()
    display=""
    for letter in chosen_word:
        if letter == guess:
            display+=letter
            correct_letters.append(letter)
        elif letter in correct_letters:
            display+=letter
        else:
            display+="-"
    print(display)

    if guess not in chosen_word:
        lives-=1
        print(stages[lives+1])
        if lives==0:
            gameover=True
            print("You lose")
    if "-" not in display:
        gameover=True
        print("You win")
print("\n")