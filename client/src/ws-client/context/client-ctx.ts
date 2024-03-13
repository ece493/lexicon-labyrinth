import { createContext } from 'react';
import { connect } from '../client';

export type ClientContextData = {
    sock: WebSocket | null,
    connect: () => WebSocket
}

export const ClientContext = createContext <ClientContextData>({
    sock: null,
    connect: connect
});