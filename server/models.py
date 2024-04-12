import random
import string
import time
import json
import math
import copy

from trie import *
from enum import Enum, auto
from typing import Optional, Callable, Any

#from server import GameWebSocketHandler
from utils import get_random_player_id, load_words_from_scowl, get_player_from_id_dicts
#from bot import Bot

PLAYER_LIMIT = 5
DICTIONARY_PATH = "dictionary.txt"

# The player starts with 10 money
POWERUP_COSTS = { # FR30
    "Rotate": 5,
    "Scramble": 4,
    "Swap": 8,
    "Transform": 9
}


class GameState(Enum):
    WAITING_FOR_PLAYERS = auto()
    TURN_START = auto()
    WAITING_FOR_MOVE = auto()
    MOVE_REJECTED = auto()
    TURN_END = auto()
    PLAYER_ELIMINATED = auto()
    CHECK_FOR_WIN = auto()
    GAME_OVER = auto()

class BotDifficulty(Enum):
    EASY = 0
    MEDIUM = 1
    HARD = 2

    def __str__(self) -> str:
        return self.name

BOT_TIME_LIMIT_FRAC_DELAY = (0.9, 0.5, 0.3)

BOT_FAIL_PROBABILITY = (0.25, 0.18, 0.10)

def get_player_from_id(player_list: list['Player'], player_id: str) -> 'Player':
    for player in player_list:
        if player.player_id == player_id:
            return player
    return None

class Lobby(object):
    def __init__(self, host, lobby_id) -> None:
        self.host: str = host
        self.lobby_id: str = lobby_id
        # List of Player objects, and bots go in here too
        self.players: list[Player] = []
        # self.bots = []  # List of Bot objects
        self.board_size: int = 4
        self.timer_setting: float = 15.0
        self.max_lives: int = 5
        self.is_in_game: bool = False
        # Set this when starting the game
        self.broadcast_func: Optional[Callable] = None
        # Set this when starting the game
        self.send_to_player_func: Optional[Callable] = None
        self.game: Optional[Game] = None

    def __str__(self) -> str:
        return f"{self.game}"

    def __repr__(self) -> str:
        # dict = {"state": }
        return

    def handle_action(self, player_id: str, actionEnum: 'ActionEnum', action: 'Action') -> None:
        assert isinstance(player_id, str)
        assert isinstance(actionEnum, ActionEnum)
        assert isinstance(action, Action)
        assert action.action == actionEnum.value, f"Actionenum ({actionEnum}) not matching the action ({action.action})!"
        if actionEnum in [ActionEnum.CHANGE_PARAM, ActionEnum.READY_LOBBY, ActionEnum.ADD_BOT, ActionEnum.UPDATE_BOT]:
            if actionEnum == ActionEnum.CHANGE_PARAM:
                # The owner of the lobby is trying to change the lobby's settings
                self.change_lobby_settings(action.data)
            elif actionEnum == ActionEnum.ADD_BOT:
                assert self.host == player_id, f"Error! Only the lobby's host is able to add a bot! The host is {self.host} and the player trying to add the bot is {player_id}"
                self.add_bot(action.data)
            elif actionEnum == ActionEnum.READY_LOBBY:
                assert self.host == player_id, f"Error! Player who tried to start game ({player_id}) is not the host of the lobby ({self.host})!"
                self.start_game()
            elif actionEnum == ActionEnum.UPDATE_BOT:
                assert self.host == player_id, f"Error! Player who tried to update bot ({player_id}) is not the host of the lobby ({self.host})!"
                self.update_bot(action.data)
            else:
                print(f"Unknown action {action} cannot be handled by the lobby!")
        elif actionEnum in [ActionEnum.PICK_WORD, ActionEnum.PICK_TRANSFORM_POWERUP, ActionEnum.PICK_ROTATE_POWERUP, ActionEnum.PICK_SCRAMBLE_POWERUP, ActionEnum.PICK_SWAP_POWERUP, ActionEnum.END_TURN]:
            self.game.handle_action(player_id, actionEnum, action)
        else:
            print(
                f"Action {action} cannot be handled by the lobby nor the game!")

    def to_json(self) -> dict[str, Any]:
        # SHOULD BE UNUSED!
        if self.game is not None:
            assert isinstance(self.game, Game)
            game_dict = self.game.to_json()
        else:
            game_dict = {'state': {'board': [[]]}}
        state = {
            "curr_turn": 0,  # TODO, index of player of whose turn it is
            "board": game_dict['state']['board'],
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
                if key == 'board_size':
                    value = int(value)
                elif key == 'timer_setting':
                    value = int(value)
                elif key == 'max_lives':
                    value = int(value)
                setattr(self, key, value)

        # After updating settings, broadcast the new settings to all players
        self.broadcast_lobby_settings()

    def broadcast_lobby_settings(self) -> None:
        if self.broadcast_func:
            lobby_settings_message = Action(action=ActionEnum.UPDATE_LOBBY_SETTINGS,
                                            player_id=self.host,
                                            data={"lobby": self.to_json()}
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
                join_message = Action(action=ActionEnum.PLAYER_JOINED,
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
        player_found = any(player.player_id ==
                           player_id for player in self.players)
        if player_found:
            # Remove player
            self.players = [
                player for player in self.players if player.player_id != player_id]
            print(
                f"Player (ID: {player_id}) removed from lobby {self.lobby_id}.")

            # If the host leaves, we'll handle lobby deletion outside this method
            print(f"Checking whether the {self.host=} is {player_id=} when removing a player from the lobby")
            return self.host == player_id
        else:
            print(
                f"No player with ID {player_id} found in lobby {self.lobby_id}.")
            return False
    
    def add_bot(self, data) -> bool:
        # Initialize bot with specified difficulty
        # Add them to the list of players
        # Send a message to all players saying a new bot player joined
        if not self.is_full:
            new_bot_id = get_random_player_id()
            # TODO: Make the name better
            new_bot_name = new_bot_id
            bot = Bot(new_bot_id, new_bot_name, BotDifficulty.MEDIUM, self.handle_action) # Pass a callback to the bot so it can send actions back to the game
            self.players.append(bot)
            print(f"Bot of name {bot.name} and id {bot.player_id} added to lobby {self.lobby_id}.")

            # Broadcast that a new player has joined the lobby
            
            if self.broadcast_func:
                join_message = Action(action=ActionEnum.ADD_BOT,
                                      player_id=bot.player_id,
                                      data={
                                                "lobby": self.to_json()
                                            }
                )
                self.broadcast_func(self.lobby_id, join_message)
            else:
                raise Exception("The lobby's broadcast function doesn't exist!")
            
            return True
        else:
            print(f"Lobby {self.lobby_id} is full. Cannot add new bot.")
            return False
    
    def update_bot(self, data) -> None:
        bot_id = data['player_id']
        difficulty = data['difficulty']
        if difficulty == 0:
            difficulty_enum = BotDifficulty.EASY
        elif difficulty == 1:
            difficulty_enum = BotDifficulty.MEDIUM
        elif difficulty == 2:
            difficulty_enum = BotDifficulty.HARD
        else:
            raise Exception(f"Unknown bot difficulty number {difficulty}! Must be 0, 1, or 2")
        for player in self.players:
            if player.player_id == bot_id and player.is_bot:
                assert isinstance(player, Bot), "Error! Updating difficulty of a non-bot player!"
                player.update_difficulty(difficulty_enum)
                return
        raise Exception(f"Bot to update difficulty of is not found in the list of bots in this lobby!")

    def remove_bot(self, bot_id) -> None:
        # Remove bot
        # Send message to all players saying the bot left
        # UNUSED, USE REMOVE PLAYER INSTEAD!
        pass  # TODO

    def set_broadcast_function(self, func: Callable) -> None:
        self.broadcast_func = func

    def set_send_to_player_func(self, func: Callable) -> None:
        self.send_to_player_func = func

    def start_game(self) -> None:
        # Ensure broadcast_func is set before starting the game
        print(f"Starting the game in lobby {self.lobby_id}")
        assert self.broadcast_func is not None, "Broadcast function wasn't set before starting the game!"
        # Set everyone's lives to the correct amount before starting the game
        for player in self.players:
            player.set_lives(self.max_lives)
        # Start the game!
        self.game = Game(self.lobby_id, self.players, self.broadcast_func, self.send_to_player_func,
                         self.board_size, self.max_lives, self.host, self.timer_setting)
        self.game.start_game()
        self.is_in_game = True

    @property
    def is_full(self) -> bool:
        return len(self.players) >= PLAYER_LIMIT
    
    @property
    def game_complete(self) -> bool:
        if self.game is None:
            return False
        else:
            return self.game.game_complete


class Game:
    def __init__(self, lobby_id: str, players: list['Player'], broadcast_func: Callable, send_to_player_func: Callable, board_size: int, max_lives: int, host: str, timer_setting: float) -> None:
        self.lobby_id: str = lobby_id
        self.players: list['Player'] = players
        # Callback function for broadcasting messages
        self.broadcast_func: Callable = broadcast_func
        # Callback to send message to specific player
        self.send_to_player_func: Callable = send_to_player_func
        self.board_size: int = board_size
        self.board: WordGrid = WordGrid(board_size)
        self.max_lives: int = max_lives
        self.host: str = host
        self.timer_setting: float = timer_setting
        self.current_player_index: int = 0
        self.turn_modulus: int = len(players)
        self.dictionary = GameDictionary()
        self.used_words: set[str] = set()
        self.game_complete = False

    # def initialize_random_board(self) -> None:

    def broadcast_game_state(self, state_message) -> None:
        # Use the broadcast function to send a message to all players
        self.broadcast_func(state_message)

    def player_made_move(self, player_id, move) -> None:
        # UNUSED
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

    def start_game(self) -> None:
        # Broadcast the start game message to all players
        start_game_message = Action(ActionEnum.START_GAME, self.host, self.to_json())
        # Send the initial game state, including the board, to all players
        self.broadcast_func(self.lobby_id, start_game_message)
        # Transition from WAITING_FOR_PLAYERS to TURN_START
        # time.sleep(2)
        self.state = GameState.TURN_START
        self.next_turn()

    def find_next_non_spectator_player_index(self, start_index: int = 0) -> int:
        """Finds the next non-spectator player starting from a given index."""
        next_index = start_index
        for _ in range(len(self.players)):  # Prevent infinite loops
            if not self.players[next_index].is_spectator and self.players[next_index].lives >= 1:
                return next_index  # Found a non-spectator player
            next_index = (next_index + 1) % len(self.players)
        return -1  # In case all players are spectators or list is empty

    def get_next_non_spectator_player(self) -> tuple[int, Optional['Player']]:
        """Returns the next non-spectator player's index and object."""
        next_index = self.find_next_non_spectator_player_index(self.current_player_index)
        if next_index != -1:
            return next_index, self.players[next_index]
        else:
            raise Exception("No next non-spectator player! The game should have ended when only one player was left")
            return -1, None  # No non-spectator player found

    def next_turn(self) -> None:
        """Transitions to the next player's turn, skipping spectators and dead player"""
        next_index, next_player = self.get_next_non_spectator_player()
        if next_player is not None:
            self.current_player_index = next_index  # Update to the next player's index
            self.state = GameState.WAITING_FOR_MOVE
            # Inform all players whose turn it is now
            self.broadcast_func(self.lobby_id, Action(ActionEnum.START_TURN, next_player.player_id, self.to_json()))
        else:
            # Handle the scenario where no non-spectator players are found
            pass  # This could involve checking game end conditions or handling errors
            raise Exception("No players remaining!")
            # self.winner_determined()

    def handle_action(self, player_id: str, actionEnum: 'ActionEnum', action: 'Action') -> None:
        assert isinstance(player_id, str)
        assert isinstance(actionEnum, ActionEnum)
        assert isinstance(action, Action)
        if actionEnum == ActionEnum.PICK_WORD:
            self.process_word_choice(player_id, action.data)
        elif actionEnum == ActionEnum.PICK_ROTATE_POWERUP:
            self.apply_rotate_powerup(player_id, action.data)
        elif actionEnum == ActionEnum.PICK_SCRAMBLE_POWERUP:
            self.apply_scramble_powerup(player_id)
        elif actionEnum == ActionEnum.PICK_SWAP_POWERUP:
            self.apply_swap_powerup(player_id, action.data)
        elif actionEnum == ActionEnum.PICK_TRANSFORM_POWERUP:
            self.apply_transform_powerup(player_id, action.data)
        elif actionEnum == ActionEnum.END_TURN:
            # The player ran out of time and needs to be eliminated
            self.handle_player_elimination_or_time_out(player_id)
            # TODO: Move onto the next player's turn!
        else:
            print(f"Game cannot handle this unknown action: {action}")

    def transition_to_next_player(self) -> None:
        """Transitions to the next player's turn."""
        print(f"Transitioning to next player from {self.current_player_index}")
        self.current_player_index = (self.current_player_index + 1) % len(self.players)

        self.next_turn()

    def inform_player_turn(self) -> None:
        """Informs the current player that it's their turn."""
        print(
            f"Informing player at index {self.current_player_index} that it's their turn")
        # Ensure we skip spectators
        while self.players[self.current_player_index].is_spectator:
            self.current_player_index = (
                self.current_player_index + 1) % len(self.players)

        current_player = self.players[self.current_player_index]
        self.broadcast_func(self.lobby_id, Action(ActionEnum.START_TURN, current_player.player_id, {"message": "Your turn"}))
        self.state = GameState.WAITING_FOR_MOVE

    def retry_current_player_turn(self) -> None:
        """Allows the current player to retry their turn after a rejected move or using a power-up."""
        self.inform_player_turn()  # It's still the current player's turn

    def handle_player_elimination_or_time_out(self, player_id) -> None:
        """Handles the scenario where a player is eliminated or runs out of time."""
        # Remove the player or deduct life
        player_to_kill = None
        for player in self.players:
            if player.player_id == player_id:
                player_to_kill = player
                break
        if player_to_kill is None:
            raise Exception("Could not find the player_id which is to be eliminated!")
        if player_to_kill.lives > 1:
            player_to_kill.lives -= 1
            self.broadcast_func(self.lobby_id, Action(ActionEnum.LOSE_LIFE, player_id, {"player_id": player_id, "lobby": self.to_json()}))
            self.state = GameState.TURN_END
            self.transition_to_next_player()
        elif player_to_kill.lives == 1:
            player_to_kill.lives -= 1
            self.eliminate_player(player_id)
        else:
            print("Player is already dead")

    def check_path_validity(self, path) -> bool:
        last_col = None
        last_row = None
        visited = set()
        for (col, row) in path:
            if (col, row) in visited:
                # Make sure we don't visit the same node twice
                return False
            visited.add((col, row))
            if last_col is None and last_row is None:
                last_col = col
                last_row = row
            else:
                # Check to make sure that the move is either a diagonal, or it goes up/down/left/right by one
                if (abs(col - last_col), abs(row - last_row)) not in [(1, 0), (1, 1), (0, 1)]:
                    print(f"Move has an invalid path!")
                    return False
                last_col = col
                last_row = row
        return True

    def process_word_choice(self, player_id, move_data) -> None:
        assert self.state == GameState.WAITING_FOR_MOVE, f"In process move, the current state of {self.state} isn't the expected of WAITING_FOR_MOVE!"
        # Logic to check if the move is valid
        print(f"Processing move: {move_data}")
        word_to_check = ""
        for (col, row) in move_data:
            word_to_check += self.board.get_letter(row, col)
        print(f"Checking word {word_to_check}")
        word_is_unused = word_to_check not in self.used_words
        word_is_valid = self.dictionary.is_valid_word(word_to_check)
        path_is_valid = self.check_path_validity(move_data)
        move_is_valid = word_is_valid and path_is_valid and word_is_unused
        if not word_is_valid:
            print(f"Word is not in the dictionary! Invalid word.")
        if not word_is_unused:
            print(f"Word {word_to_check} is a duplicate")
        if move_is_valid:
            # Give the money to the player
            player = get_player_from_id(self.players, player_id)
            assert player is not None
            player.add_money(self.dictionary.get_word_score(word_to_check))
            # Broadcast the lobby state to all
            self.broadcast_func(self.lobby_id, Action(ActionEnum.WORD_ACCEPTED, player_id, {'lobby': self.to_json(), 'path': move_data}))
            # Record that the word was used
            self.used_words.add(word_to_check)
            self.state = GameState.TURN_END
            
            # Must be after the ACCEPTED broadcast. Now that the word is selected, we need to replace the letters used with new random letters
            for (col, row) in move_data:
                self.board.randomly_replace_letter(row, col)
            
            # self.winner_determined()
            self.transition_to_next_player()
        else:
            self.broadcast_func(self.lobby_id, Action(ActionEnum.WORD_DENIED, player_id, {'lobby': self.to_json(), 'path': move_data}))
            self.state = GameState.WAITING_FOR_MOVE

    def winner_determined(self, winner: 'Player') -> None:
        self.state = GameState.GAME_OVER
        winner_player_id = winner.player_id
        self.broadcast_func(self.lobby_id, Action(ActionEnum.YOU_WIN, winner_player_id, {'lobby': self.to_json()}))
        # else:
        #    self.state = GameState.TURN_START
        #    self.current_player_index = (self.current_player_index + 1) % len(self.players)
        #    self.next_turn()

    def eliminate_player(self, player_id) -> None:
        player_to_eliminate = None
        for player in self.players:
            if player.player_id == player_id:
                player_to_eliminate = player
                break
        # Force their lives to 0
        player_to_eliminate.lives = 0
        if player_to_eliminate.is_bot:
            # Remove the bot after telling it that it died
            self.broadcast_func(self.lobby_id, Action(ActionEnum.YOU_DIED, player_to_eliminate.player_id, {"lobby": self.to_json(), "player_id": player_to_eliminate.player_id}))
            #self.broadcast_func(self.lobby_id, Action(ActionEnum.LEAVE_GAME, player_to_eliminate.player_id, self.to_json()))
            #self.players = [player for player in self.players if player.player_id != player_id]
        else:
            # Let the player watch the rest of the game as a spectator
            player_to_eliminate.is_spectator = True
            self.broadcast_func(self.lobby_id, Action(ActionEnum.YOU_DIED, player_to_eliminate.player_id, {"lobby": self.to_json(), "player_id": player_to_eliminate.player_id}))

        remaining_players = [player for player in self.players if not player.is_spectator and player.lives >= 1]
        if len(remaining_players) == 1:
            # Last player standing
            print(f"Only one last player standing. The game has ended!")
            #self.transition_to_next_player()
            self.winner_determined(remaining_players[0])
            self.game_complete = True
        else:
            print(f"A player got removed, but there's still players left to fight it out. The game goes on!")
            # Move onto the next player's turn!
            self.transition_to_next_player()

    def run_game(self) -> None:
        # UNUSED
        # determining who goes first, initializing game timers, etc.
        current_turn = 0
        turn_modulus = len(self.players)
        while True:
            # Main game loop
            current_turn_player = self.players[current_turn % turn_modulus]
            current_turn = (current_turn + 1) % turn_modulus
            if current_turn_player.is_spectator:
                continue
            # This is either a real player or bot that is in-game

    # Helper function to check player's funds and deduct cost
    def check_and_deduct_funds(self, player_id: str, cost: int) -> bool:
        # FR28, FR31, FR32
        player = next(
            (p for p in self.players if p.player_id == player_id), None)
        if player is not None and player.currency >= cost:
            player.currency -= cost
            assert player.currency >= 0, f"Player's currency is {player.currency} and dipped below 0! This should never have happened."
            return True
        return False

    def add_funds(self, player_id: str, funds: int) -> bool:
        player = next((p for p in self.players if p.player_id == player_id), None)
        if player is not None:
            player.currency += funds
            return True
        return False

    def apply_rotate_powerup(self, player_id: str, data: dict) -> None:
        # FR33
        print(f"Applying rotate powerup! Data is {data}")
        cost = POWERUP_COSTS["Rotate"]
        if self.check_and_deduct_funds(player_id, cost):
            # Apply rotation logic here based on 'data'
            assert data['type'] in [
                'row', 'col'], f"Rotate powerup type not either 'row' or 'col'!"
            self.board.rotate(data['type'], data['index'], data['rotations'])

            # Broadcast success message to ALL players
            self.broadcast_func(self.lobby_id, Action(ActionEnum.ROTATE_POWERUP_ACCEPTED, player_id, {'lobby': self.to_json(), 'powerup_data': data}))
        else:
            # Broadcast denial due to insufficient funds
            self.broadcast_func(self.lobby_id, Action(ActionEnum.POWERUP_DENIED, player_id, self.to_json()))

    def apply_transform_powerup(self, player_id: str, data: dict) -> None:
        # FR36
        print(f"Applying transform powerup! Data is {data}")
        tile = data['tile']
        new_char = data['new_char']
        cost = POWERUP_COSTS["Transform"]
        if self.check_and_deduct_funds(player_id, cost):
            # Apply transform logic here
            self.board.set_letter(tile[1], tile[0], new_char)
            # Broadcast success message
            self.broadcast_func(self.lobby_id, Action(ActionEnum.TRANSFORM_POWERUP_ACCEPTED, player_id, {'lobby': self.to_json(), 'powerup_data': data}))
            pass
        else:
            # Broadcast denial due to insufficient funds
            self.broadcast_func(self.lobby_id, Action(ActionEnum.POWERUP_DENIED, player_id, self.to_json()))

    def apply_swap_powerup(self, player_id: str, data: list) -> None:
        # FR35
        print(f"Applying swap powerup! Data is {data}")
        cost = POWERUP_COSTS["Swap"]
        if self.check_and_deduct_funds(player_id, cost):
            # Apply swap logic here
            self.board.swap_tiles(
                [data['tiles'][0][1], data['tiles'][0][0]],  [data['tiles'][1][1], data['tiles'][1][0]])
            # Broadcast success message
            self.broadcast_func(self.lobby_id, Action(ActionEnum.SWAP_POWERUP_ACCEPTED, player_id, {
                                'lobby': self.to_json(), 'powerup_data': data}))
        else:
            # Broadcast denial due to insufficient funds
            self.broadcast_func(self.lobby_id, Action(ActionEnum.POWERUP_DENIED, player_id, self.to_json()))

    def apply_scramble_powerup(self, player_id: str) -> None:
        # FR34
        print(f"Applying scramble powerup!")
        cost = POWERUP_COSTS["Scramble"]
        if self.check_and_deduct_funds(player_id, cost):
            # Apply scramble logic here
            self.board.scramble()
            # Broadcast success message
            self.broadcast_func(self.lobby_id, Action(ActionEnum.SCRAMBLE_POWERUP_ACCEPTED, player_id, {"lobby": self.to_json()}))
        else:
            # Broadcast denial due to insufficient funds
            self.broadcast_func(self.lobby_id, Action(ActionEnum.POWERUP_DENIED, player_id, self.to_json()))

    # def to_json(self) -> dict[str, Any]:
    #     return {
    #         "lobby_id": self.lobby_id,
    #         "players": [player.to_json() for player in self.players],
    #         "board_size": self.board_size,
    #         "board": self.board.to_json() if self.board else None,
    #     }

    def to_json(self) -> dict[str, Any]:
        if self.current_player_index >= len(self.players):
            print("WARNING: The player index is beyond the bounds of the player array!")
            self.current_player_index = 0
        state = {
            "curr_turn": self.players[self.current_player_index].player_id,
            "board": self.board.to_json() if self.board else None,
            "timer": 123.4,
            "memory": [],
        }
        game_state_dict = {
            "state": state,
            "max_lives": self.max_lives,
            "host": self.host,
            "board_size": self.board_size,
            "timer_setting": self.timer_setting,
            "lobby_code": self.lobby_id,
            "players": [player.to_json() for player in self.players]
        }
        return game_state_dict


class Player(object):
    def __init__(self, player_id, name: str, lives: int = 3) -> None:
        self.player_id = player_id
        self.name = name
        self.is_bot = False
        self.is_spectator = False
        self.lives: int = lives
        self.score = 0
        self.currency = 10  # Start with 10 monies
        # Callback function to send a message
        self.send_func: Optional[Callable] = None

    def set_lives(self, lives: int) -> None:
        self.lives = lives

    def set_send_message_func(self, func) -> None:
        self.send_func = func

    def add_money(self, money_to_add: int) -> None:
        self.currency += money_to_add

    def send_message(self, message: 'Action') -> None:
        assert isinstance(message, Action)
        # This is a real player, so we need to send a websocket message
        if self.send_func:
            print(f"Player with id {self.player_id} is sending a message to the associated websocket for this connection: {message}")
            self.send_func(self.player_id, message)
        else:
            print("No send function set for this player.")

    def to_json(self) -> dict[str, Any]:
        return {
            "id": self.player_id,
            "name": self.name,
            "is_spectator": self.is_spectator,
            "is_bot": self.is_bot,
            "lives": self.lives,
            "money": self.currency,
            "score": self.score,
        }


class Bot(Player, object):
    def __init__(self, player_id, name, difficulty: BotDifficulty, send_to_game_func: Callable) -> None:
        super().__init__(player_id, name)
        self.is_bot = True
        self.difficulty: BotDifficulty = difficulty
        self.memory: set[str] = set()
        # Additional properties and methods specific to bot behavior
        self.dictionary: list[str] = self.pull_dictionary(self.difficulty)
        self.dict_trie = Trie()
        for word in self.dictionary:
            self.dict_trie.insert(word)
        self.fail_probability = BOT_FAIL_PROBABILITY[difficulty.value]
        self.time_limit_s: float = 1000.0
        self.start_time_s: float = 0.0
        self.min_time_to_submit_turn: float = 0.0
        self.send_to_game_func: Callable = send_to_game_func
        self.pre_board_change_found_path = None

    def check_whether_prefix_is_in_dictionary(self, prefix: str) -> bool:
        # TODO: Optimize using lexicographical stuff
        return self.dict_trie.starts_with(prefix)
        # for word in self.dictionary:
        #     if word.startswith(prefix):
        #         return True
        # return False

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

    def send_message(self, message: 'Action') -> None:
        assert isinstance(message, Action)
        # Send a message from the game to the bot
        # For local bots, directly process the message
        print(f"Bot with name {self.name} and id {self.player_id} received message: {message}")
        self.process_bot_action(message)

    def send_message_to_game(self, action_enum: 'ActionEnum', message_data: Any) -> None:
        assert isinstance(action_enum, ActionEnum)
        # Send a message from the bot to the game
        # Normal players use websockets to do this, but this is a local way for the bots to accomplish the same thing
        self.send_to_game_func(self.player_id, action_enum, Action(action_enum, self.player_id, message_data))

    def update_difficulty(self, difficulty_enum: BotDifficulty) -> None:
        self.difficulty = difficulty_enum
        self.dictionary = self.pull_dictionary(self.difficulty)
        self.fail_probability = BOT_FAIL_PROBABILITY[self.difficulty.value]

    def process_bot_action(self, message: 'Action') -> None:
        assert isinstance(message, Action)
        # Process the message and simulate a bot response/action
        print(f"Bot is processing message of action {message}")
        if message.action == ActionEnum.START_GAME.value:
            print(f"Bot {self.player_id} is ready to start game!")
            # Update the time limit with the actual lobby's time limit
            self.time_limit_s = float(message.data['timer_setting'])
            assert isinstance(self.time_limit_s, float)
            self.min_time_to_submit_turn: float = random.triangular(0.0, self.time_limit_s*BOT_TIME_LIMIT_FRAC_DELAY[self.difficulty.value], 0.0) # FR38, FR43, FR46
            print(f"Bot's time limit is {self.time_limit_s}")
        elif message.action == ActionEnum.START_TURN.value:
            print(message.data)
            if message.data['state']['curr_turn'] != self.player_id:
                #print(f"Next turn. It isn't bot {self.player_id}'s turn")
                pass
            else:
                print(f"It's my turn! Bot: {self.player_id}")
                self.do_turn(message)
        elif message.action in [ActionEnum.TRANSFORM_POWERUP_ACCEPTED.value, ActionEnum.SWAP_POWERUP_ACCEPTED.value]:
            if 'lobby' in message.data:
                if message.data['lobby']['state']['curr_turn'] == self.player_id:
                    self.finish_turn_after_powerup()
            else:
                raise Exception(f"How come lobby wasn't in this dict: {message.data}")
        elif message.action in [ActionEnum.ROTATE_POWERUP_ACCEPTED.value, ActionEnum.SCRAMBLE_POWERUP_ACCEPTED.value]:
            if 'lobby' in message.data:
                if message.data['lobby']['state']['curr_turn'] == self.player_id:
                    self.do_turn(message)
            else:
                raise Exception(f"How come lobby wasn't in this dict: {message.data}")
        elif message.action == ActionEnum.WORD_ACCEPTED.value:
            # We need to remember which words were used, so we don't repeat them
            # Follow the path to see what the word is
            word = ''
            print(message.data)
            for (col, row) in message.data['path']:
                word += message.data['lobby']['state']['board'][row][col]
            print(f"Bot {self.player_id} is adding word '{word}' to its list of used up words.")
            self.memory.add(word.lower())
        elif message.action == ActionEnum.WORD_DENIED.value:
            if 'lobby' in message.data:
                if message.data['lobby']['state']['curr_turn'] == self.player_id:
                    print(f"Crap, I'm bot {self.player_id} and my word got denied! Redoing the bot stuff and trying to submit a new action.")
                    self.do_turn(message)
                else:
                    print(f"I'm bot {self.player_id} and phew, someone else's word got denied bwahaha")
                    pass
            else:
                raise Exception(f"How come lobby wasn't in this dict: {message.data} and the whole message was {message}")
        else:
            pass
            #print(f"Bot is ignoring the action {message}")
        pass

    def use_scramble_powerup(self) -> None:
        # FR49
        print("BOT IS USING SCRAMBLE!")
        self.send_message_to_game(ActionEnum.PICK_SCRAMBLE_POWERUP, {})

    def use_swap_powerup(self, a: list[int], b: list[int]) -> None:
        # FR49
        # a and b are [row, col]
        print("BOT IS USING SWAP!")
        self.send_message_to_game(ActionEnum.PICK_SWAP_POWERUP, {'tiles': [a, b]})

    def use_rotate_powerup(self, type: str, index: int, rotations: int) -> None:
        # FR49
        print("BOT IS USING ROTATE!")
        assert type in ['row', 'col'], f"Bot's rotate type {type} isn't either row or col!"
        self.send_message_to_game(ActionEnum.PICK_ROTATE_POWERUP, {'type': type, 'index': index, 'rotations': rotations})

    def use_transform_powerup(self, tile, new_char) -> None:
        # FR49
        print(f"BOT IS USING TRANSFORM! Converting to {new_char}")
        self.send_message_to_game(ActionEnum.PICK_TRANSFORM_POWERUP, {'tile': tile, 'new_char': new_char})

    def finish_turn_after_powerup(self) -> None:
        # If we used a transform or swap powerup on the previous turn, then this variable will not be None, and we should send this move
        if self.pre_board_change_found_path is not None:
            time.sleep(1)
            self.send_message_to_game(ActionEnum.PICK_WORD, self.pre_board_change_found_path)
            self.pre_board_change_found_path = None
            return
        else:
            raise Exception("ERROR, the bot is finishing its turn but it didn't have a path planned out! Could this be for a different player's powerup being accepted?")

    def do_turn(self, message: 'Action') -> None:
        self.start_time_s = time.perf_counter()
        message = copy.deepcopy(message)
        if 'lobby' in message.data:
            # Bit of a hack to handle the different dict formats used
            message.data = message.data['lobby']
        game_board: list[list[str]] = message.data['state']['board']
        print(message.data)
        bot_representation_in_lobby: dict[str, Any] = get_player_from_id_dicts(message.data['players'], self.player_id)
        available_money: int = bot_representation_in_lobby['money']
        board_size = message.data['board_size']
        print(f"Bot {self.player_id} is doing turn where the game board is {game_board}, my own representation as a player is {bot_representation_in_lobby}, and I have this much money: {available_money}")
        
        can_afford_rotate: bool = available_money >= POWERUP_COSTS['Rotate']
        can_afford_scramble: bool = available_money >= POWERUP_COSTS['Scramble']
        can_afford_swap: bool = available_money >= POWERUP_COSTS['Swap']
        can_afford_transform: bool = available_money >= POWERUP_COSTS['Transform']

        def is_valid_move(x, y, path) -> bool:
            #print(x, y, path)
            return 0 <= x < board_size and 0 <= y < board_size and (y, x) not in path
        
        def find_word(x: int, y: int, path: list[tuple[int, int]], prefix: str):
            assert path is not None
            #print(f"Bot in find word, path: {path}")
            if not self.check_whether_prefix_is_in_dictionary(prefix):
                if can_afford_swap and can_afford_transform:
                    word_without_last_letter = prefix[:-1]
                    assert self.check_whether_prefix_is_in_dictionary(word_without_last_letter), f'Why is this prefix {word_without_last_letter} not in the dict?!!?! I know {prefix} isnt but without the last letter it should be!'
                    for letter in string.ascii_lowercase:
                        if self.check_whether_prefix_is_in_dictionary(word_without_last_letter + letter):
                            # Great, we can get a word with this.
                            # Remember the path we should be submitting once it's our turn again after this powerup works
                            self.pre_board_change_found_path = path

                            # First, check if we could use a swap with another letter somewhere else on the board that doesn't intersect with our current path. If we can, then we'll do a swap so we can save on currency.
                            for col in range(board_size):
                                for row in range(board_size):
                                    if game_board[row][col].lower() == letter and [col, row] not in path:
                                        # We can do a swap instead of transform!
                                        print(f"DOING SWAP INSTEAD OF TRANSFORM on (row, col) = ({row}, {col})")
                                        self.use_swap_powerup(path[-1], [col, row])
                                        return math.nan, math.nan # Nan signifies that we want to return and do nothing, since we already did an action from within the loop

                            # No other letter exists to swap, so let's just transform this
                            self.use_transform_powerup(path[-1], letter)
                            return math.nan, math.nan # Nan signifies that we want to return and do nothing, since we already did an action from within the loop
                    return None, None
                else:
                    return None, None
            for dx in [-1, 0, 1]:
                for dy in [-1, 0, 1]:
                    if dx == 0 and dy == 0:
                        continue  # Skip the current tile
                    nx, ny = x + dx, y + dy
                    assert path is not None
                    if is_valid_move(nx, ny, path):
                        new_prefix: str = prefix + game_board[nx][ny]
                        assert path is not None
                        new_path = path + [(ny, nx)] # Order is col, row
                        assert new_path is not None, f"Apparently nonnone path {path} plus {[(nx, ny)]} gives a none path"
                        if new_prefix.lower() in self.dictionary and new_prefix.lower() not in self.memory: # This is a full word in the dictionary!
                            if len(new_prefix) >= 5 or len(new_prefix) == 4 and random.random() < 0.02 or len(new_prefix) == 3 and random.random() < 0.01 or len(new_prefix) == 2 and random.random() < 0.002 or len(new_prefix) == 1 and random.random() < 0.0004:
                                return new_prefix, new_path
                        # Continue searching
                        result = find_word(nx, ny, new_path, new_prefix)
                        if isinstance(result[0], float) and math.isnan(result[0]):
                            return math.nan, math.nan # Bubble up the nan return values so we know to stop this call
                        if result[0] is not None and result[1] is not None:
                            return result
            return None, None

        # Check whether we just want the bot to fail to find a word on this turn
        random_number = random.random()
        print(f"Random: {random_number}, fail prob: {self.fail_probability}")
        if random_number < self.fail_probability:
            print(f"Bot purposely fails to find a word and is sleeping for {self.min_time_to_submit_turn} s")
            time.sleep(self.time_limit_s)
            self.send_message_to_game(ActionEnum.END_TURN, {})
            return

        # The search algorithm is akin to how a player looks for words. Trace out a random path and see whether it spells out a known word
        # Try to find a word starting from a random position
        for i in range(2000000):  # Limit attempts
            # print(f"Bot search iteration {i}")
            if can_afford_scramble and i % 100 == 0:
                # Every once in a while, randomly decide whether we want to try swapping the board
                if random.random() < 0.1:
                    self.use_scramble_powerup()
                    return
            if can_afford_rotate and i % 100 == 0:
                if random.random() < 0.1:
                    self.use_rotate_powerup(random.choice(['row', 'col']), random.randint(0, board_size - 1), random.randint(1, board_size - 1))
                    return
            if time.perf_counter() - self.start_time_s >= self.time_limit_s:
                break
            start_x, start_y = random.randint(0, board_size - 1), random.randint(0, board_size - 1)
            start_letter = game_board[start_x][start_y]
            word, path = find_word(start_x, start_y, [(start_y, start_x)], start_letter)
            if isinstance(word, float) and math.isnan(word):
                return # We already sent the game a message from within, so don't send anything here and just return
            if word is not None and path is not None:
                print(f"Found word: {word} at path {path}")
                if time.perf_counter() - self.start_time_s < self.min_time_to_submit_turn:
                    print(f"Sleeping for an additional {self.min_time_to_submit_turn - (time.perf_counter() - self.start_time_s)} s since min time is {self.min_time_to_submit_turn} s and we've only spent {time.perf_counter() - self.start_time_s} s")
                    sleep_time = self.min_time_to_submit_turn - (time.perf_counter() - self.start_time_s)
                    time.sleep(max(sleep_time, 0))
                self.send_message_to_game(ActionEnum.PICK_WORD, path)
                return
        print("Failed to find a word this turn.")
        self.send_message_to_game(ActionEnum.END_TURN, {})
        return

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
            "memory": list(self.memory),
        }



class WordGrid:
    def __init__(self, size: int) -> None:
        self.size = size
        self.grid = self.generate_grid(size)
        self.valid_words = set()  # Words found in the dictionary

    def get_letter(self, row, col) -> str:
        '''Returns the uppercase letter in the cell'''
        return self.grid[row][col]

    def random_letter_with_weights(self) -> str:
        # https://www3.nd.edu/~busiforc/handouts/cryptography/letterfrequencies.html
        letter_weights = {
            'E': 11.1607, 'A': 8.4966, 'R': 7.5809, 'I': 7.5448, 'O': 7.1635,
            'T': 6.9509, 'N': 6.6544, 'S': 5.7351, 'L': 5.4893, 'C': 4.5388,
            'U': 3.6308, 'D': 3.3844, 'P': 3.1671, 'M': 3.0129, 'H': 3.0034,
            'G': 2.4705, 'B': 2.0720, 'F': 1.8121, 'Y': 1.7779, 'W': 1.2899,
            'K': 1.1016, 'V': 1.0074, 'X': 0.2902, 'Z': 0.2722, 'J': 0.1965,
            'Q': 0.1962
        }
        letters, weights = zip(*letter_weights.items())
        return random.choices(letters, weights=weights, k=1)[0]

    def generate_grid(self, size: int) -> list[list[str]]:
        return [
            [self.random_letter_with_weights() for _ in range(size)]
            for _ in range(size)
        ]

    def swap_tiles(self, tile1, tile2) -> None:
        temp = self.get_letter(tile1[0], tile1[1])
        self.set_letter(tile1[0], tile1[1], self.get_letter(tile2[0], tile2[1]))
        self.set_letter(tile2[0], tile2[1], temp)

    def scramble(self) -> None:
        # Collect all letters into a single list
        all_letters = [letter for row in self.grid for letter in row]
        # Shuffle the letters randomly
        random.shuffle(all_letters)

        # Redistribute the letters back into the grid
        for i in range(self.size):
            for j in range(self.size):
                self.grid[i][j] = all_letters[i*self.size + j]

    def rotate(self, type: str, index: int, rotations: int) -> None:
        if type == "row":
            self.rotate_row(index, rotations)
        elif type == "col":
            self.rotate_column(index, rotations)

    def set_letter(self, row: int, col: int, new_letter: str) -> None:
        assert len(new_letter) == 1, f"New letter's length isn't 1! ({new_letter})"
        self.grid[row][col] = new_letter.upper()

    def randomly_replace_letter(self, row: int, col: int) -> None:
        self.grid[row][col] = self.random_letter_with_weights()

    def rotate_row(self, row_index: int, rotations: int) -> None:
        # Ensure rotations are within the bounds of the grid size
        rotations %= self.size
        self.grid[row_index] = self.grid[row_index][-rotations:] + self.grid[row_index][:-rotations]

    def rotate_column(self, col_index: int, rotations: int) -> None:
        # Extract the column
        column = [self.grid[i][col_index] for i in range(self.size)]
        # Ensure rotations are within the bounds of the grid size
        rotations %= self.size
        # Rotate the column
        column = column[-rotations:] + column[:-rotations]
        # Put the column back
        for i in range(self.size):
            self.grid[i][col_index] = column[i]

    # def apply_powerup(self, powerup) -> None:
    #    pass

    def to_json(self) -> Any:
        # return {
        #     "size": self.size,
        #     "grid": self.grid,
        # }
        return self.grid


class GameDictionary(object):
    letter_values = {
        "A": 1,
        "E": 1,
        "I": 1,
        "O": 1,
        "U": 1,
        "L": 1,
        "N": 1,
        "S": 1,
        "T": 1,
        "R": 1,
        "D": 2,
        "G": 2,
        "B": 3,
        "C": 3,
        "M": 3,
        "P": 3,
        "F": 4,
        "H": 4,
        "V": 4,
        "W": 4,
        "Y": 4,
        "K": 5,
        "J": 8,
        "X": 8,
        "Q": 10,
        "Z": 10,
    }
    
    def __init__(self) -> None:
        self.words = self.load_words()

    def load_words(self) -> None:
        return load_words_from_scowl(DICTIONARY_PATH)
    
    def is_valid_word(self, word: str) -> bool:
        return word.lower() in self.words

    def get_word_score(self, word) -> int:
        # Based on the letters used in the word, give the player a score
        sum = 0
        for c in word:
            sum = sum + self.letter_values[c]
        return sum


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
    def __init__(self, action: 'ActionEnum', player_id: str, data: Optional[dict[str, Any]] = None) -> None:
        assert isinstance(action, ActionEnum)
        assert isinstance(player_id, str)
        self.action: str = action.value
        self.player_id = player_id
        self.data = data
        self.sequence_number: int = -1  # This gets set before sending!

    def __str__(self) -> str:
        return f"Action({self.action}, Player ID: {self.player_id}, Data: {self.data}, Sequence: {self.sequence_number})"

    def __repr__(self) -> str:
        return f"Action(action={repr(self.action)}, player_id={repr(self.player_id)}, data={repr(self.data)}, sequence={self.sequence_number})"

    def to_json(self) -> dict[str, Any]:
        return {
            "action": self.action,
            "player_id": self.player_id,
            "data": self.data,
            "sequence_number": self.sequence_number,
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
    ADD_BOT = "add_bot"  # Also sent from server to client
    UPDATE_BOT = "update_bot"
    DELETE_BOT = "delete_bot"
    REMOVE_PLAYER = "remove_player"
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
    LOSE_LIFE = "lose_life"
    END_TURN = "end_turn"
    START_TURN = "start_turn"
    POWERUP_DENIED = "powerup_denied"
    POWERUP_ACTIVATED = "powerup_activated"
    SWAP_POWERUP_ACCEPTED = "swap_powerup_accept"
    TRANSFORM_POWERUP_ACCEPTED = "transform_powerup_accept"
    ROTATE_POWERUP_ACCEPTED = "rotate_powerup_accept"
    SCRAMBLE_POWERUP_ACCEPTED = "scramble_powerup_accept"
    YOU_DIED = "you_died"
    YOU_WIN = "you_win"
