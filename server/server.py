import tornado.ioloop
import tornado.web
import tornado.websocket
from tornado.web import Application
import uuid
import jsonpickle
import random
import string

from typing import Optional

from models import Lobby, Action, ActionEnum, Player

# Define a WebSocketHandler
class GameWebSocketHandler(tornado.websocket.WebSocketHandler):
    connections: set['GameWebSocketHandler'] = set()
    lobbies: dict[str, Lobby] = {} # each lobby is assigned to a player UUID

    #def __init__(self) -> None:

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
        self.id = str(uuid.uuid4())
        self.lobby_id: Optional[str] = None
        self.connections.add(self)
        self.sequence: int = 0
        print(f"New WebSocket connection with id (new player id): {self.id}")
        # Tell the client what their player ID is
        resp = Action(ActionEnum.RETURN_PLAYER_ID.value, self.id, self.id)
        self.send_message(resp)

    def send_message(self, message: Action) -> None:
        # Sends a message to this specific player attached to this connection
        print(message)
        message.sequence = self.sequence # Set the monotonic sequence number
        print(f"Sending message #{self.sequence} {message} to player {self.id} in lobby {self.lobby_id}")
        self.write_message(jsonpickle.encode(message, unpicklable=False))
        self.sequence += 1

    def on_message(self, message) -> None:
        # Echo the message back to all connected clients
        print(f"Received message '{message}' from {self.id}")
        
        # for conn in self.connections:
        #print(message)
        try:
            action = jsonpickle.decode(string=message)
        except ValueError as e:
            print(f"Error decoding received message: {e}")
            return
        #print(action)
        # match message
        actionEnum = ActionEnum(action['action'])
        if actionEnum == ActionEnum.INITIALIZE:
            # Generate a unique 4-letter lobby code
            while True:
                lobby_code = ''.join(random.choices(string.ascii_uppercase, k=4))
                if lobby_code not in self.lobbies:
                    break  # Exit the loop if the generated code is unique
            lobby_code = "ABCD" # TODO: REMOVE
            # Initialize the lobby with the generated code
            print(f"Initializing a lobby with code {lobby_code}")
            self.lobbies[lobby_code] = Lobby(self.id, lobby_code)
            self.lobbies[lobby_code].set_broadcast_function(GameWebSocketHandler.broadcast_to_lobby)
            self.lobbies[lobby_code].set_send_to_player_func(GameWebSocketHandler.send_to_player_func)
            print(f"Created a new player class and added them to the lobby they just created")
            # Create a new player, and add them to the lobby they just created
            p = Player(self.id, action['data']['player_name'])
            p.set_send_message_func(GameWebSocketHandler.send_to_player_func)
            self.lobbies[lobby_code].add_player(p)
            self.lobby_id = lobby_code
            # Send them back the lobby code we created for them
            resp = Action(ActionEnum.RETURN_LOBBY_CODE.value, self.id, lobby_code)
            self.send_message(resp)
            # Tell the player they joined their own lobby. Technically we should be telling everyone within the lobby, but it's only the player in there right now.
            resp = Action(ActionEnum.SUCCESSFULLY_JOINED_LOBBY.value, self.id, {"lobby_code": lobby_code, "player_name": action['data']['player_name']})
            self.send_message(resp)
        elif actionEnum == ActionEnum.JOIN_LOBBY:
            # The player is trying to join an existing lobby
            lobby_id = action['data']['lobby_code']
            player_name = action['data']['player_name']
            if lobby_id in self.lobbies:
                p = Player(self.id, player_name)
                p.set_send_message_func(GameWebSocketHandler.send_to_player_func)
                self.lobbies[lobby_id].add_player(p)
                self.lobby_id = lobby_id
                resp = Action(ActionEnum.SUCCESSFULLY_JOINED_LOBBY.value, self.id, lobby_id)
                GameWebSocketHandler.broadcast_to_lobby(self.lobby_id, resp)
            else:
                resp = Action(ActionEnum.LOBBY_DOES_NOT_EXIST.value, self.id, None)
                self.send_message(resp)
        elif actionEnum == ActionEnum.CHANGE_PARAM:
            # The owner of the lobby is trying to change the lobby's settings
            self.lobbies[self.lobby_id].change_lobby_settings(action['data'])
        elif actionEnum == ActionEnum.READY_LOBBY:
            # The owner of the lobby is trying to start the game.
            # Assert that the person starting the game is also the lobby owner
            assert self.lobbies[self.lobby_id].host == self.id
            resp = Action(ActionEnum.START_GAME, -1, None)
            GameWebSocketHandler.broadcast_to_lobby(self.lobby_id, resp)
            # Call the game logic to start the game
            self.lobbies[self.lobby_id].start_game()
            #self.send_message(resp)

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
    app = make_app()
    app.listen(8888)  # Specify the port to listen on
    print("Lexicon Labyrinth server is running on http://localhost:8888")
    tornado.ioloop.IOLoop.current().start()
