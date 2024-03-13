import { ActionsList } from "../ws-client/model";

export type Lobby = {
    state: GameState;
    max_lives: number;
    host: number;
    board_size: [number, number];
    timer_setting: number;
    lobby_code: string;
    players: (Player|Bot)[];
};

export type GameState = {
    turns: Turns;
    board: Board;
    timer: number;
    memory: Set<string>;
};

export type Board = {
    tiles: string[][];
};

export type Turns = {
    order: number[];
    curr_turn: number;
};

export type Player = {
    id: number;
    name: string;
    is_spectator: boolean;
    lives: number;
    money: number;
};

export type Bot = Player & {
    difficulty: number;
    memory: Set<string>;
};

export type Action = {
  action: ActionsList,
  player_id: number,
  data: any
}

export enum Screen {
    START = 0,
    LOBBY_CODE_ENTRY = 1,
    LOBBY = 2,
    GAME = 3,
    WIN = 4,
};

export const isAction = (d: any): d is Action => d?.action && d?.player_id;;

export const isPlayerABot = (p: Player | Bot): p is Bot => {
    return ((p as Bot).difficulty) ? true : false;
}