import { ActionsList } from "../ws-client/model";

// FR18 - Game.Valid.Word, FR19 - Game.Reused.Word
export type Lobby = {
    state: GameState;
    max_lives: number;
    host: string;
    board_size: number;
    timer_setting: number;
    lobby_code: string;
    players: (Player|Bot)[];
};

// FR18 - Game.Valid.Word, FR19 - Game.Reused.Word
export type GameState = {
    curr_turn: string;
    board: Board;
    timer: number;
    memory: string[];
};

// FR18 - Game.Valid.Word, FR19 - Game.Reused.Word
export type Board =  string[][];

// FR22 - Game.Lives.Show
export type Player = {
    id: string;
    name: string;
    is_spectator: boolean;
    lives: number;
    money: number;
};

// FR22 - Game.Lives.Show
export type Bot = Player & {
    difficulty: number;
    memory: string[];
};

// FR18 - Game.Valid.Word, FR19 - Game.Reused.Word
export type Action = {
  action: ActionsList,
  player_id: string,
  data: any
  sequence_number: number
}

// FR27 - Game.Restart
export enum ScreenState {
    START = 0,
    LOBBY_CODE_ENTRY = 1,
    LOBBY_CODE_ENTRY_FAILED = 2,
    LOBBY = 3,
    GAME = 4,
    END = 5,
    LOBBY_FULL = 6,
    NAME_ENTRY = 7,
    BOOTED_FROM_LOBBY = 8,
    TEST_HOME = -1,
};

// FR18 - Game.Valid.Word, FR19 - Game.Reused.Word
export const isAction = (d: any): d is Action => d?.action && d?.player_id;;

// FR22 - Game.Lives.Show
export const isPlayerABot = (p: Player | Bot): p is Bot => {
    return ((p as Bot).difficulty) ? true : false;
}