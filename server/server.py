import tornado.ioloop
import tornado.web
import tornado.websocket
from tornado.web import Application
import uuid
import jsonpickle

from models import Lobby, Action, ActionEnum, Player

# Define a WebSocketHandler
class GameWebSocketHandler(tornado.websocket.WebSocketHandler):
    connections = set()
    lobbies: dict[str, Lobby] = {} # each lobby is assigned to a player UUID

    def open(self) -> None:
        # Assign a unique ID to the connection
        self.id = str(uuid.uuid4())
        self.connections.add(self)
        print(f"New WebSocket connection: {self.id}")

    def on_message(self, message) -> None:
        # Echo the message back to all connected clients
        print(f"Received message '{message}' from {self.id}")
        
        # for conn in self.connections:
        print(message)
        action = jsonpickle.decode(string=message)
        print(action)
        # match message
        actionEnum = ActionEnum(action['action'])
        if actionEnum == ActionEnum.INITIALIZE:
            # The player is creating a new lobby.
            self.lobbies[self.id] = Lobby(0, self.id)
            # Add the player to the lobby they just created
            p = Player(self.id, None)
            self.lobbies[self.id].add_player(p)
            # Send them back the lobby code we created for them.
            # TODO: Change the lobby code to a 4 character code for simplicity
            resp = Action(ActionEnum.RETURN_LOBBY_CODE.value, -1, self.id)
        elif actionEnum == ActionEnum.JOIN_LOBBY:
            # The player is trying to join an existing lobby
            lobby_id = action['data']
            if lobby_id in self.lobbies:
                p = Player(self.id, None)
                self.lobbies[lobby_id].add_player(p)
                resp = Action(ActionEnum.SUCCESSFULLY_JOINED_LOBBY.value, -1, [self.id])
            else:
                resp = Action(ActionEnum.LOBBY_DOES_NOT_EXIST.value, -1, [])
        self.write_message(jsonpickle.encode(resp, unpicklable=False))

    def on_close(self) -> None:
        self.connections.remove(self)
        print(f"WebSocket connection {self.id} closed")

    def check_origin(self, origin) -> bool:
        # Allow connections from any origin
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
