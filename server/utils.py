import random
import string

from typing import Any
#from models import Player

def get_random_player_id(length: int = 10) -> str:
    """Generate a random string of letters for a player ID."""
    # Combines uppercase and lowercase letters
    letters = string.ascii_letters
    # Randomly selects letters to create the ID
    player_id = ''.join(random.choice(letters) for i in range(length))
    return player_id

def load_words_from_scowl(dictionary_path: str) -> list[str]:
    # Load words from the SCOWL dataset
    # FR41, FR44, FR47
    words = []
    start_processing = False
    with open(dictionary_path, 'r', encoding='utf8') as file:
        for line in file:
            # Strip newline and other trailing whitespace characters
            line = line.strip()
            if start_processing:
                if line:  # Check if the line is not empty
                    if len(line) > 1 or line.lower() in ['i', 'a']:
                        words.append(line.lower())
            elif line == '---':
                start_processing = True
    return words

def get_player_from_id_dicts(player_list: list[dict[str, Any]], player_id: str) -> Any | None:
    for player in player_list:
        if player['id'] == player_id:
            return player
    return None
