import tornado.ioloop
import tornado.web
import tornado.websocket
from tornado.web import Application
import uuid
import json
import random
import string

from typing import Optional, Any

from models import Lobby, Action, ActionEnum, Player
from tempTestObjects import StaticTestObjects
# Define a WebSocketHandler

def get_random_player_id(length: int = 10) -> str:
    """Generate a random string of letters for a player ID."""
    # Combines uppercase and lowercase letters
    letters = string.ascii_letters
    # Randomly selects letters to create the ID
    player_id = ''.join(random.choice(letters) for i in range(length))
    return player_id

class GameWebSocketHandler(tornado.websocket.WebSocketHandler):
    connections: set['GameWebSocketHandler'] = set()
    lobbies: dict[str, Lobby] = {} # each lobby is assigned to a player UUID
    last_processed_sequence_number: dict[str, int] = {}  # Maps player ID to last processed sequence number
    pending_messages: dict[str, list[Action]] = {}  # Maps player ID to a list of pending Action objects

    # def __init__(self) -> None:

    @classmethod
    def broadcast_to_lobby(cls, lobby_id: str, message: Action) -> None:
        # Broadcast a message to all connections in a specific lobby
        # TODO: Perhaps more efficient way would be to maintain a mapping from lobby IDs to a set of connection, but this is fine for now
        for connection in cls.connections:
            if connection.lobby_id is not None and connection.lobby_id == lobby_id:  # Make sure to set conn.lobby_id when joining a lobby
                connection.send_message(message)

    @classmethod
    def send_to_player_func(cls, player_id: str, message: Action) -> None:
        # TODO: Make more efficient
        for connection in cls.connections:
            if connection.id is not None and connection.id == player_id:
                connection.send_message(message)

    def open(self) -> None:
        # Assign a unique ID to the connection
        self.id = get_random_player_id() #str(uuid.uuid4())
        self.lobby_id: Optional[str] = None
        self.connections.add(self)
        self.sequence_number: int = 0
        print(f"New WebSocket connection with id (new player id): {self.id}")
        # Tell the client what their player ID is
        resp = Action(ActionEnum.RETURN_PLAYER_ID.value, self.id, self.id)
        self.send_message(resp)

    def send_message(self, message: Action) -> None:
        # Sends a message to this specific player attached to this connection
        print(message)
        message.sequence_number = self.sequence_number # Set the monotonic sequence number
        print(f"Sending message #{self.sequence_number} {message} to player {self.id} in lobby {self.lobby_id}")
        self.write_message(json.dumps(message.to_json()))
        self.sequence_number += 1

    def on_message(self, message) -> None:
        # for conn in self.connections:
        #print(message)
        try:
            print(f"Received message '{str(message)}' from {self.id}")
            action = json.loads(str(message))
            action_sequence_number = action['sequence_number']
            player_id = self.id
        except ValueError as e:
            print(f"Error decoding received message: {e}")
            return
        #print(action)
    
        # Initialize sequence tracking if not already done
        if player_id not in GameWebSocketHandler.last_processed_sequence_number:
            GameWebSocketHandler.last_processed_sequence_number[player_id] = -1  # Indicates no messages processed yet
            GameWebSocketHandler.pending_messages[player_id] = []
        
        expected_sequence_number = GameWebSocketHandler.last_processed_sequence_number[player_id] + 1
        if action_sequence_number == expected_sequence_number:
            # We gucci, process message normally
            GameWebSocketHandler.last_processed_sequence_number[player_id] = action_sequence_number
            self.process_message(action)  # You'll implement this based on your existing logic
            self.process_pending_messages(player_id)
        elif action_sequence_number > expected_sequence_number:
            # Message is out of order! Store it until the missing messages arrive
            print(f"Message received out of order! We were expecting number {expected_sequence_number}, but we got {action_sequence_number} so messages have been skipped.")
            GameWebSocketHandler.pending_messages[player_id].append((action_sequence_number, action))
        else:
            # Sequence number is lower than expected, indicating a duplicate or old message
            print(f"Received an old or duplicate message with sequence {action_sequence_number} from player {player_id}")
            raise Exception()
    
    def process_pending_messages(self, player_id: str) -> None:
        # Sort pending messages by their sequence numbers
        self.pending_messages[player_id].sort(key=lambda x: x[0])
        # Check if the next message in the list is the expected one
        while self.pending_messages[player_id] and self.pending_messages[player_id][0][0] == self.last_processed_sequence_number[player_id] + 1:
            _, next_action = self.pending_messages[player_id].pop(0)
            self.process_message(next_action)
            self.last_processed_sequence_number[player_id] += 1

    def process_message(self, action_dict: dict[str, Any]) -> None:
        # Match message to the set of valid actions
        if 'data' not in action_dict:
            action_dict['data'] = None
        action = Action(ActionEnum(action_dict['action']), action_dict['player_id'], action_dict['data'])
        actionEnum = ActionEnum(action_dict['action'])
        if actionEnum in [ActionEnum.INITIALIZE, ActionEnum.JOIN_LOBBY, ActionEnum.LEAVE_LOBBY, ActionEnum.REMOVE_PLAYER]:
            # These actions are handled outside of a lobby or game, so we just handle them right here
            if actionEnum == ActionEnum.INITIALIZE:
                # Generate a unique 4-letter lobby code
                while True:
                    lobby_code = ''.join(random.choices(
                        string.ascii_uppercase, k=4))
                    if lobby_code not in self.lobbies:
                        break  # Exit the loop if the generated code is unique
                #lobby_code = "ABCD" # TODO: REMOVE
                # Initialize the lobby with the generated code
                print(f"Initializing a lobby with code {lobby_code}")
                self.lobbies[lobby_code] = Lobby(self.id, lobby_code)
                self.lobbies[lobby_code].set_broadcast_function(GameWebSocketHandler.broadcast_to_lobby)
                self.lobbies[lobby_code].set_send_to_player_func(GameWebSocketHandler.send_to_player_func)
                print(f"Created a new player class and added them to the lobby they just created")
                # Create a new player, and add them to the lobby they just created
                if action.data is None or 'player_name' not in action.data:
                    raise Exception("Please specify the player_name field in the data!")
                p = Player(self.id, action.data['player_name'])
                p.set_send_message_func(GameWebSocketHandler.send_to_player_func)
                self.lobbies[lobby_code].add_player(p)
                self.lobby_id = lobby_code
                # Send them back the lobby code we created for them
                resp = Action(ActionEnum.RETURN_LOBBY_CODE.value, self.id, lobby_code)
                self.send_message(resp)
                # Tell the player they joined their own lobby. Technically we should be telling everyone within the lobby, but it's only the player in there right now.
                resp = Action(ActionEnum.SUCCESSFULLY_JOINED_LOBBY.value, self.id, {"lobby_code": lobby_code, "player_name": action.data['player_name'], "lobby": self.lobbies[lobby_code].to_json()})
                self.send_message(resp)
            elif actionEnum == ActionEnum.JOIN_LOBBY:
                # The player is trying to join an existing lobby
                lobby_id = action.data['lobby_code']
                player_name = action.data['player_name']
                if lobby_id in self.lobbies:
                    p = Player(self.id, player_name)
                    p.set_send_message_func(GameWebSocketHandler.send_to_player_func)
                    self.lobbies[lobby_id].add_player(p)
                    self.lobby_id = lobby_id
                    resp = Action(ActionEnum.SUCCESSFULLY_JOINED_LOBBY.value, self.id, {"lobby_code": lobby_id, "player_name": action.data['player_name'], "lobby": self.lobbies[lobby_id].to_json()})
                    GameWebSocketHandler.broadcast_to_lobby(self.lobby_id, resp)
                else:
                    resp = Action(ActionEnum.LOBBY_DOES_NOT_EXIST.value, self.id, None)
                    self.send_message(resp)
            elif actionEnum == ActionEnum.LEAVE_LOBBY:
                # The player is trying to leave the lobby
                assert action.data['lobby_code'] == self.lobby_id, f"The lobby code the client passed to leave of {action.data['lobby_code']} doesn't match the client's actual current lobby {self.lobby_id}!"
                if self.lobby_id in self.lobbies:
                    lobby = self.lobbies[self.lobby_id]
                    # Send a message to this player letting them know they successfully left the lobby
                    #for player in lobby.players:
                    #    if player.player_id == self.id:
                    #        msg = Action(ActionEnum.PLAYER_LEFT.value, player.player_id, {"lobby_code": self.lobby_id})
                    #        player.send_message(msg)
                    # Remove the player from the lobby's list of players
                    #lobby.players = [p for p in lobby.players if p.player_id != self.id]
                    is_host_leaving = lobby.remove_player(self.id)

                    if is_host_leaving:
                        print(f"Lobby {self.lobby_id} deleted as the host has left.")
                        # Send a message to each player saying that they were removed from the game
                        for player in lobby.players:
                            msg = Action(ActionEnum.PLAYER_LEFT.value, player.player_id, {"lobby_code": self.lobby_id})
                            player.send_message(msg)
                        # Delete the lobby if the host is leaving
                        del lobby
                    else:
                        # Broadcast to all players (including the original player) that this player has left the lobby
                        leave_message = Action(ActionEnum.PLAYER_LEFT.value, self.id, {"lobby_code": self.lobby_id})
                        self.broadcast_to_lobby(self.lobby_id, leave_message)

                    self.lobby_id = None  # Clear the player's lobby_id since they've left the lobby
                else:
                    print(f"Player {self.id} attempted to leave a lobby but wasn't part of any.")
                    # Send a message back to the player that they weren't in a lobby
                    error_resp = Action(ActionEnum.ERROR.value, self.id, "Not part of any lobby to leave.")
                    self.send_message(error_resp)
            elif actionEnum == ActionEnum.REMOVE_PLAYER:
                # The host sent a message to remove another player
                assert action.player_id == self.lobbies[self.lobby_id].host, f"Only the host can remove bots or players! Player of id {action.player_id} is not the host who has id {self.lobbies[self.lobby_id].host}"
                assert action.data['player_id'] == self.lobby_id, f"The lobby code the client passed to leave of {action.data['lobby_code']} doesn't match the client's actual current lobby {self.lobby_id}!"
                assert action.player_id != action.data['player_id'], f"The lobby host shouldn't be removing themself with this method! Please send the leave lobby message instead, thx."
                if self.lobby_id in self.lobbies:
                    lobby = self.lobbies[self.lobby_id]
                    is_host_leaving = lobby.remove_player(self.id)
                    assert not is_host_leaving, f"This shouldn't be the host!!"
                    # Broadcast to all players (including the original player) that this player has left the lobby
                    leave_message = Action(ActionEnum.REMOVE_PLAYER.value, self.id, {"lobby", lobby.to_json()})
                    self.broadcast_to_lobby(self.lobby_id, leave_message)

                else:
                    print(f"Player {self.id} attempted to kick someone out of a lobby, but wasn't themselves part of any.")
                    # Send a message back to the player that they weren't in a lobby
                    error_resp = Action(ActionEnum.ERROR.value, self.id, "Not part of any lobby when doing action!")
                    self.send_message(error_resp)
            elif actionEnum == ActionEnum.READY_LOBBY:
                # The owner of the lobby is trying to start the game.
                # Assert that the person starting the game is also the lobby owner
                assert self.lobbies[self.lobby_id].host == self.id
                resp = Action(ActionEnum.START_GAME, -1, None)
                GameWebSocketHandler.broadcast_to_lobby(self.lobby_id, resp)
                # Call the game logic to start the game
                self.lobbies[self.lobby_id].start_game()
                #self.send_message(resp)
        else:
            # These are in-game or in-lobby actions, so we should delegate handling them within the lobbies and not in here
            if self.lobby_id in self.lobbies:
                self.lobbies[self.lobby_id].handle_action(self.id, actionEnum, action)
            else:
                print(f"Lobby {self.lobby_id} not found for action {actionEnum}.")

    def on_close(self) -> None:
        self.connections.remove(self)
        print(f"WebSocket connection {self.id} closed")
        # TODO: handle removing a player from their lobby in the game logic, since the game/lobby needs to react to a player disconnecting (e.g. redistributing player turns)

    def check_origin(self, origin) -> bool:
        # Allow connections from any origin
        # TODO: Maybe tighten this up?
        return True

# Define the MainHandler for HTTP requests


class MainHandler(tornado.web.RequestHandler):
    def get(self) -> None:
        # Simple HTTP GET handler
        self.write("Welcome to Lexicon Labyrinth!")

# Create the Tornado application and define routes


def make_app() -> Application:
    return tornado.web.Application([
        (r"/", MainHandler),
        (r"/websocket", GameWebSocketHandler),  # WebSocket route
    ])


if __name__ == "__main__":
    random.seed(0)
    app = make_app()
    app.listen(8888)  # Specify the port to listen on
    print("Lexicon Labyrinth server is running on http://localhost:8888")
    tornado.ioloop.IOLoop.current().start()
