import { io } from 'socket.io-client';

// https://socket.io/how-to/use-with-react
export const connect = () => {
    // TO-DO: Remove undefined
    const url = process.env.NODE_ENV === 'production' ? "undefined" : 'http://localhost:8080';
    return io(url);
}