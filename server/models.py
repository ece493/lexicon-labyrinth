from enum import Enum

class Lobby(object):
    def __init__(self, host, lobby_code):
        self.host = host,
        self.lobby_code = lobby_code
        self.players = []  # List of Player objects
        self.bots = []  # List of Bot objects
        self.board_size = [4,4]
        self.timer_setting = 15
        self.lives = 5
    
    def add_player(self, player):
        pass  # Implementation
    
    def remove_player(self, player_id):
        pass  # Implementation
    
    def add_bot(self, bot):
        pass  # Implementation
    
    def remove_bot(self, bot_id):
        pass  # Implementation
    
    def start_game(self):
        pass  # Implementation

class Player(object):
    def __init__(self, player_id, name):
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

# Example power-up classes
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