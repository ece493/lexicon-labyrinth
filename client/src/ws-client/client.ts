// https://socket.io/how-to/use-with-react
export const connect = () => {
    // TO-DO: Remove undefined
    // const url = process.env.NODE_ENV === 'production' ? "undefined" : 'ws://localhost:8888/websocket';
    return new WebSocket("ws://localhost:8888/websocket");
}