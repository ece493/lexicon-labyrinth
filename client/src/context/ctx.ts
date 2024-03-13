import { createContext } from 'react';
import { connect } from '../ws-client/client';
import { Screen } from '../data/model';

export type GameContextData = {
    sock: WebSocket | null,
    connectWs: (setScreen: (s: Screen) => void) => WebSocket,
    screen: Screen,
    setScreen: (s: Screen) => void,
}

export const ClientContext = createContext <GameContextData>({
    sock: null,
    connectWs: connect,
    screen: Screen.START,
    setScreen: (s: Screen) => {}
});