import React, { useEffect, useRef } from "react";
import { SelectionGridComponent } from "../components/grid/selectionGrid";
import TurnComponent, { TurnRef } from "../components/grid/turn";
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
import { Fade, Zoom } from "@mui/material";
import { motion } from "framer-motion";

const Game: React.FC = () => {
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
    money: 100,
  };
  const dead: Player = {
    id: "2",
    name: "P2",
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
  const [lobby, setLobby] = useState({
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
    host: 0,
    board_size: [7, 7],
    timer_setting: 30,
    lobby_code: "X3Y0EG",
    players: [host, p2, dead, bot],
  });

  useEffect(() => {
    setTimeout(() => {
      let lobbyCopy = { ...lobby };
      lobbyCopy.state.curr_turn = "3";
      setLobby(lobbyCopy);
    }, 1000);
  }, []);

  const gameContext = useContext(GameContext);
  const [word, setWord] = useState("");
  const [error, setError] = useState<null | string>(null);
  const [showGame, setShowGame] = useState(false);

  // May have to change where this is stored to prevent too much re-rendering
  const [wordPath, setWordPath] = useState([]);

  const turnRef = useRef<TurnRef>(null);

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
      gameContext.transitions.pickWord(wordPath, gameContext);
      if (turnRef.current) turnRef.current.shakeWord();
    }
  }

  function loadReceiveCallBacks() {
    gameContext.receiveCallBacks.handleWordDeny = (path: number[][]) => {
      setError("Word has already been played!");
      setWord(reconstructWord(path));
    };
  }

  function reconstructWord(path: number[][]) {
    let word = "";
    for (let wCoord of path) {
      word += lobby.state.board.tiles[wCoord[0]][wCoord[1]];
    }
    return word;
  }

  useEffect(() => {
    loadReceiveCallBacks();
    setShowGame(true);
  }, []);

  function getPowerupGrid() {
    switch (powerup) {
      case "SWAP":
        return (
          <Zoom in={true}>
            <div>
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
            </div>
          </Zoom>
        );
      case "ROTATE":
        return (
          <Zoom in={true}>
            <div>
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
            </div>
          </Zoom>
        );
      case "TRANSFORM":
        return (
          <Zoom in={true}>
            <div>
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
            </div>
          </Zoom>
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
        return <div></div>;
    }
  }

  return (
    <Fade in={showGame} timeout={400}>
      <motion.div
        onClick={() => setError(null)}
        animate={{ backgroundColor: powerup ? "#1E3A8A" : "#60A5FA" }}
        className={`flex ${
          powerup ? "bg-blue-900" : "bg-blue-400"
        } pb-20 box-border min-h-screen`}
      >
        <div className="flex align-top justify-center width w-full">
          <div className="flex flex-col items-center pt-5">
            <TurnComponent
              ref={turnRef}
              handleSubmit={handleSubmit}
              word={word}
              error={error}
              player={
                lobby.players.find((p) => p.id === lobby.state.curr_turn)?.name ?? "player"
              }
              powerup={powerup}
            />
            <div className="flex flex-row items-start justify-center">
              <PowerupsComponent
                funds={50}
                powerup={powerup}
                setPowerup={setPowerup}
              ></PowerupsComponent>
              <div style={{ opacity: powerup ? "0.2" : "" }}>
                <SelectionGridComponent
                  wordPath={wordPath}
                  setWordPath={setWordPath}
                  word={word}
                  setWord={setWord}
                  setError={setError}
                  board_size={[8, 8]}
                  grid={{
                    tiles,
                  }}
                />
              </div>
              <div className="absolute z-20">{getPowerupGrid()}</div>
              <PlayersComponent
                currentTurn={lobby.state.curr_turn}
                players={lobby.players}
                powerup={powerup}
              />
            </div>
          </div>
        </div>
      </motion.div>
    </Fade>
  );
};

export default Game;
