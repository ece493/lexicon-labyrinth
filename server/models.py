import random
import string
import time

from enum import Enum, auto
from typing import Optional, Callable, Any

#from server import GameWebSocketHandler

PLAYER_LIMIT = 5
DICTIONARY_PATH = "dictionary.txt"

POWERUP_COSTS = {
    "Rotate": 1,
    "Scramble": 1,
    "Swap": 1,
    "Transform": 1
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
    
    def handle_action(self, player_id: str, actionEnum: 'ActionEnum', action: 'Action') -> None:
        if actionEnum in [ActionEnum.CHANGE_PARAM, ActionEnum.READY_LOBBY]:
            if actionEnum == ActionEnum.CHANGE_PARAM:
                # The owner of the lobby is trying to change the lobby's settings
                self.change_lobby_settings(action.data)
            elif actionEnum == ActionEnum.READY_LOBBY:
                assert self.host == player_id, f"Error! Player who tried to start game ({player_id}) is not the host of the lobby ({self.host})!"
                self.start_game()
        elif actionEnum in [ActionEnum.PICK_WORD, ActionEnum.PICK_TRANSFORM_POWERUP, ActionEnum.PICK_ROTATE_POWERUP, ActionEnum.PICK_SCRAMBLE_POWERUP, ActionEnum.PICK_SWAP_POWERUP, ActionEnum.END_TURN]:
            self.game.handle_action(player_id, actionEnum, action)
        else:
            print(f"Action {action} cannot be handled by the lobby nor the game!")

    def to_json(self) -> dict[str, Any]:
        # SHOULD BE UNUSED!
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
        # Initialize bot with specified difficulty
        # Add them to the list of players
        # Send a message to all players saying a new bot player joined
        pass  # TODO
    
    def remove_bot(self, bot_id) -> None:
        # Remove bot
        # Send message to all players saying the bot left
        pass  # TODO

    def set_broadcast_function(self, func: Callable) -> None:
        self.broadcast_func = func
    
    def set_send_to_player_func(self, func: Callable) -> None:
        self.send_to_player_func = func

    def start_game(self) -> None:
        # Ensure broadcast_func is set before starting the game
        print(f"Starting the game in lobby {self.lobby_id}")
        assert self.broadcast_func is not None, "Broadcast function wasn't set before starting the game!"
        self.game = Game(self.lobby_id, self.players, self.broadcast_func, self.send_to_player_func, self.board_size, self.max_lives, self.host, self.timer_setting)
        self.game.start_game()
        self.is_in_game = True

    @property
    def is_full(self) -> bool:
        return len(self.players) >= PLAYER_LIMIT


class Game:
    def __init__(self, lobby_id: str, players: list['Player'], broadcast_func: Callable, send_to_player_func: Callable, board_size: int, max_lives: int, host: str, timer_setting: float) -> None:
        self.lobby_id: str = lobby_id
        self.players: list['Player'] = players
        self.broadcast_func: Callable = broadcast_func  # Callback function for broadcasting messages
        self.send_to_player_func: Callable = send_to_player_func  # Callback to send message to specific player
        self.board_size: int = board_size
        self.board: WordGrid = WordGrid(board_size)
        self.max_lives: int = max_lives
        self.host: str = host
        self.timer_setting: float = timer_setting
        self.current_player_index: int = 0
        self.turn_modulus: int = len(players)
        self.dictionary = GameDictionary()
    
    #def initialize_random_board(self) -> None:

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
        start_game_message = Action(ActionEnum.START_GAME.value, self.host, self.to_json())
        # Send the initial game state, including the board, to all players
        self.broadcast_func(self.lobby_id, start_game_message)
        # Transition from WAITING_FOR_PLAYERS to TURN_START
        self.state = GameState.TURN_START
        self.next_turn()

    def find_next_non_spectator_player_index(self, start_index: int = 0) -> int:
        """Finds the next non-spectator player starting from a given index."""
        next_index = start_index
        for _ in range(len(self.players)):  # Prevent infinite loops
            if not self.players[next_index].is_spectator:
                return next_index  # Found a non-spectator player
            next_index = (next_index + 1) % len(self.players)
        return -1  # In case all players are spectators or list is empty

    def get_next_non_spectator_player(self) -> tuple[int, Optional['Player']]:
        """Returns the next non-spectator player's index and object."""
        next_index = self.find_next_non_spectator_player_index(self.current_player_index)
        if next_index != -1:
            return next_index, self.players[next_index]
        else:
            return -1, None  # No non-spectator player found

    def next_turn(self) -> None:
        """Transitions to the next player's turn, skipping spectators."""
        next_index, next_player = self.get_next_non_spectator_player()
        if next_player is not None:
            self.current_player_index = next_index  # Update to the next player's index
            self.state = GameState.WAITING_FOR_MOVE
            # Inform all players whose turn it is now
            self.broadcast_func(self.lobby_id, Action(ActionEnum.START_TURN.value, next_player.player_id, self.to_json()))
        else:
            # Handle the scenario where no non-spectator players are found
            pass  # This could involve checking game end conditions or handling errors
            raise Exception("No players remaining!")
            #self.winner_determined()

    def handle_action(self, player_id: str, actionEnum: 'ActionEnum', action: 'Action') -> None:
        if actionEnum == ActionEnum.PICK_WORD:
            self.process_word_choice(player_id, action.data)
        elif actionEnum == ActionEnum.PICK_ROTATE_POWERUP:
            self.apply_rotate_powerup(player_id, action.data)
        elif actionEnum == ActionEnum.PICK_SCRAMBLE_POWERUP:
            self.apply_scramble_powerup(player_id, action.data)
        elif actionEnum == ActionEnum.PICK_SWAP_POWERUP:
            self.apply_swap_powerup(player_id, action.data)
        elif actionEnum == ActionEnum.PICK_TRANSFORM_POWERUP:
            self.apply_transform_powerup(player_id, action.data)
        elif actionEnum == ActionEnum.END_TURN:
            # The player ran out of time and needs to be eliminated
            self.eliminate_player(player_id)
            # TODO: Move onto the next player's turn!
        else:
            print(f"Game cannot handle this unknown action: {action}")

    def transition_to_next_player(self) -> None:
        """Transitions to the next player's turn."""
        print(f"Transitioning to next player from {self.current_player_index}")
        self.current_player_index = (self.current_player_index + 1) % len(self.players)

        self.inform_player_turn()

    def inform_player_turn(self) -> None:
        """Informs the current player that it's their turn."""
        print(f"Informing player at index {self.current_player_index} that it's their turn")
        # Ensure we skip spectators
        while self.players[self.current_player_index].is_spectator:
            self.current_player_index = (self.current_player_index + 1) % len(self.players)

        current_player = self.players[self.current_player_index]
        self.broadcast_func(self.lobby_id, Action(ActionEnum.START_TURN.value, current_player.player_id, {"message": "Your turn"}))
        self.state = GameState.WAITING_FOR_MOVE

    def retry_current_player_turn(self) -> None:
        """Allows the current player to retry their turn after a rejected move or using a power-up."""
        self.inform_player_turn()  # It's still the current player's turn

    def handle_player_elimination_or_time_out(self, player_id) -> None:
        """Handles the scenario where a player is eliminated or runs out of time."""
        # Implement player elimination logic
        # This is a placeholder for any additional logic you may need for player elimination
        # TODO: Implement additional player elimination logic here if necessary

        # Remove the player or deduct life
        self.remove_player_or_deduct_life(player_id)

        # Check if the game is over or if we should move to the next player's turn
        if self.check_for_game_end():
            self.end_game()
        else:
            self.transition_to_next_player()

    def process_word_choice(self, player_id, move_data) -> None:
        assert self.state == GameState.WAITING_FOR_MOVE, f"In process move, the current state of {self.state} isn't the expected of WAITING_FOR_MOVE!"
        # Logic to check if the move is valid
        print(f"Processing move: {move_data}")
        word_to_check = ""
        for (col, row) in move_data:
            word_to_check += self.board.get_letter(row, col)
        move_valid = self.dictionary.is_valid_word(word_to_check)
        if move_valid:
            money_to_give_player = self.dictionary.get_word_score(word_to_check)
            # Now that the word is selected, we need to replace the letters used with new random letters
            for (col, row) in move_data:
                self.board.randomly_replace_letter(row, col)
            # TODO: Give the money to the player
            self.broadcast_func(self.lobby_id, Action(ActionEnum.WORD_ACCEPTED.value, player_id, {'lobby': self.to_json(), 'path': move_data}))
            self.state = GameState.TURN_END
            #self.winner_determined()
            self.transition_to_next_player()
        else:
            self.send_to_player_func(player_id, Action(ActionEnum.WORD_DENIED.value, player_id, self.to_json()))
            self.state = GameState.MOVE_REJECTED
            self.retry_current_player_turn()

    def winner_determined(self, winner: 'Player') -> None:
        self.state = GameState.GAME_OVER
        winner_player_id = winner.player_id
        self.broadcast_func(self.lobby_id, Action(ActionEnum.YOU_WIN.value, winner_player_id, self.to_json()))
        #else:
        #    self.state = GameState.TURN_START
        #    self.current_player_index = (self.current_player_index + 1) % len(self.players)
        #    self.next_turn()

    def eliminate_player(self, player_id) -> None:
        self.players = [player for player in self.players if player.player_id != player_id]
        remaining_players = [player for player in self.players if not player.is_spectator]
        if len(remaining_players) == 1:
            # Last player standing
            self.winner_determined(remaining_players[0])
        else:
            # Adjust the current player index if necessary
            #self.adjust_current_player_index_after_elimination(player_id)
            # TODO: Move onto the next player's turn!
            pass

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
        player = next((p for p in self.players if p.player_id == player_id), None)
        if player is not None and player.currency >= cost:
            player.currency -= cost
            return True
        return False

    def apply_rotate_powerup(self, player_id: str, data: dict) -> None:
        cost = POWERUP_COSTS["Rotate"]
        if self.check_and_deduct_funds(player_id, cost):
            # Apply rotation logic here based on 'data'
            assert data['type'] in ['row', 'col'], f"Rotate powerup type not either 'row' or 'col'!"
            self.board.rotate(data['type'], data['index'], data['rotations'])

            # Broadcast success message to ALL players
            self.broadcast_func(self.lobby_id, Action(ActionEnum.ROTATE_POWERUP_ACCEPTED.value, player_id, {'lobby': self.to_json(), 'powerup_data': data}))
        else:
            # Broadcast denial due to insufficient funds
            self.broadcast_func(self.lobby_id, Action(ActionEnum.POWERUP_DENIED.value, player_id, self.to_json()))

    def apply_transform_powerup(self, player_id: str, data: dict) -> None:
        tile = data['tile']
        new_char = data['new_char']
        cost = POWERUP_COSTS["Transform"]
        if self.check_and_deduct_funds(player_id, cost):
            # Apply transform logic here
            self.board.set_letter(tile[0], tile[1], new_char)
            # Broadcast success message
            self.broadcast_func(self.lobby_id, Action(ActionEnum.TRANSFORM_POWERUP_ACCEPTED.value, player_id, {'lobby': self.to_json(), 'powerup_data': data}))
            pass
        else:
            # Broadcast denial due to insufficient funds
            self.broadcast_func(self.lobby_id, Action(ActionEnum.POWERUP_DENIED.value, player_id, self.to_json()))

    def apply_swap_powerup(self, player_id: str, data: list) -> None:
        cost = POWERUP_COSTS["Swap"]
        if self.check_and_deduct_funds(player_id, cost):
            # Apply swap logic here
            self.board.swap_tiles(data['tiles'][0], data['tiles'][1])
            # Broadcast success message
            self.broadcast_func(self.lobby_id, Action(ActionEnum.SWAP_POWERUP_ACCEPTED.value, player_id, {'lobby': self.to_json(), 'powerup_data': data}))
        else:
            # Broadcast denial due to insufficient funds
            self.broadcast_func(self.lobby_id, Action(ActionEnum.POWERUP_DENIED.value, player_id, self.to_json()))

    def apply_scramble_powerup(self, player_id: str) -> None:
        cost = POWERUP_COSTS["Scramble"]
        if self.check_and_deduct_funds(player_id, cost):
            # Apply scramble logic here
            self.board.scramble()
            # Broadcast success message
            self.broadcast_func(self.lobby_id, Action(ActionEnum.SCRAMBLE_POWERUP_ACCEPTED.value, player_id, self.to_json()))
        else:
            # Broadcast denial due to insufficient funds
            self.broadcast_func(self.lobby_id, Action(ActionEnum.POWERUP_DENIED.value, player_id, self.to_json()))


    # def to_json(self) -> dict[str, Any]:
    #     return {
    #         "lobby_id": self.lobby_id,
    #         "players": [player.to_json() for player in self.players],
    #         "board_size": self.board_size,
    #         "board": self.board.to_json() if self.board else None,
    #     }
    def to_json(self) -> dict[str, Any]:
        state = {
            "curr_turn": 0, # TODO, index of player of whose turn it is
            "board": self.board.to_json() if self.board else None,
            "timer": 123.4,
            "memory": [],
        }
        game_stat_dict = {
            "state": state,
            "max_lives": self.max_lives,
            "host": self.host,
            "board_size": self.board_size,
            "timer_setting": self.timer_setting,
            "lobby_code": self.lobby_id,
            "players": [player.to_json() for player in self.players]
        }
        return game_stat_dict


class Player(object):
    def __init__(self, player_id, name) -> None:
        self.player_id = player_id
        self.name = name
        self.is_bot = False
        self.is_spectator = False
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
            "id": self.player_id,
            "name": self.name,
            "is_spectator": self.is_spectator,
            "is_bot": self.is_bot,
            "lives": self.lives,
            "money": self.currency,
            "score": self.score,
        }


class Bot(Player, object):
    def __init__(self, player_id, name, difficulty) -> None:
        super().__init__(player_id, name)
        self.is_bot = True
        self.difficulty = difficulty
        self.memory: list[str] = []
        # Additional properties and methods specific to bot behavior

    def send_message(self, message) -> None:
        # Send a message from the game to the bot
        # For local bots, directly process the message
        print(f"Bot with name {self.name} and id {self.player_id} received message: {message}")
        self.process_bot_action(message)

    def process_bot_action(self, message) -> None:
        # Process the message and simulate a bot response/action
        print(f"Bot is processing message {message}")
        pass

    def to_json(self) -> dict[str, Any]:
        return {
            "id": self.player_id,
            "name": self.name,
            "is_spectator": self.is_spectator,
            "is_bot": self.is_bot,
            "lives": self.lives,
            "money": self.currency,
            "score": self.score,
            "difficulty": self.difficulty,
            "memory": self.memory,
        }


class WordGrid:
    def __init__(self, size: int) -> None:
        self.size = size
        self.grid = self.generate_grid(size)
        self.valid_words = set()  # Words found in the dictionary
    
    def get_letter(self, row, col) -> str:
        '''Returns the uppercase letter in the cell'''
        return self.grid[row][col]

    def random_letter_with_weights() -> str:
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
        self.grid[row][col] = new_letter

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

    #def apply_powerup(self, powerup) -> None:
    #    pass

    def to_json(self) -> Any:
        # return {
        #     "size": self.size,
        #     "grid": self.grid,
        # }
        return self.grid


class GameDictionary(object):
    def __init__(self) -> None:
        self.words = self.load_words()
    
    def load_words(self) -> None:
        # Load words from the SCOWL dataset
        words = []
        start_processing = False
        with open(DICTIONARY_PATH, 'r', encoding='utf8') as file:
            for line in file:
                # Strip newline and other trailing whitespace characters
                line = line.strip()
                if start_processing:
                    if line:  # Check if the line is not empty
                        words.append(line)
                elif line == '---':
                    start_processing = True
        return words
    
    def is_valid_word(self, word: str) -> bool:
        return word.lower() in self.words
    
    def get_word_score(self, word) -> int:
        # Based on the letters used in the word and how long it is, give the player a score
        return len(word)


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
        self.action = action
        self.player_id = player_id
        self.data = data
        self.sequence_number: int = -1 # This gets set before sending!

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
    SWAP_POWERUP_ACCEPTED = "swap_powerup_accept"
    TRANSFORM_POWERUP_ACCEPTED = "transform_powerup_accept"
    ROTATE_POWERUP_ACCEPTED = "rotate_powerup_accept"
    SCRAMBLE_POWERUP_ACCEPTED = "scramble_powerup_accept"
    YOU_DIED = "you_died"
    YOU_WIN = "you_win"
