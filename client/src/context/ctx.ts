import { createContext } from 'react';
import { connect } from '../ws-client/client';
import { Lobby, ScreenState } from '../data/model';
import { ServerTransitions, TransitionManager } from '../ws-client/server/transitions';

export type GameContextData = {
    sock: WebSocket | null,
    connectWs: (setScreen: (s: ScreenState) => void) => WebSocket,
    screen: ScreenState,
    setScreen: (s: ScreenState) => void,
    lobby: Lobby | null,
    transitions: ServerTransitions,
}

export const GameContext = createContext <GameContextData>({
    sock: null,
    connectWs: connect,
    screen: ScreenState.START,
    setScreen: (s: ScreenState) => {},
    lobby: null,
    transitions: TransitionManager,
});