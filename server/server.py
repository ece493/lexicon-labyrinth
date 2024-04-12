import tornado.ioloop
import tornado.web
import tornado.websocket
from tornado.web import Application
import uuid
import json
import random
import string
import itertools

from typing import Optional, Any

from models import Lobby, Action, ActionEnum, Player
from tempTestObjects import StaticTestObjects

from utils import *
# Define a WebSocketHandler

# TODO: Delete finished lobbies/games from the list

def get_player_from_id(player_list: list[Player], player_id: str) -> Player | None:
    for player in player_list:
        if player.player_id == player_id:
            return player
    return None

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
        # for connection in cls.connections:
        #     if connection.lobby_id is not None and connection.lobby_id == lobby_id:  # Make sure to set conn.lobby_id when joining a lobby
        #         message.player_id = connection.id # Overwrite the player ID to be the ID of the player we're sending this to
        #         connection.send_message(message)

        #if message.action == ActionEnum.WORD_DENIED.value:
        #    print(f"BROADCASTING WORD DENIED MESSAGE: {message}")
        print("\nBroadcasting message to lobby!")
        for lobby in cls.lobbies.values():
            #print(f"Checking lobby {lobby.lobby_id=} {lobby_id=}")
            if lobby.lobby_id == lobby_id:
                # Since players are asynchronous and bots are synchronous, we need to first send the message to ALL the players, before sending to the bots one at a time.
                # If it's the bot's turn, only one of the bots will perform a synchronous action.
                # We just want to avoid the situation where a bot gets the message that it's their turn, and it does the action BEFORE the player after the bot in the list even was told it's the bot's turn!
                # And yes this was a bug that took hours to fix, RIP
                non_bot_players: list[Player] = []
                bot_players: list[Player] = []
                for player in lobby.players:
                    if player.is_bot:
                        bot_players.append(player)
                    else:
                        non_bot_players.append(player)
                for player in itertools.chain(non_bot_players, bot_players):
                    message.player_id = player.player_id  # Overwrite the player ID to be the ID of the player we're sending this to
                    player.send_message(message)
                print("End broadcast\n")
                return
        raise Exception("Lobby to broadcast to is not in the list of lobbies!")

    @classmethod
    def send_to_player_func(cls, player_id: str, message: Action) -> None:
        # TODO: Make more efficient
        for connection in cls.connections:
            if connection.id is not None and connection.id == player_id:
                message.player_id = player_id # Overwrite the player ID to be the ID of the player we're sending this to
                connection.send_message(message)
                return
        #raise Exception("Player to send to is not in the list of connections!")

    @classmethod
    def garbage_collect_lobbies(cls) -> None:
        original_lobby_amount = len(cls.lobbies)
        cls.lobbies = {lobby_code: lobby for lobby_code, lobby in cls.lobbies.items() if not lobby.game_complete}
        print(f"Running lobby garbage collection! Went from {original_lobby_amount} lobbies down to {len(cls.lobbies)}")


    def open(self) -> None:
        # Assign a unique ID to the connection
        self.id = get_random_player_id() #str(uuid.uuid4())
        self.lobby_id: Optional[str] = None
        self.connections.add(self)
        self.sequence_number: int = 0
        print(f"New WebSocket connection with id (new player id): {self.id}")
        # Tell the client what their player ID is
        resp = Action(ActionEnum.RETURN_PLAYER_ID, self.id, self.id)
        self.send_message(resp)

    def send_message(self, message: Action) -> None:
        # Sends a message to this specific player attached to this connection
        #print(message)
        message.sequence_number = self.sequence_number # Set the monotonic sequence number
        print(f"Sending message #{self.sequence_number} {message} to player {self.id} in lobby {self.lobby_id}")
        #try:
        self.write_message(json.dumps(message.to_json()))
        #except Exception as e:
        #    print(f"Exception while sending message to websocket: {e}, and the exception type is {type(e)}")
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
        # if action_sequence_number == expected_sequence_number:



        # We gucci, process message normally
        GameWebSocketHandler.last_processed_sequence_number[player_id] = action_sequence_number
        self.process_message(action)
        self.process_pending_messages(player_id)


        # elif action_sequence_number > expected_sequence_number:
        #     # Message is out of order! Store it until the missing messages arrive
        #     print(f"Message received out of order! We were expecting number {expected_sequence_number}, but we got {action_sequence_number} so messages have been skipped.")
        #     GameWebSocketHandler.pending_messages[player_id].append((action_sequence_number, action))
        # else:
        #     # Sequence number is lower than expected, indicating a duplicate or old message
        #     print(f"Received an old or duplicate message with sequence {action_sequence_number} from player {player_id}")
        #     raise Exception()
    
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
                GameWebSocketHandler.garbage_collect_lobbies()
                # Generate a unique 4-letter lobby code
                while True:
                    lobby_code = ''.join(random.choices(string.ascii_uppercase, k=4))
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
                success = self.lobbies[lobby_code].add_player(p)
                assert success, f"How come failed to add the host of the lobby to the lobby they just created?!"
                self.lobby_id = lobby_code
                # Send them back the lobby code we created for them
                resp = Action(ActionEnum.RETURN_LOBBY_CODE, self.id, lobby_code)
                self.send_message(resp)
                # Tell the player they joined their own lobby. Technically we should be telling everyone within the lobby, but it's only the player in there right now.
                resp = Action(ActionEnum.SUCCESSFULLY_JOINED_LOBBY, self.id, {"lobby_code": lobby_code, "player_name": action.data['player_name'], "lobby": self.lobbies[lobby_code].to_json()})
                self.send_message(resp)
            elif actionEnum == ActionEnum.JOIN_LOBBY:
                # The player is trying to join an existing lobby
                lobby_id = action.data['lobby_code']
                player_name = action.data['player_name']
                if lobby_id in self.lobbies:
                    p = Player(self.id, player_name)
                    p.set_send_message_func(GameWebSocketHandler.send_to_player_func)
                    if self.lobbies[lobby_id].add_player(p):
                        self.lobby_id = lobby_id
                        resp = Action(ActionEnum.SUCCESSFULLY_JOINED_LOBBY, self.id,
                                    {"lobby_code": lobby_id,
                                    "player_name": action.data['player_name'],
                                    "lobby": self.lobbies[lobby_id].to_json()})
                        GameWebSocketHandler.broadcast_to_lobby(self.lobby_id, resp)
                    else:
                        resp = Action(ActionEnum.LOBBY_IS_FULL, self.id, {})
                        self.send_message(resp)
                else:
                    resp = Action(ActionEnum.LOBBY_DOES_NOT_EXIST, self.id, None)
                    self.send_message(resp)
            elif actionEnum == ActionEnum.LEAVE_LOBBY:
                # The player is trying to leave the lobby
                print("Processing the player leaving the lobby.")
                assert action.data['lobby_code'] == self.lobby_id, f"The lobby code the client passed to leave of {action.data['lobby_code']} doesn't match the client's actual current lobby {self.lobby_id}!"
                if self.lobby_id in self.lobbies:
                    lobby = self.lobbies[self.lobby_id]
                    # Send a message to this player letting them know they successfully left the lobby
                    #for player in lobby.players:
                    #    if player.player_id == self.id:
                    #        msg = Action(ActionEnum.PLAYER_LEFT, player.player_id, {"lobby_code": self.lobby_id})
                    #        player.send_message(msg)
                    # Remove the player from the lobby's list of players
                    #lobby.players = [p for p in lobby.players if p.player_id != self.id]
                    is_host_leaving = lobby.remove_player(self.id)

                    if is_host_leaving:
                        print(f"Lobby {self.lobby_id} deleted as the host has left.")
                        # Send a message to each player saying that they were removed from the game
                        for player in lobby.players:
                            msg = Action(ActionEnum.REMOVE_PLAYER, player.player_id, {"player_id_removed": player.player_id, "lobby": lobby.to_json()})
                            player.send_message(msg)
                        # Delete the lobby if the host is leaving
                        del lobby
                    else:
                        # Broadcast to all players (including the original player) that this player has left the lobby
                        leave_message = Action(ActionEnum.REMOVE_PLAYER, self.id, {"player_id_removed": self.id, "lobby": lobby.to_json()})
                        self.broadcast_to_lobby(self.lobby_id, leave_message)

                    self.lobby_id = None  # Clear the player's lobby_id since they've left the lobby
                else:
                    print(f"Player {self.id} attempted to leave a lobby but wasn't part of any.")
                    # Send a message back to the player that they weren't in a lobby
                    error_resp = Action(ActionEnum.ERROR, self.id, "Not part of any lobby to leave.")
                    self.send_message(error_resp)
            elif actionEnum == ActionEnum.REMOVE_PLAYER:
                # The host sent a message to remove another player
                assert action.player_id == self.lobbies[self.lobby_id].host, f"Only the host can remove bots or players! Player of id {action.player_id} is not the host who has id {self.lobbies[self.lobby_id].host}"
                assert action.data['lobby_code'] == self.lobby_id, f"The lobby code the client passed to leave of {action.data['lobby_code']} doesn't match the client's actual current lobby {self.lobby_id}!"
                assert action.player_id != action.data['player_id'], f"The lobby host shouldn't be removing themself with this method! Please send the leave lobby message instead, thx."
                if self.lobby_id in self.lobbies:
                    lobby = self.lobbies[self.lobby_id]
                    player_to_kick = get_player_from_id(lobby.players, action.data['player_id'])
                    is_host_leaving = lobby.remove_player(action.data['player_id'])
                    assert not is_host_leaving, f"This shouldn't be the host!!"
                    # Broadcast to all players (including the original player) that this player has left the lobby
                    leave_message = Action(ActionEnum.REMOVE_PLAYER, self.id, {"lobby": lobby.to_json(), "player_id_removed": action.data['player_id']})
                    self.broadcast_to_lobby(self.lobby_id, leave_message)
                    # Since the player was removed from the lobby, they didn't receive the broadcast. Send the message to them separately.
                    if player_to_kick is not None:
                        player_to_kick.send_message(leave_message)
                    else:
                        raise Exception(f"The player to kick was None for some reason! Can't send them a message kicking them.")
                else:
                    print(f"Player {self.id} attempted to kick someone out of a lobby, but wasn't themselves part of any.")
                    # Send a message back to the player that they weren't in a lobby
                    error_resp = Action(ActionEnum.ERROR, self.id, "Not part of any lobby when doing action!")
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
        for lobby_code, lobby in self.lobbies.items():
            for player in lobby.players:
                if player.player_id == self.id:
                    if lobby.is_in_game and player.lives > 0:
                        print("Eliminating player from in-game")
                        lobby.game.eliminate_player(self.id)
                        GameWebSocketHandler.broadcast_to_lobby(lobby_code, Action(ActionEnum.PLAYER_LEFT, self.id, {'lobby': lobby.game.to_json(), 'lobby_code': lobby_code}))
                    elif not lobby.is_in_game:
                        # In the lobby
                        print("Eliminating player from lobby")
                        self.process_message({'action': 'leave_lobby', 'player_id': self.id, 'data': {'lobby_code': self.lobby_id}})
                        #GameWebSocketHandler.broadcast_to_lobby(lobby_code, Action(ActionEnum.REMOVE_PLAYER, self.id, {'lobby': lobby.to_json(), 'player_id_removed': self.id}))
        self.connections.remove(self)
        print(f"WebSocket connection {self.id} closed. Current list of connections: {self.connections}")
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
