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
  player_name: String;
  sock: WebSocket | null;
  screen: ScreenState;
  setScreen: (s: ScreenState) => void;
  lobby: Lobby | null;
  transitions: ServerTransitions;
  receiveCallBacks: ReceiveCallbacks;
  playerId: string | null;
  sequenceNumber: number;
};

export const GameContext = createContext<GameContextData>({
  player_name: "",
  sock: null,
  screen: ScreenState.START,
  setScreen: (s: ScreenState) => {},
  lobby: null,
  transitions: TransitionManager,
  receiveCallBacks: ReceiveCallbacksDefault,
  playerId: null,
  sequenceNumber: 0,
});
