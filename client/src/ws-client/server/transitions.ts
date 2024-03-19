import { Action } from "../../data/model";
import { ActionsList } from "../model";

export type ServerTransitions = {
  initialize: (ws: WebSocket) => void;
  joinLobby: (ws: WebSocket, code: string) => void;
  changeParam: (ws: WebSocket, param: string, value: string) => void;
  readyLobby: (ws: WebSocket) => void;
  pickWord: (ws: WebSocket, path: [number, number][]) => void;
  pickRotatePowerup: (
    ws: WebSocket,
    type: string,
    index: number,
    rotations: number
  ) => void;
  pickTransformPowerup: (
    ws: WebSocket,
    tile: number[],
    newChar: string
  ) => void;
  pickSwapPowerup: (ws: WebSocket, tiles: number[][]) => void;
  pickScramblePowerup: (ws: WebSocket) => void;
  leaveGame: (ws: WebSocket) => void;
};

const initialize = (ws: WebSocket) => {
  const msg: Action = {
    action: ActionsList.initialize,
    player_id: 0,
    data: [],
  };
  ws.send(JSON.stringify(msg));
};

const joinLobby = (ws: WebSocket, code: string) => {
  const msg: Action = {
    action: ActionsList.join_lobby,
    player_id: 0,
    data: code,
  };
  ws.send(JSON.stringify(msg));
};

const changeParam = (ws: WebSocket, param: string, value: string) => {
  const msg: Action = {
    action: ActionsList.change_param,
    player_id: 0,
    data: [param, value],
  };
  ws.send(JSON.stringify(msg));
};

const readyLobby = (ws: WebSocket) => {
  const msg: Action = {
    action: ActionsList.ready_lobby,
    player_id: 0,
    data: [],
  };
  ws.send(JSON.stringify(msg));
};

const pickWord = (ws: WebSocket, path: [number, number][]) => {
  const msg: Action = {
    action: ActionsList.pick_word,
    player_id: 0,
    data: path,
  };
  ws.send(JSON.stringify(msg));
};

const pickRotatePowerup = (
  ws: WebSocket,
  type: string,
  index: number,
  rotations: number
) => {
  console.log("sending rotate request with: ", { type, index, rotations });
  const msg: Action = {
    action: ActionsList.pick_rotate_powerup,
    player_id: 0,
    data: { type, index, rotations },
  };
  ws.send(JSON.stringify(msg));
};

const pickScramblePowerup = (ws: WebSocket) => {
  console.log("sending scramble request");
  const msg: Action = {
    action: ActionsList.pick_scramble_powerup,
    player_id: 0,
    data: {},
  };
  ws.send(JSON.stringify(msg));
};

const pickSwapPowerup = (ws: WebSocket, tiles: number[][]) => {
  console.log("sending swap request with: ", tiles );
  const msg: Action = {
    action: ActionsList.pick_swap_powerup,
    player_id: 0,
    data: tiles ,
  };
  ws.send(JSON.stringify(msg));
};

const pickTransformPowerup = (
  ws: WebSocket,
  tile: number[],
  newChar: string
) => {
  console.log("sending transform request with: ", { tile, newChar });
  const msg: Action = {
    action: ActionsList.pick_transform_powerup,
    player_id: 0,
    data: { tile, newChar },
  };
  ws.send(JSON.stringify(msg));
};

export const TransitionManager: ServerTransitions = {
  initialize: initialize,
  joinLobby: joinLobby,
  changeParam: changeParam,
  readyLobby: readyLobby,
  pickWord: pickWord,
  pickRotatePowerup: pickRotatePowerup,
  pickTransformPowerup: pickTransformPowerup,
  pickSwapPowerup: pickSwapPowerup,
  pickScramblePowerup: pickScramblePowerup,
  leaveGame: (ws: WebSocket) => {},
};
