from enum import Enum

PLAYER_LIMIT = 5

class Lobby(object):
    def __init__(self, host, lobby_code) -> None:
        self.host = host,
        self.lobby_code = lobby_code
        self.players = []  # List of Player objects, and bots go in here too
        #self.bots = []  # List of Bot objects
        self.board_size: int = 4
        self.timer_setting: float = 15.0
        self.lives: int = 5
        self.is_in_game = False
        self.broadcast_func = None  # Set this when starting the game
    
    def add_player(self, player) -> bool:
        success = False
        if not self.is_full:
            self.players.append(player)
            print(f"Player {player} added to lobby {self.lobby_id}.")
            success = True
        else:
            print(f"Lobby {self.lobby_id} is full. Cannot add player {player}.")

        if self.is_full:
            print(f"Lobby {self.lobby_id} is now full.")
        return success
    
    def remove_player(self, player_id) -> None:
        pass  # TODO
    
    def add_bot(self, bot) -> None:
        pass  # TODO
    
    def remove_bot(self, bot_id) -> None:
        pass  # TODO

    def set_broadcast_function(self, func) -> None:
        self.broadcast_func = func

    def start_game(self) -> None:
        # Ensure broadcast_func is set before starting the game
        assert self.broadcast_func is not None, "Broadcast function wasn't set before starting the game!"
        self.game = Game(self.lobby_id, self.players, self.broadcast_func)
        self.game.start()

    @property
    def is_full(self) -> bool:
        return len(self.players) >= PLAYER_LIMIT

class Game:
    def __init__(self, lobby_id, players, broadcast_func) -> None:
        self.lobby_id = lobby_id
        self.players = players
        self.broadcast_func = broadcast_func  # Callback function for broadcasting messages
    
    def broadcast_game_state(self, state_message) -> None:
        # Use the broadcast function to send a message to all players
        self.broadcast_func(state_message)

    # Example usage within the class
    def player_made_move(self, player_id, move) -> None:
        # Logic to update the game state based on the move
        # Then broadcast the new state
        update_message = {
            "action": ActionEnum.WORD_ACCEPTED,
            "data": {
                "PlayerID": player_id,
                "Move": move,
                # TODO: Include other relevant game state information
            }
        }
        self.broadcast_game_state(update_message)


class Player(object):
    def __init__(self, player_id, name) -> None:
        self.player_id = player_id
        self.name = name
        self.is_bot = False
        self.lives = 3
        self.score = 0
        self.currency = 0

class Bot(Player, object):
    def __init__(self, player_id, name, difficulty):
        super().__init__(player_id, name)
        self.is_bot = True
        self.difficulty = difficulty
        # Additional properties and methods specific to bot behavior

class WordGrid(object):
    def __init__(self, size):
        self.size = size
        self.grid = self.generate_grid(size)
        self.valid_words = set()  # Words found in the dictionary
    
    def generate_grid(self, size):
        pass  # Implementation to generate a random grid of letters
    
    def check_word(self, word):
        pass  # Implementation to check if a word is valid
    
    def apply_powerup(self, powerup):
        pass  # Implementation for applying power-up effects

class GameDictionary(object):
    def __init__(self):
        self.words = self.load_words()
    
    def load_words(self):
        pass  # Implementation to load words from the SCOWL dataset
    
    def is_valid_word(self, word):
        return word.lower() in self.words

class Powerup(object):
    def __init__(self, name, cost):
        self.name = name
        self.cost = cost
    
    def apply_effect(self, target):
        pass  # Implementation of the power-up's effect

class Refresh(Powerup, object):
    def apply_effect(self, target):
        # Refresh the word grid
        pass

class Swap(Powerup, object):
    def apply_effect(self, target):
        # Swap two tiles
        pass

class Action(object):
    def __init__(self, action, player_id, data):
        self.action = action
        self.player_id = player_id
        self.data = data


class ActionEnum(Enum):
    # client side
    INITIALIZE = "initialize"
    JOIN_LOBBY = "join_lobby"
    CHANGE_PARAM = "change_param"
    READY_LOBBY = "ready_lobby"
    PICK_WORD = "pick_word"
    PICK_POWERUP = "pick_powerup"
    LEAVE_GAME = "leave_game"
    # server side
    RETURN_LOBBY_CODE = "return_lobby_code"
    LOBBY_DOES_NOT_EXIST = "lobby_does_not_exist"
    LOBBY_IS_FULL = "lobby_is_full"
    SUCCESSFULLY_JOINED_LOBBY = "successfully_joined_lobby"
    SUCCESS = "success"
    ERROR = "error"
    START_GAME = "start_game"
    PLAYER_JOINED = "player_joined"
    PLAYER_LEFT = "player_left"
    UPDATE_LOBBY_SETTINGS = "update_lobby_settings"
    WORD_ACCEPTED = "word_accepted"
    WORD_DENIED = "word_denied"
    END_TURN = "end_turn"
    START_TURN = "start_turn"
    POWERUP_DENIED = "powerup_denied"
    POWERUP_ACTIVATED = "powerup_activated"
    YOU_DIED = "you_died"
    YOU_WIN = "you_win"