import { GameContextData } from "../../context/ctx";
import { Action } from "../../data/model";
import { ActionsList } from "../model";

export type ServerTransitions = {
  initialize: (ctx: GameContextData) => void;
  joinLobby: (code: string, ctx: GameContextData) => void;
  changeParam: (param: string, value: string, ctx: GameContextData) => void;
  readyLobby: (ctx: GameContextData) => void;
  pickWord: (path: number[][], ctx: GameContextData) => void;
  pickRotatePowerup: (
    type: string,
    index: number,
    rotations: number,
    ctx: GameContextData
  ) => void;
  pickTransformPowerup: (
    tile: number[],
    newChar: string,
    ctx: GameContextData
  ) => void;
  pickSwapPowerup: (tiles: number[][], ctx: GameContextData) => void;
  pickScramblePowerup: (ctx: GameContextData) => void;
  leaveGame: (ctx: GameContextData) => void;
};

const initialize = (ctx: GameContextData) => {
  const msg: Action = {
    action: ActionsList.initialize,
    player_id: ctx.playerId || "",
    data: {
      player_name: ctx.playerName
    },
    sequence_number: ctx.sequenceNumber,
  };
  ctx.sock!.send(JSON.stringify(msg));
  ctx.sequenceNumber += 1;
};

const joinLobby = (code: string, ctx: GameContextData) => {
  console.log("player_name", ctx.playerName);
  const msg: Action = {
    action: ActionsList.join_lobby,
    player_id: ctx.playerId || "",
    data: {
      lobby_code: code,
      player_name: ctx.playerName
    },
    sequence_number: ctx.sequenceNumber,
  };
  ctx.sock!.send(JSON.stringify(msg));
  ctx.sequenceNumber += 1;
};

const changeParam = (param: string, value: string, ctx: GameContextData) => {
  const msg: Action = {
    action: ActionsList.change_param,
    player_id: ctx.playerId || "",
    data: [param, value],
    sequence_number: ctx.sequenceNumber,
  };
  ctx.sock!.send(JSON.stringify(msg));
  ctx.sequenceNumber += 1;
};

const readyLobby = (ctx: GameContextData) => {
  const msg: Action = {
    action: ActionsList.ready_lobby,
    player_id: ctx.playerId || "",
    data: [],
    sequence_number: ctx.sequenceNumber,
  };
  ctx.sock!.send(JSON.stringify(msg));
  ctx.sequenceNumber += 1;
};

const pickWord = (path: number[][], ctx: GameContextData) => {
  console.log(
    "sending word pick request with: ",
    path,
    "\n sequence number: ",
    ctx.sequenceNumber
  );
  const msg: Action = {
    action: ActionsList.pick_word,
    player_id: ctx.playerId || "",
    data: path,
    sequence_number: ctx.sequenceNumber,
  };
  ctx.sock!.send(JSON.stringify(msg));
  ctx.sequenceNumber += 1;
};

const pickRotatePowerup = (
  type: string,
  index: number,
  rotations: number,
  ctx: GameContextData
) => {
  console.log("sending rotate request with: ", { type, index, rotations });
  const msg: Action = {
    action: ActionsList.pick_rotate_powerup,
    player_id: ctx.playerId || "",
    data: { type, index, rotations },
    sequence_number: ctx.sequenceNumber,
  };
  ctx.sock!.send(JSON.stringify(msg));
  ctx.sequenceNumber += 1;
};

const pickScramblePowerup = (ctx: GameContextData) => {
  console.log("sending scramble request");
  const msg: Action = {
    action: ActionsList.pick_scramble_powerup,
    player_id: ctx.playerId || "",
    data: {},
    sequence_number: ctx.sequenceNumber,
  };
  ctx.sock!.send(JSON.stringify(msg));
  ctx.sequenceNumber += 1;
};

const pickSwapPowerup = (tiles: number[][], ctx: GameContextData) => {
  console.log("sending swap request with: ", tiles);
  const msg: Action = {
    action: ActionsList.pick_swap_powerup,
    player_id: ctx.playerId || "",
    data: tiles,
    sequence_number: ctx.sequenceNumber,
  };
  ctx.sock!.send(JSON.stringify(msg));
  ctx.sequenceNumber += 1;
};

const pickTransformPowerup = (
  tile: number[],
  newChar: string,
  ctx: GameContextData
) => {
  console.log("sending transform request with: ", { tile, newChar });
  const msg: Action = {
    action: ActionsList.pick_transform_powerup,
    player_id: ctx.playerId || "",
    data: { tile, newChar },
    sequence_number: ctx.sequenceNumber,
  };
  ctx.sock!.send(JSON.stringify(msg));
  ctx.sequenceNumber += 1;
};

const leaveGame = (ctx: GameContextData) => {
  console.log("sending leave request");
  const msg: Action = {
    action: ActionsList.leave_game,
    player_id: ctx.playerId || "",
    data: null,
    sequence_number: ctx.sequenceNumber,
  };
  ctx.sock!.send(JSON.stringify(msg));
  ctx.sequenceNumber += 1;
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
  leaveGame: leaveGame,
};
