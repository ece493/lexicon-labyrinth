import React, { useEffect, useRef } from "react";
import {
  SelectGridRef,
  SelectionGridComponent,
} from "../components/grid/selectionGrid";
import TurnComponent, { TurnRef } from "../components/grid/turn";
import PowerupsComponent from "../components/grid/powerups";
import PlayersComponent, { PlayersRef } from "../components/grid/players";
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
import { lobby1, lobby2, lobby3 } from "../mocks/lobbyMocks";

const Game: React.FC = () => {
  const [lobby, setLobby] = useState<Lobby>();

  useEffect(() => {
    // setTimeout(() => {
    //   let lobbyCopy = { ...lobby };
    //   lobbyCopy.state.curr_turn = "3";
    //   setLobby(lobbyCopy);
    // }, 1000);
  }, []);

  const gameContext = useContext(GameContext);
  const [word, setWord] = useState("");
  const [error, setError] = useState<null | string>(null);
  const [showGame, setShowGame] = useState(false);
  const [disableInput, setDisableInput] = useState(false);

  function isSpectator() {
    return lobby?.state.curr_turn !== gameContext.playerId;
  }
  console.log(lobby?.state.curr_turn, gameContext.playerId)

  // May have to change where this is stored to prevent too much re-rendering
  const [wordPath, setWordPath] = useState<number[][]>([]);

  const turnRef = useRef<TurnRef>(null);
  const selectGridRef = useRef<SelectGridRef>(null);
  const playersRef = useRef<PlayersRef>(null);

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
    }
  }

  function loadReceiveCallBacks() {
    gameContext.receiveCallBacks.handleWordDeny = (path: number[][]) => {
      setError("Word has already been played!");
      if (turnRef.current) turnRef.current.shakeWord();
      setWord(reconstructWord(path));
    };
    gameContext.receiveCallBacks.handleWordAccept = (
      path: number[][],
      newLobby: Lobby
    ) => {
      setWord(reconstructWord(path));
      setWordPath(path);
      selectGridRef.current?.fadePath(1200, () => setLobby(newLobby));
    };
    gameContext.receiveCallBacks.handleNewTurn = (newLobby: Lobby) => {
      setLobby(newLobby);
      turnRef.current?.resetTimer();
    };
    gameContext.receiveCallBacks.handleLoseLife = (
      newLobby: Lobby,
      playerId: string
    ) => {
      playersRef.current?.loseLife(playerId, () => setLobby(newLobby));
    };
    gameContext.receiveCallBacks.handleDeath = (
      newLobby: Lobby,
      playerId: string
    ) => {
      playersRef.current?.endPlayer(playerId, () => setLobby(newLobby));
    };
    gameContext.receiveCallBacks.handleGameEnd = (newLobby: Lobby) => {};
  }

  function reconstructWord(path: number[][]) {
    let word = "";
    for (let wCoord of path) {
      word += lobby!.state.board[wCoord[0]][wCoord[1]];
    }
    return word;
  }

  useEffect(() => {
    loadReceiveCallBacks();

    // setTimeout(
    //   () => gameContext.receiveCallBacks.handleLoseLife(lobby3, "1"),
    //   400
    // );
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
                board_size={[lobby?.board_size ?? 0, lobby?.board_size ?? 0]}
                grid={lobby?.state?.board ?? []}
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
                board_size={[lobby?.board_size ?? 0, lobby?.board_size ?? 0]}
                ogGrid={lobby?.state?.board ?? []}
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
                board_size={[lobby?.board_size ?? 0, lobby?.board_size ?? 0]}
                grid={lobby?.state?.board ?? []}
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
            board_size={[lobby?.board_size ?? 0, lobby?.board_size ?? 0]}
            grid={lobby?.state?.board ?? []}
            resetWordSelection={resetWordSelection}
          />
        );

      default:
        return <div></div>;
    }
  }
  console.log(lobby)
  return (
    <Fade in={!!lobby} timeout={400}>
      {!lobby ? <></> : (
        <motion.div
          onClick={() => setError(null)}
          animate={{ backgroundColor: powerup ? "#1E3A8A" : "#60A5FA" }}
          className={`flex ${
            powerup ? "bg-blue-900" : "bg-blue-400"
          } pb-20 box-border min-h-screen`}
        >
          {disableInput ? (
            <div className="bg-transparent w-full h-full absolute z-40" />
          ) : null}
          <div className="flex align-top justify-center width w-full">
            <div className="flex flex-col items-center pt-5">
              <TurnComponent
                ref={turnRef}
                handleSubmit={handleSubmit}
                word={word}
                disabled={isSpectator()}
                error={error}
                player={
                  lobby?.players.find((p) => p.id === lobby.state.curr_turn)
                    ?.name ?? "player"
                }
                powerup={powerup}
              />
              <div className="flex flex-row items-start justify-center">
                <PowerupsComponent
                  funds={
                    lobby?.players?.find((p) => p.id === gameContext.playerId)
                      ?.money ?? 0
                  }
                  powerup={powerup}
                  setPowerup={setPowerup}
                  disabled={isSpectator()}
                ></PowerupsComponent>
                <div style={{ opacity: powerup ? "0.2" : "" }}>
                  <SelectionGridComponent
                    wordPath={wordPath}
                    resetSelection={resetWordSelection}
                    setWordPath={setWordPath}
                    word={word}
                    setWord={setWord}
                    setError={setError}
                    board_size={[lobby?.board_size ?? 0, lobby?.board_size ?? 0]}
                    grid={lobby?.state?.board ?? []}
                    ref={selectGridRef}
                    disabled={isSpectator()}
                  />
                </div>
                <div className="absolute z-20">{getPowerupGrid()}</div>
                <PlayersComponent
                  currentTurn={lobby?.state?.curr_turn ?? ""}
                  players={lobby?.players ?? []}
                  powerup={powerup}
                  ref={playersRef}
                />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </Fade>
  );
};

export default Game;
