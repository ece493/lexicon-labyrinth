import tornado.ioloop
import tornado.web

# Define a RequestHandler
class MainHandler(tornado.web.RequestHandler):
    def get(self):
        self.write("Hello, world!")

# Create the Tornado application and define the route
def make_app():
    return tornado.web.Application([
        (r"/", MainHandler),
    ])

if __name__ == "__main__":
    app = make_app()
    app.listen(8888)  # Specify the port to listen on
    print("Server is running on http://localhost:8888")
    tornado.ioloop.IOLoop.current().start()

