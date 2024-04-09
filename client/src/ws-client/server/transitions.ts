import { GameContextData } from "../../context/ctx";
import { Action } from "../../data/model";
import { ActionsList } from "../model";

export type ServerTransitions = {
  initialize: (ctx: GameContextData) => void;
  joinLobby: (code: string, ctx: GameContextData) => void;
  changeParam: (param: string, value: string, ctx: GameContextData) => void;
  addBot: (ctx: GameContextData) => void;
  updateBot: (player_id: string, difficulty: number, ctx: GameContextData) => void;
  removePlayer: (player_id: string, ctx: GameContextData) => void;
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
  notifyTurnEnd: (ctx: GameContextData) => void;
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
    data: { [param]: value },
    sequence_number: ctx.sequenceNumber,
  };
  ctx.sock!.send(JSON.stringify(msg));
  ctx.sequenceNumber += 1;
};

const addBot = (ctx: GameContextData) => {
  const msg: Action = {
    action: ActionsList.add_bot,
    player_id: ctx.playerId || "",
    data: {},
    sequence_number: ctx.sequenceNumber,
  };
  ctx.sock!.send(JSON.stringify(msg));
  ctx.sequenceNumber += 1;
};

const updateBot = (bot_id: string, difficulty: number, ctx: GameContextData) => {
  const msg: Action = {
    action: ActionsList.update_bot,
    player_id: ctx.playerId || "",
    data: { "player_id": bot_id, difficulty: difficulty },
    sequence_number: ctx.sequenceNumber,
  };
  ctx.sock!.send(JSON.stringify(msg));
  ctx.sequenceNumber += 1;
};


const removePlayer = (player_id: string, ctx: GameContextData) => {
  const msg: Action = {
    action: ActionsList.remove_player,
    player_id: ctx.playerId || "",
    data: {
      "player_id": player_id,
      "lobby_code": ctx.lobby?.lobby_code
    },
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

// FR18 - Game.Valid.Word
const pickWord = (path: number[][], ctx: GameContextData) => {
  ctx.setFreezeInputs(true)
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

// FR33 - Powerup.Rotate
const pickRotatePowerup = (
  type: string,
  index: number,
  rotations: number,
  ctx: GameContextData
) => {
  ctx.setFreezeInputs(true)
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

// FR34 - Powerup.Refresh
const pickScramblePowerup = (ctx: GameContextData) => {
  ctx.setFreezeInputs(true)
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

// FR35 - Powerup.Swap
const pickSwapPowerup = (tiles: number[][], ctx: GameContextData) => {
  ctx.setFreezeInputs(true)
  console.log("sending swap request with: ", tiles);
  const msg: Action = {
    action: ActionsList.pick_swap_powerup,
    player_id: ctx.playerId || "",
    data: {tiles},
    sequence_number: ctx.sequenceNumber,
  };
  ctx.sock!.send(JSON.stringify(msg));
  ctx.sequenceNumber += 1;
};

// FR36 - Powerup.Transform
const pickTransformPowerup = (
  tile: number[],
  newChar: string,
  ctx: GameContextData
) => {
  ctx.setFreezeInputs(true)
  console.log("sending transform request with: ", { tile, newChar });
  const msg: Action = {
    action: ActionsList.pick_transform_powerup,
    player_id: ctx.playerId || "",
    data: { tile, new_char: newChar },
    sequence_number: ctx.sequenceNumber,
  };
  ctx.sock!.send(JSON.stringify(msg));
  ctx.sequenceNumber += 1;
};

// FR20 - Game.Turns
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

// FR20 - Game.Turns
const notifyTurnEnd = (ctx: GameContextData) => {
  ctx.setFreezeInputs(true)
  console.log("sending turn end request");
  const msg: Action = {
    action: ActionsList.end_turn,
    player_id: ctx.playerId!,
    data: null,
    sequence_number: ctx.sequenceNumber,
  };
  ctx.sock!.send(JSON.stringify(msg));
  ctx.sequenceNumber += 1;
};

export const TransitionManager: ServerTransitions = {
  initialize,
  joinLobby,
  changeParam,
  addBot,
  updateBot,
  removePlayer,
  readyLobby,
  pickWord,
  pickRotatePowerup,
  pickTransformPowerup,
  pickSwapPowerup,
  pickScramblePowerup,
  leaveGame,
  notifyTurnEnd,
};
