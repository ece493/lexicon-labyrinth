import { Board, Lobby } from "../data/model";

export type ReceiveCallbacks = {
  handleWordAccept: (path: number[][], lobby: Lobby) => void;
  handleWordDeny: (path: number[][], tiles: Board) => void;
  handleNewTurn: (lobby: Lobby) => void;
  handleLoseLife: (lobby: Lobby, playerId: string) => void;
  handleDeath: (lobby: Lobby, playerId: string) => void;
  handleGameEnd: (lobby: Lobby) => void;
  handleRotateAccept: (
    lobby: Lobby,
    type: string,
    index: number,
    rotations: number
  ) => void;
  handleScrambleAccept: (lobby: Lobby) => void;
  handleTransformAccept: (lobby: Lobby,  tile: number[],
    newChar: string,) => void;
  handleSwapAccept: (lobby: Lobby, tiles: number[][]) => void;
};

export const GetReceiveCallbacksDefault = () => {
  return {
    handleWordAccept: (path: number[][], lobby: Lobby) =>
      console.log("Ran default word accept handler"),
    handleWordDeny: (path: number[][], board: Board) =>
      console.log("Ran default word deny handler"),
    handleNewTurn: (lobby: Lobby) =>
      console.log("Ran default new turn handler"),
    handleLoseLife: (lobby: Lobby, playerId: string) =>
      console.log("Ran default lose life  handler"),
    handleDeath: (lobby: Lobby, playerId: string) =>
      console.log("Ran default death  handler"),
    handleGameEnd: (lobby: Lobby) =>
      console.log("Ran default game end handler"),
    handleRotateAccept: (lobby: Lobby) =>
      console.log("Ran default rotate handler"),
    handleScrambleAccept: (lobby: Lobby) =>
      console.log("Ran default scramble handler"),
    handleTransformAccept: (lobby: Lobby) =>
      console.log("Ran default transform handler"),
    handleSwapAccept: (lobby: Lobby) => console.log("Ran default swap handler"),
  };
};
