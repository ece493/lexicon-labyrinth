from models import *

class Bot(Player, object):
    def __init__(self, player_id, name, difficulty: BotDifficulty, send_to_game_func: Callable) -> None:
        super().__init__(player_id, name)
        self.is_bot = True
        self.difficulty: BotDifficulty = difficulty
        self.memory: set[str] = []
        # Additional properties and methods specific to bot behavior
        self.dictionary: list[str] = self.pull_dictionary(self.difficulty)
        self.send_to_game_func: Callable = send_to_game_func

    def pull_dictionary(self, difficulty: BotDifficulty) -> list[str]:
        if difficulty == BotDifficulty.EASY:
            dict_path = 'easy_bot_dictionary.txt'
        elif difficulty == BotDifficulty.MEDIUM:
            dict_path = 'medium_bot_dictionary.txt'
        elif difficulty == BotDifficulty.HARD:
            dict_path = 'medium_bot_dictionary.txt'
        else:
            raise Exception(f"Failed to pull bot dictionary of specified difficulty {difficulty}")
        return load_words_from_scowl(dict_path)

    def send_message(self, message: Action) -> None:
        # Send a message from the game to the bot
        # For local bots, directly process the message
        print(f"Bot with name {self.name} and id {self.player_id} received message: {message}")
        self.process_bot_action(message)

    def send_message_to_game(self, action_enum: ActionEnum, message_data: Any) -> None:
        # Send a message from the bot to the game
        # Normal players use websockets to do this, but this is a local way for the bots to accomplish the same thing
        self.send_to_game_func(Action(action_enum, self.player_id, message_data))

    def update_difficulty(self, difficulty_enum: BotDifficulty) -> None:
        self.difficulty = difficulty_enum

    def process_bot_action(self, message: Action) -> None:
        # Process the message and simulate a bot response/action
        print(f"Bot is processing message of action {message}")
        if message.action == ActionEnum.START_GAME:
            print(f"Bot {self.player_id} is ready to start game!")
        elif message.action == ActionEnum.START_TURN:
            if message.player_id != self.player_id:
                print(f"Next turn. It isn't bot {self.player_id}'s turn")
            else:
                print(f"It's my turn! Bot: {self.player_id}")
                self.do_turn(message)
        elif message.action == ActionEnum.WORD_ACCEPTED:
            # We need to remember which words were used, so we don't repeat them
            # Follow the path to see what the word is
            word = ''
            for (col, row) in message.data['path']:
                word += message.data['lobby']['state']['board']['tiles'][row][col]
            print(f"Bot {self.player_id} is adding word '{word}' to its list of used up words.")
            self.memory.add(word)
        elif message.action == ActionEnum.WORD_DENIED:
            if message.player_id == self.player_id:
                print(f"Crap, I'm bot {self.player_id} and my word got denied! Redoing the bot stuff and trying to submit a new action.")
                #self.do_turn()
            else:
                print(f"I'm bot {self.player_id} and phew, someone else's word got denied bwahaha")
                pass
        else:
            print(f"Bot is ignoring the action {message}")
        pass

    def do_turn(self, message: Action) -> None:
        game_board: list[list[str]] = message.data['lobby']['state']['board']['tiles']
        bot_representation_in_lobby: dict[str, Any] = get_player_from_id_dicts(message.data['lobby']['players'], self.player_id)
        available_money: int = bot_representation_in_lobby['money']
        board_size = message.data['lobby']['board_size']
        print(f"Bot {self.player_id} is doing turn where the game board is {game_board}, my own representation as a player is {bot_representation_in_lobby}, and I have this much money: {available_money}")
        
        def is_valid_move(x, y, path) -> bool:
            return 0 <= x < board_size and 0 <= y < board_size and (x, y) not in path
        
        def find_word(x, y, path, prefix: str):
            if prefix.lower() not in self.dictionary:
                return None
            for dx in [-1, 0, 1]:
                for dy in [-1, 0, 1]:
                    if dx == 0 and dy == 0:
                        continue  # Skip the current tile
                    nx, ny = x + dx, y + dy
                    if is_valid_move(nx, ny, path):
                        new_prefix = prefix + game_board[nx][ny]
                        new_path = path + [(nx, ny)]
                        if new_prefix.lower() in self.dictionary:
                            return new_prefix, new_path
                        else:
                            # Continue searching
                            result = find_word(nx, ny, new_path, new_prefix)
                            if result:
                                return result
            return None
        
        # The search algorithm is akin to how a player looks for words. Trace out a random path and see whether it spells out a known word
        # Try to find a word starting from a random position
        for _ in range(100):  # Limit attempts
            start_x, start_y = random.randint(0, board_size-1), random.randint(0, board_size-1)
            start_letter = game_board[start_x][start_y]
            word_found = find_word(start_x, start_y, [(start_x, start_y)], start_letter)
            if word_found:
                word, path = word_found
                print(f"Found word: {word} at path {path}")
                self.send_message_to_game(ActionEnum.PICK_WORD, path)
                return
        print("Failed to find a word this turn.")
        self.send_message_to_game(ActionEnum.END_TURN, {})

    def to_json(self) -> dict[str, Any]:
        return {
            "id": self.player_id,
            "name": self.name,
            "is_spectator": self.is_spectator,
            "is_bot": self.is_bot,
            "lives": self.lives,
            "money": self.currency,
            "score": self.score,
            "difficulty": self.difficulty.value,
            "memory": self.memory,
        }
