import tornado.ioloop
import tornado.web
import tornado.websocket
from tornado.web import Application
import uuid
import jsonpickle

from models import Lobby  # Import UUID to generate unique IDs for clients

# Define a WebSocketHandler
class GameWebSocketHandler(tornado.websocket.WebSocketHandler):
    connections = set()
    lobbies = {} # each lobby is assigned to a player UUID

    def open(self) -> None:
        # Assign a unique ID to the connection
        self.id = str(uuid.uuid4())
        self.connections.add(self)
        print(f"New WebSocket connection: {self.id}")

    def on_message(self, message) -> None:
        # Echo the message back to all connected clients
        print(f"Received message '{message}' from {self.id}")
        self.lobbies[self.id] = Lobby(0, self.id)
        for conn in self.connections:
            conn.write_message(jsonpickle.encode(self.lobbies[self.id], unpicklable=False))

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
