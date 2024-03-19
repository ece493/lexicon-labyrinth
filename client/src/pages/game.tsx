import React from "react";
import { SelectionGridComponent } from "../components/grid/selectionGrid";
import TurnComponent from "../components/grid/turn";
import PowerupsComponent from "../components/grid/powerups";
import PlayersComponent from "../components/grid/players";
import { Bot, Lobby, Player } from "../data/model";
import { useState, useContext } from "react";
import { SwapGridComponent } from "../components/grid/powerup-grids/swapGrid";
import { RotateGridComponent } from "../components/grid/powerup-grids/rotateGrid";
import { TransformGridComponent } from "../components/grid/powerup-grids/transformGrid";
import { ScrambleGridComponent } from "../components/grid/powerup-grids/scrambleGrid";
import { GameContext } from "../context/ctx";
import { isJSDocNullableType } from "typescript";

const Game: React.FC = () => {
  const host: Player = { id: "0", name: "John Player", is_spectator: false, lives: 3, money: 100 };
  const bot: Bot = { id: "1", name: "John Bot", is_spectator: false, lives: 3, money: 100, difficulty: 1, memory: [] };
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
    host: 0,
    board_size: [7, 7],
    timer_setting: 30,
    lobby_code: "X3Y0EG",
    players: [host, host, host, bot],
  };


  const gameContext = useContext(GameContext);
  const [word, setWord] = useState("");
  const [error, setError] = useState(null);

  // May have to change where this is stored to prevent too much re-rendering
  const [wordPath, setWordPath] = useState([]);

  const [powerup, setPowerup] = useState<string | null>(null);
  const [tiles, setTiles] = useState([
    ["a", "b", "c", "d", "a", "b", "c", "d"],
    ["a", "f", "g", "h", "a", "b", "c", "d"],
    ["i", "j", "k", "l", "a", "b", "c", "d"],
    ["m", "n", "o", "p", "a", "b", "c", "d"],
    ["m", "n", "o", "p", "a", "b", "c", "d"],
    ["m", "n", "o", "p", "a", "b", "c", "d"],
    ["m", "n", "o", "p", "a", "b", "c", "d"],
    ["m", "n", "o", "p", "a", "b", "c", "d"],
  ]);

  function resetWordSelection() {
    setWord("");
    setWordPath([]);
  }

  function handleSubmit() {
    if (gameContext.sock !== null) {
      gameContext.transitions.pickWord(gameContext.sock as WebSocket, wordPath);
    }
  }

  function getGrid() {
    switch (powerup) {
      case "SWAP":
        return (
          <SwapGridComponent
            help={word}
            setPowerup={setPowerup}
            setHelp={setWord}
            board_size={[8, 8]}
            grid={{
              tiles,
            }}
            resetWordSelection={resetWordSelection}
          />
        );
      case "ROTATE":
        return (
          <RotateGridComponent
            help={word}
            setPowerup={setPowerup}
            setHelp={setWord}
            board_size={[8, 8]}
            ogGrid={{
              tiles,
            }}
            resetWordSelection={resetWordSelection}
          />
        );
      case "TRANSFORM":
        return (
          <TransformGridComponent
            help={word}
            setPowerup={setPowerup}
            setHelp={setWord}
            board_size={[8, 8]}
            grid={{
              tiles,
            }}
            resetWordSelection={resetWordSelection}
          />
        );
      case "SCRAMBLE":
        return (
          <ScrambleGridComponent
            help={word}
            setPowerup={setPowerup}
            setHelp={setWord}
            board_size={[8, 8]}
            grid={{
              tiles,
            }}
            resetWordSelection={resetWordSelection}
          />
        );

      default:
        return (
          <SelectionGridComponent
            wordPath={wordPath}
            setWordPath={setWordPath}
            word={word}
            setWord={setWord}
            board_size={[8, 8]}
            grid={{
              tiles,
            }}
          />
        );
    }
  }

  return (
    <div
      className={`flex ${
        powerup ? "bg-blue-900" : "bg-blue-400"
      } pb-20 box-border min-h-screen`}
    >
      <div className="flex align-top justify-center width w-full">
        <div className="flex flex-col items-center pt-5">
          <TurnComponent
            handleSubmit={handleSubmit}
            word={word}
            error={error}
            player={"player name"}
            powerup={powerup}
          />
          <div className="flex flex-row items-start justify-center">
            <PowerupsComponent
              funds={50}
              powerup={powerup}
              setPowerup={setPowerup}
            ></PowerupsComponent>
            {getGrid()}
            <PlayersComponent
              currentTurn={lobby.state.curr_turn}
              players={lobby.players}
              powerup={powerup}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Game;
