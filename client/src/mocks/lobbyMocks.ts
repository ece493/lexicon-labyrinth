import { Bot, Player } from "../data/model";

const host: Player = {
  id: "0",
  name: "John Player",
  is_spectator: false,
  lives: 3,
  money: 100,
};
const p2: Player = {
  id: "1",
  name: "P2",
  is_spectator: false,
  lives: 3,
  money: 10,
};

const p2LessLives: Player = {
  id: "1",
  name: "P2",
  is_spectator: false,
  lives: 2,
  money: 10,
};

const p2Dead: Player = {
    id: "1",
    name: "P2",
    is_spectator: false,
    lives: 0,
    money: 10,
  };
const dead: Player = {
  id: "2",
  name: "DEAD",
  is_spectator: false,
  lives: 0,
  money: 100,
};
const bot: Bot = {
  id: "3",
  name: "John Bot",
  is_spectator: false,
  lives: 3,
  money: 100,
  difficulty: 1,
  memory: [],
};
const lobby1 = {
  state: {
    curr_turn: "1",
    board: {
      tiles: [
        ["a", "b", "c", "d", "e", "f", "g"],
        ["h", "i", "j", "k", "l", "m", "n"],
        ["o", "p", "q", "r", "s", "t", "u"],
        ["v", "w", "x", "y", "z", "A", "B"],
        ["C", "D", "E", "F", "G", "H", "I"],
        ["J", "K", "L", "M", "N", "O", "P"],
        ["Q", "R", "S", "T", "U", "V", "W"],
      ],
    },
    timer: 0,
    memory: [],
  },
  max_lives: 5,
  host: "0",
  board_size: 7,
  timer_setting: 30,
  lobby_code: "X3Y0EG",
  players: [host, p2, dead, bot],
};

const lobby2 = {
  state: {
    curr_turn: "1",
    board: {
      tiles: [
        ["a", "b", "c", "d", "e", "f", "g"],
        ["h", "i", "j", "k", "l", "m", "n"],
        ["o", "p", "q", "r", "s", "t", "u"],
        ["v", "w", "x", "y", "z", "A", "B"],
        ["C", "D", "E", "F", "G", "H", "I"],
        ["J", "K", "L", "M", "N", "O", "P"],
        ["Q", "R", "S", "T", "U", "V", "W"],
      ],
    },
    timer: 0,
    memory: [],
  },
  max_lives: 5,
  host: "0",
  board_size: 7,
  timer_setting: 30,
  lobby_code: "X3Y0EG",
  players: [host, p2LessLives, dead, bot],
};


const lobby3 = {
    state: {
      curr_turn: "1",
      board: {
        tiles: [
          ["a", "b", "c", "d", "e", "f", "g"],
          ["h", "i", "j", "k", "l", "m", "n"],
          ["o", "p", "q", "r", "s", "t", "u"],
          ["v", "w", "x", "y", "z", "A", "B"],
          ["C", "D", "E", "F", "G", "H", "I"],
          ["J", "K", "L", "M", "N", "O", "P"],
          ["Q", "R", "S", "T", "U", "V", "W"],
        ],
      },
      timer: 0,
      memory: [],
    },
    max_lives: 5,
    host: "0",
    board_size: 7,
    timer_setting: 30,
    lobby_code: "X3Y0EG",
    players: [host, p2Dead, dead, bot],
  };

export { lobby1, lobby2, lobby3 };
