import random
import string

def get_random_player_id(length: int = 10) -> str:
    """Generate a random string of letters for a player ID."""
    # Combines uppercase and lowercase letters
    letters = string.ascii_letters
    # Randomly selects letters to create the ID
    player_id = ''.join(random.choice(letters) for i in range(length))
    return player_id

def load_words_from_scowl(dictionary_path: str) -> None:
    # Load words from the SCOWL dataset
    words = []
    start_processing = False
    with open(dictionary_path, 'r', encoding='utf8') as file:
        for line in file:
            # Strip newline and other trailing whitespace characters
            line = line.strip()
            if start_processing:
                if line:  # Check if the line is not empty
                    words.append(line)
            elif line == '---':
                start_processing = True
    return words
