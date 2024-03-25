import { Lobby } from "../data/model";

export type ReceiveCallbacks = {
  handleWordAccept: (path: number[][], lobby: Lobby) => void;
  handleWordDeny: (path: number[][]) => void;
  handleNewTurn: (lobby: Lobby) => void;
  handleLoseLife: (lobby: Lobby, playerId: string) => void;
  handleDeath: (lobby: Lobby, playerId: string) => void;
  handleGameEnd: (lobby: Lobby) => void;
};

export const ReceiveCallbacksDefault = {
  handleWordAccept: (path: number[][], lobby: Lobby) =>
    console.log("Ran default word accept handler"),
  handleWordDeny: (path: number[][]) =>
    console.log("Ran default word deny handler"),
  handleNewTurn: (lobby: Lobby) => console.log("Ran default new turn handler"),
  handleLoseLife: (lobby: Lobby, playerId: string) =>
    console.log("Ran default lose life  handler"),
  handleDeath: (lobby: Lobby, playerId: string) =>
    console.log("Ran default death  handler"),
  handleGameEnd: (lobby: Lobby) =>
    console.log("Ran default game end handler"),
};
