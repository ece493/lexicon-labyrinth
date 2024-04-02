import { createContext } from "react";
import { Lobby, ScreenState } from "../data/model";
import {
  ServerTransitions,
  TransitionManager,
} from "../ws-client/server/transitions";
import {
  ReceiveCallbacks,
  GetReceiveCallbacksDefault,
} from "../ws-client/receive-callbacks";

export type GameContextData = {
  playerName: String;
  setPlayerName: (s: string) => void;
  sock: WebSocket | null;
  screen: ScreenState;
  setPlayerId: (s: string) => void;
  setScreen: (s: ScreenState) => void;
  lobby: Lobby | null;
  setLobby: (l: Lobby) => void;
  defaultLobbyCode: string;
  transitions: ServerTransitions;
  receiveCallBacks: ReceiveCallbacks;
  playerId: string | null;
  sequenceNumber: number;
  freezeInputs: boolean;
  setFreezeInputs: (b: boolean) => void;
  pauseMessages: { pause: boolean };
};

export const GameContext = createContext<GameContextData>({
  playerName: "",
  setPlayerName: (s: string) => {},
  sock: null,
  screen: ScreenState.START,
  setPlayerId: (s: string) => {},
  setScreen: (s: ScreenState) => {},
  lobby: null,
  setLobby: (l: Lobby) => {},
  defaultLobbyCode: "",
  transitions: TransitionManager,
  receiveCallBacks: GetReceiveCallbacksDefault(),
  playerId: null,
  sequenceNumber: 0,
  freezeInputs: false,
  setFreezeInputs: (l: boolean) => {},
  pauseMessages: { pause: false },
});
