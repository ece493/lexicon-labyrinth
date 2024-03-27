import React, { useContext } from "react";
import LobbyComponent from "../components/lobby/lobby-component";
import { Bot, Lobby, Player } from "../data/model";
import { GameContext } from "../context/ctx";

const LobbyPage: React.FC = () => {
  const host: Player = { id: "0", name: "John Player", is_spectator: false, lives: 3, money: 100 };
  const bot: Bot = { id: "0", name: "John Bot", is_spectator: false, lives: 3, money: 100, difficulty: 1, memory: [] };
  const lobby: Lobby = {
    state: {
      curr_turn: "0",
      board: {
        tiles: [["a", "b", "c", "d", "e", "f", "g"],
        ["h", "i", "j", "k", "l", "m", "n"],
        ["o", "p", "q", "r", "s", "t", "u"],
        ["v", "w", "x", "y", "z", "A", "B"],
        ["C", "D", "E", "F", "G", "H", "I"],
        ["J", "K", "L", "M", "N", "O", "P"],
        ["Q", "R", "S", "T", "U", "V", "W"],]
      },
      timer: 0,
      memory: [],
    },
    max_lives: 5,
    host: "0",
    board_size: [7, 7],
    timer_setting: 30,
    lobby_code: "X3Y0EG",
    players: [host, host, host, bot]
  };
  const ctx = useContext(GameContext);
  return (
    <>
      { lobby && <LobbyComponent lobby={lobby} player_id={"0"} ctx={ctx} /> }
      {/* { !(ctx.lobby && ctx.playerId) && <h1>Something went wrong! {!ctx.lobby} {!ctx.playerId}</h1> } */}
    </>
  );
};

export default LobbyPage;
