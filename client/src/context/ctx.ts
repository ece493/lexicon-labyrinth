import { createContext } from "react";
import { connect } from "../ws-client/client";
import { Lobby, ScreenState } from "../data/model";
import {
  ServerTransitions,
  TransitionManager,
} from "../ws-client/server/transitions";
import {
  ReceiveCallbacks,
  ReceiveCallbacksDefault,
} from "../ws-client/receive-callbacks";

export type GameContextData = {
  playerName: String;
  setPlayerName: (s: string) => void;
  sock: WebSocket | null;
  screen: ScreenState;
  setPlayerId: (s: string) => void;
  setScreen: (s: ScreenState) => void;
  lobby: Lobby | null;
  transitions: ServerTransitions;
  receiveCallBacks: ReceiveCallbacks;
  playerId: string | null;
  sequenceNumber: number;
};

export const GameContext = createContext<GameContextData>({
  playerName: "",
  setPlayerName: (s: string) => { },
  sock: null,
  screen: ScreenState.START,
  setPlayerId: (s: string) => {},
  setScreen: (s: ScreenState) => {},
  lobby: null,
  transitions: TransitionManager,
  receiveCallBacks: ReceiveCallbacksDefault,
  playerId: null,
  sequenceNumber: 0,
});
