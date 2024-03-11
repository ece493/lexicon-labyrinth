import { createContext } from 'react';
import { Socket, io } from 'socket.io-client';
import { connect } from '../client';

export type ClientContextData = {
    sock: Socket | null,
    connect: () => Socket
}

export const ClientContext = createContext <ClientContextData>({
    sock: null,
    connect: connect
});
