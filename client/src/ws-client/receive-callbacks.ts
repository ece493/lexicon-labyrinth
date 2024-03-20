import { Lobby } from "../data/model";

export type ReceiveCallbacks = {
  handleWordAccept: (path: number[][], lobby: Lobby) => void;
  handleWordDeny: (path: number[][]) => void;
  handleNewTurn: (lobby: Lobby) => void,
};

export const ReceiveCallbacksDefault = {
  handleWordAccept: (path: number[][], lobby: Lobby) =>
    console.log("Ran default word accept handler"),
  handleWordDeny: (path: number[][]) =>
    console.log("Ran default word deny handler"),
  handleNewTurn: (lobby: Lobby) =>
    console.log("Ran default new turn handler"),
};
