import { ActionsList } from "../ws-client/model";

export type Lobby = {
    state: GameState;
    max_lives: number;
    host: number;
    board_size: number[];
    timer_setting: number;
    lobby_code: string;
    players: (Player|Bot)[];
};

export type GameState = {
    curr_turn: string;
    board: Board;
    timer: number;
    memory: string[];
};

export type Board = {
    tiles: string[][];
};

export type Player = {
    id: string;
    name: string;
    is_spectator: boolean;
    lives: number;
    money: number;
};

export type Bot = Player & {
    difficulty: number;
    memory: string[];
};

export type Action = {
  action: ActionsList,
  player_id: number,
  data: any
  sequence_number: number
}

export enum ScreenState {
    START = 0,
    LOBBY_CODE_ENTRY = 1,
    LOBBY_CODE_ENTRY_FAILED = 2,
    LOBBY = 3,
    GAME = 4,
    END = 5,
    LOBBY_FULL = 6,
};

export const isAction = (d: any): d is Action => d?.action && d?.player_id;;

export const isPlayerABot = (p: Player | Bot): p is Bot => {
    return ((p as Bot).difficulty) ? true : false;
}