# TODO: The bot needs to see what happens on other players' turns too, so it can remember which words were played!

class Bot:
    def __init__(self, difficulty):
        self.difficulty = difficulty
        self.words = self.load_words()
        self.words_already_played

    def load_words(self):
        # Map difficulty to file name
        file_map = {
            'easy': 'easy_words.txt',
            'medium': 'medium_words.txt',
            'hard': 'hard_words.txt'
        }
        file_name = file_map.get(self.difficulty)

        # Load words from the corresponding file
        if file_name:
            try:
                with open(file_name, 'r') as file:
                    return [line.strip() for line in file.readlines()]
            except FileNotFoundError:
                print(f"File {file_name} not found. Please check the file path and name.")
                return []
        else:
            print(f"Invalid difficulty level: {self.difficulty}. Please choose from 'easy', 'medium', or 'hard'.")
            return []

    def action(self, game_state):
        # Placeholder for bot's move logic based on game state
        # This should be implemented based on your game's rules and mechanics

        # Example move (you'll need to replace this with your own logic)
        move = 'Example move based on game state and available words'
        return move
