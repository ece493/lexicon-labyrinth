import { createContext } from 'react';
import { connect } from '../ws-client/client';
import { ScreenState } from '../data/model';

export type GameContextData = {
    sock: WebSocket | null,
    connectWs: (setScreen: (s: ScreenState) => void) => WebSocket,
    screen: ScreenState,
    setScreen: (s: ScreenState) => void,
    lobbyCode: string | null,
    setLobbyCode: (s: string) => void,
}

export const GameContext = createContext <GameContextData>({
    sock: null,
    connectWs: connect,
    screen: ScreenState.START,
    setScreen: (s: ScreenState) => {},
    lobbyCode: "",
    setLobbyCode: (s: string) => {},
});