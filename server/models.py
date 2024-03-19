import random
import string
import time

from enum import Enum
from typing import Optional, Callable, Any

#from server import GameWebSocketHandler

PLAYER_LIMIT = 5


class Lobby(object):
    def __init__(self, host, lobby_id) -> None:
        self.host: str = host
        self.lobby_id: str = lobby_id
        self.players: list[Player] = []  # List of Player objects, and bots go in here too
        #self.bots = []  # List of Bot objects
        self.board_size: int = 4
        self.timer_setting: float = 15.0
        self.max_lives: int = 5
        self.is_in_game: bool = False
        self.broadcast_func: Optional[Callable] = None  # Set this when starting the game
        self.send_to_player_func: Optional[Callable] = None # Set this when starting the game
        self.game: Optional[Game] = None

    def __str__(self) -> str:
        return f"{self.game}"

    def __repr__(self) -> str:
        #dict = {"state": }
        return
    
    def to_json(self) -> dict[str, Any]:
        game_dict = self.game.to_json()
        state = {
            "curr_turn": 0, # TODO, index of player of whose turn it is
            "board": game_dict['board'],
            "timer": 123.4,
            "memory": [],
        }
        lobby_dict = {
            "state": state,
            "max_lives": self.max_lives,
            "host": self.host,
            "board_size": self.board_size,
            "timer_setting": self.timer_setting,
            "lobby_code": self.lobby_id,
            "players": [player.to_json() for player in self.players],
            "is_in_game": self.is_in_game,
        }
        return lobby_dict

    def change_lobby_settings(self, settings: dict) -> None:
        # Example settings could include 'board_size', 'timer_setting', and 'lives'
        print(f"Updating lobby {self.lobby_id}'s settings with: {settings}")
        for key, value in settings.items():
            if hasattr(self, key):
                setattr(self, key, value)
        
        # After updating settings, broadcast the new settings to all players
        self.broadcast_lobby_settings()

    def broadcast_lobby_settings(self) -> None:
        if self.broadcast_func:
            lobby_settings_message = Action(action=ActionEnum.UPDATE_LOBBY_SETTINGS.value,
                                            player_id=self.host,
                                            data={
                                                    "board_size": self.board_size,
                                                    "timer_setting": self.timer_setting,
                                                    "max_lives": self.max_lives
                                                }
            )
            print(f"Broadcasting new lobby settings to all players within lobby {self.lobby_id}: {lobby_settings_message}")
            self.broadcast_func(self.lobby_id, lobby_settings_message)

    def add_player(self, player: 'Player') -> bool:
        if not self.is_full:
            self.players.append(player)
            print(f"Player of name {player.name} and id {player.player_id} added to lobby {self.lobby_id}.")

            # Broadcast that a new player has joined the lobby
            '''
            if self.broadcast_func:
                join_message = Action(action=ActionEnum.PLAYER_JOINED.value,
                                      player_id=player.player_id,
                                      data={
                                                "PlayerID": player.player_id,
                                                "PlayerName": player.name
                                            }
                )
                self.broadcast_func(self.lobby_id, join_message)
            else:
                raise Exception("The lobby's broadcast function doesn't exist!")
            '''
            return True
        else:
            print(f"Lobby {self.lobby_id} is full. Cannot add player {player.name}.")
            return False

    
    def remove_player(self, player_id: str) -> bool:
        # Attempt to remove the player
        player_found = any(player.player_id == player_id for player in self.players)
        if player_found:
            # Remove player
            self.players = [player for player in self.players if player.player_id != player_id]
            print(f"Player (ID: {player_id}) removed from lobby {self.lobby_id}.")

            # If the host leaves, we'll handle lobby deletion outside this method
            return self.host == player_id
        else:
            print(f"No player with ID {player_id} found in lobby {self.lobby_id}.")
            return False
    
    def add_bot(self, bot) -> None:
        pass  # TODO
    
    def remove_bot(self, bot_id) -> None:
        pass  # TODO

    def set_broadcast_function(self, func: Callable) -> None:
        self.broadcast_func = func
    
    def set_send_to_player_func(self, func: Callable) -> None:
        self.send_to_player_func = func

    def start_game(self) -> None:
        # Ensure broadcast_func is set before starting the game
        print(f"Starting the game in lobby {self.lobby_id}")
        assert self.broadcast_func is not None, "Broadcast function wasn't set before starting the game!"
        self.game = Game(self.lobby_id, self.players, self.broadcast_func, self.send_to_player_func)
        self.game.start()
        self.is_in_game = True

    @property
    def is_full(self) -> bool:
        return len(self.players) >= PLAYER_LIMIT


class Game:
    def __init__(self, lobby_id: str, players: list['Player'], broadcast_func: Callable, send_to_player_func: Callable, board_size: int) -> None:
        self.lobby_id: str = lobby_id
        self.players: list['Player'] = players
        self.broadcast_func: Callable = broadcast_func  # Callback function for broadcasting messages
        self.send_to_player_func: Callable = send_to_player_func  # Callback to send message to specific player
        self.board_size: int = board_size
        self.board: Optional[WordGrid] = WordGrid(board_size)
    
    #def initialize_random_board(self) -> None:

    def broadcast_game_state(self, state_message) -> None:
        # Use the broadcast function to send a message to all players
        self.broadcast_func(state_message)

    def player_made_move(self, player_id, move) -> None:
        # Logic to update the game state based on the move
        # Then broadcast the new state
        update_message = {
            "action": ActionEnum.WORD_ACCEPTED.value,
            "data": {
                "PlayerID": player_id,
                "Move": move,
                # TODO: Include other relevant game state information
            }
        }
        self.broadcast_game_state(update_message)

    def to_json(self) -> dict[str, Any]:
        return {
            "lobby_id": self.lobby_id,
            "players": [player.to_json() for player in self.players],
            "board_size": self.board_size,
            "board": self.board.to_json() if self.board else None,
        }


class Player(object):
    def __init__(self, player_id, name) -> None:
        self.player_id = player_id
        self.name = name
        self.is_bot = False
        self.lives = 3
        self.score = 0
        self.currency = 0
        self.send_func: Optional[Callable] = None  # Callback function to send a message

    def set_send_message_func(self, func) -> None:
        self.send_func = func

    def send_message(self, message) -> None:
        # This is a real player, so we need to send a websocket message
        if self.send_func:
            print(f"Player with id {self.player_id} is sending a message to the associated websocket for this connection: {message}")
            self.send_func(self.player_id, message)
        else:
            print("No send function set for this player.")

    def to_json(self) -> dict[str, Any]:
        return {
            "player_id": self.player_id,
            "name": self.name,
            "is_bot": self.is_bot,
            "lives": self.lives,
            "score": self.score,
            "currency": self.currency,
        }


class Bot(Player, object):
    def __init__(self, player_id, name, difficulty) -> None:
        super().__init__(player_id, name)
        self.is_bot = True
        self.difficulty = difficulty
        # Additional properties and methods specific to bot behavior

    def send_message(self, message) -> None:
        # For local bots, directly process the message
        print(f"Bot with name {self.name} and id {self.player_id} received message: {message}")
        self.process_bot_action(message)

    def process_bot_action(self, message) -> None:
        # Process the message and simulate a bot response/action
        print(f"Bot is processing message {message}")
        pass


class WordGrid:
    def __init__(self, size) -> None:
        self.size = size
        self.grid = self.generate_grid(size)
        self.valid_words = set()  # Words found in the dictionary
    
    def generate_grid(self, size) -> list[list[str]]:
        return [
            [random.choice(string.ascii_uppercase) for _ in range(size)]
            for _ in range(size)
        ]
    
    def check_word(self, word) -> None:
        # Implementation to check if a word is valid
        pass
    
    def apply_powerup(self, powerup) -> None:
        # Implementation for applying power-up effects
        pass

    def to_json(self):
        return {
            "size": self.size,
            "grid": self.grid,
        }


class GameDictionary(object):
    def __init__(self) -> None:
        self.words = self.load_words()
    
    def load_words(self) -> None:
        pass  # Implementation to load words from the SCOWL dataset
    
    def is_valid_word(self, word) -> bool:
        return word.lower() in self.words


class Powerup(object):
    def __init__(self, name, cost) -> None:
        self.name = name
        self.cost = cost
    
    def apply_effect(self, target) -> None:
        pass  # Implementation of the power-up's effect


class Refresh(Powerup, object):
    def apply_effect(self, target) -> None:
        # Refresh the word grid
        pass


class Swap(Powerup, object):
    def apply_effect(self, target) -> None:
        # Swap two tiles
        pass


class Action(object):
    def __init__(self, action, player_id, data) -> None:
        self.action = action
        self.player_id = player_id
        self.data = data
        self.sequence: int = -1 # This gets set before sending!

    def __str__(self) -> str:
        return f"Action({self.action}, Player ID: {self.player_id}, Data: {self.data}, Sequence: {self.sequence})"

    def __repr__(self) -> str:
        return f"Action(action={repr(self.action)}, player_id={repr(self.player_id)}, data={repr(self.data)}, sequence={self.sequence})"

    def to_json(self) -> dict[str, Any]:
        return {
            "action": self.action,
            "player_id": self.player_id,
            "data": self.data,
            "sequence": self.sequence,
        }


class ActionEnum(Enum):
    # client side
    INITIALIZE = "initialize"
    JOIN_LOBBY = "join_lobby"
    LEAVE_LOBBY = "leave_lobby"
    CHANGE_PARAM = "change_param"
    READY_LOBBY = "ready_lobby"
    PICK_WORD = "pick_word"
    PICK_ROTATE_POWERUP = "pick_rotate_powerup"
    PICK_SCRAMBLE_POWERUP = "pick_scramble_powerup"
    PICK_SWAP_POWERUP = "pick_swap_powerup"
    PICK_TRANSFORM_POWERUP = "pick_transform_powerup"
    LEAVE_GAME = "leave_game"
    ADD_BOT = "add_bot" # Also sent from server to client
    UPDATE_BOT = "update_bot"
    DELETE_BOT = "delete_bot"
    # server side
    RETURN_PLAYER_ID = "return_player_id"
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
