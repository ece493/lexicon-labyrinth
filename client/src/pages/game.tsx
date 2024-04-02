import React, { useEffect, useRef } from "react";
import {
  SelectGridRef,
  SelectionGridComponent,
} from "../components/grid/selectionGrid";
import TurnComponent, { TurnRef } from "../components/grid/turn";
import PowerupsComponent from "../components/grid/powerups";
import PlayersComponent, { PlayersRef } from "../components/grid/players";
import { Board, Bot, Lobby, Player, ScreenState } from "../data/model";
import { useState, useContext } from "react";
import { SwapGridComponent } from "../components/grid/powerup-grids/swapGrid";
import { RotateGridComponent } from "../components/grid/powerup-grids/rotateGrid";
import { TransformGridComponent } from "../components/grid/powerup-grids/transformGrid";
import { ScrambleGridComponent } from "../components/grid/powerup-grids/scrambleGrid";
import { GameContext } from "../context/ctx";
import { isJSDocNullableType } from "typescript";
import { Fade, Zoom, CircularProgress } from "@mui/material";
import { motion } from "framer-motion";
import { lobby1, lobby2, lobby3 } from "../mocks/lobbyMocks";

const Game: React.FC = () => {
  useEffect(() => {
    // setTimeout(() => {
    //   let lobbyCopy = { ...ctx.lobby };
    //   lobbyCopy.state.curr_turn = "3";
    //   ctx.setLobby(lobbyCopy);
    // }, 1000);
  }, []);

  const ctx = useContext(GameContext);
  const [word, setWord] = useState("");
  const [error, setError] = useState<null | string>(null);
  const [showGame, setShowGame] = useState(false);
  const [disableInput, setDisableInput] = useState(false);

  function isSpectator() {
    return ctx.lobby?.state.curr_turn !== ctx.playerId;
  }

  // May have to change where this is stored to prevent too much re-rendering
  const [wordPath, setWordPath] = useState<number[][]>([]);
  const [powerup, setPowerup] = useState<string | null>(null);

  const turnRef = useRef<TurnRef>(null);
  const selectGridRef = useRef<SelectGridRef>(null);
  const playersRef = useRef<PlayersRef>(null);

  function resetWordSelection() {
    setWord("");
    setWordPath([]);
  }

  function handleSubmit() {
    if (ctx.sock !== null) {
      ctx.transitions.pickWord(wordPath, ctx);
    }
  }
  function loadReceiveCallBacks() {
    ctx.receiveCallBacks.handleWordDeny = (path: number[][], tiles: Board) => {
      setPowerup(null);
      setError("Word has already been played or is invalid!");
      if (turnRef.current) turnRef.current.shakeWord();
      setWord(reconstructWord(path, tiles));
      setTimeout(() => ctx.setFreezeInputs(false), 500);
    };
    ctx.receiveCallBacks.handleWordAccept = (
      path: number[][],
      newLobby: Lobby
    ) => {
      console.log("DOING WORD ACCEPT", newLobby,path)
      setPowerup(null);
      setWord(reconstructWord(path, newLobby.state.board));
      setWordPath(path);
      selectGridRef.current?.fadePath(1200, () => {
        ctx.setLobby(newLobby);
        // setTimeout(() => ctx.setFreezeInputs(false), 500);
      });
    };
    ctx.receiveCallBacks.handleNewTurn = (newLobby: Lobby) => {
      console.log("DOING TURN CALLBACK", newLobby)
      setPowerup(null);
      ctx.setLobby(newLobby);
      console.log("Checkpoint")
      turnRef.current?.resetTimer();
      setTimeout(() => ctx.setFreezeInputs(false), 500);
      
    };
    ctx.receiveCallBacks.handleLoseLife = (
      newLobby: Lobby,
      playerId: string
    ) => {
      setPowerup(null);
      let player = newLobby.players.find((p) => p.id === playerId);
      if (playerId === ctx.playerId) {
        setWord(`You lost a life!`);
      } else {
        setWord(`${player?.name ?? player} lost a life!`);
      }
      playersRef.current?.loseLife(
        playerId,
        () => ctx.setLobby(newLobby),
        () => {//ctx.setFreezeInputs(false)
        }
      );
    };
    ctx.receiveCallBacks.handleDeath = (newLobby: Lobby, playerId: string) => {
      setPowerup(null);
      let player = newLobby.players.find((p) => p.id === playerId);
      if (playerId === ctx.playerId) {
        setWord(`You are out!`);
      } else {
        setWord(`${player?.name ?? player} is out!`);
      }
      playersRef.current?.endPlayer(
        playerId,
        () => ctx.setLobby(newLobby),
        () => {//ctx.setFreezeInputs(false)
        }
      );
    };
    ctx.receiveCallBacks.handleGameEnd = (newLobby: Lobby) => {
      setPowerup(null);
      setTimeout(() => ctx.setFreezeInputs(false), 500);
    };
    ctx.receiveCallBacks.handleRotateAccept = (
      newLobby: Lobby,
      type: string,
      index: number,
      rotations: number
    ) => {
      setPowerup(null);
      ctx.setLobby(newLobby);
      setTimeout(() => ctx.setFreezeInputs(false), 500);
    };
    ctx.receiveCallBacks.handleTransformAccept = (
      newLobby: Lobby,
      tile: number[],
      newChar: string
    ) => {
      setPowerup(null);
      ctx.setLobby(newLobby);
      setTimeout(() => ctx.setFreezeInputs(false), 500);
    };
    ctx.receiveCallBacks.handleScrambleAccept = (newLobby: Lobby) => {
      setPowerup(null);
      ctx.setLobby(newLobby);
      setTimeout(() => ctx.setFreezeInputs(false), 500);
    };
    ctx.receiveCallBacks.handleSwapAccept = (
      newLobby: Lobby,
      tiles: number[][]
    ) => {
      setPowerup(null);
      ctx.setLobby(newLobby);
      setTimeout(() => ctx.setFreezeInputs(false), 500);
    };
  }

  function reconstructWord(path: number[][], tiles: Board) {
    let word = "";
    for (let wCoord of path) {
      word += tiles[wCoord[1]][wCoord[0]];
    }
    return word;
  }

  useEffect(() => {
    loadReceiveCallBacks();
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
                board_size={[
                  ctx.lobby?.board_size ?? 0,
                  ctx.lobby?.board_size ?? 0,
                ]}
                grid={ctx.lobby?.state?.board ?? []}
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
                board_size={[
                  ctx.lobby?.board_size ?? 0,
                  ctx.lobby?.board_size ?? 0,
                ]}
                ogGrid={ctx.lobby?.state?.board ?? []}
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
                board_size={[
                  ctx.lobby?.board_size ?? 0,
                  ctx.lobby?.board_size ?? 0,
                ]}
                grid={ctx.lobby?.state?.board ?? []}
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
            board_size={[
              ctx.lobby?.board_size ?? 0,
              ctx.lobby?.board_size ?? 0,
            ]}
            grid={ctx.lobby?.state?.board ?? []}
            resetWordSelection={resetWordSelection}
          />
        );

      default:
        return <div></div>;
    }
  }

  function renderGame() {
    return (
      <div>
        {!ctx.lobby?.state?.board?.[0].length ||
        !(ctx.screen === ScreenState.GAME) ? (
          <></>
        ) : (
          <motion.div
            onClick={() => setError(null)}
            animate={{ backgroundColor: powerup ? "#1E3A8A" : "#60A5FA" }}
            className={`flex ${
              powerup ? "bg-blue-900" : "bg-blue-400"
            } pb-20 box-border min-h-screen`}
          >
            <Fade in={ctx.freezeInputs}>
              <div>
                {ctx.freezeInputs ? (
                  <div className="bg-black opacity-20 w-full h-full absolute z-40" />
                ) : null}
              </div>
            </Fade>
            <div className="flex align-top justify-center width w-full">
              <div className="flex flex-col items-center pt-5">
                <TurnComponent
                  ref={turnRef}
                  handleSubmit={handleSubmit}
                  word={word}
                  disabled={isSpectator() || ctx.freezeInputs}
                  error={error}
                  player={
                    ctx.lobby?.players.find(
                      (p) => p.id === ctx.lobby?.state.curr_turn
                    )?.name ?? "player"
                  }
                  powerup={powerup}
                  maxTime={60}
                  resetWord={resetWordSelection}
                />
                <div className="flex flex-row items-start justify-center">
                  <PowerupsComponent
                    funds={
                      ctx.lobby?.players?.find((p) => p.id === ctx.playerId)
                        ?.money ?? 0
                    }
                    powerup={powerup}
                    setPowerup={setPowerup}
                    disabled={isSpectator() || ctx.freezeInputs}
                  ></PowerupsComponent>
                  <div style={{ opacity: powerup ? "0.2" : "" }}>
                    <SelectionGridComponent
                      wordPath={wordPath}
                      resetSelection={resetWordSelection}
                      setWordPath={setWordPath}
                      word={word}
                      setWord={setWord}
                      setError={setError}
                      board_size={[
                        ctx.lobby?.board_size ?? 0,
                        ctx.lobby?.board_size ?? 0,
                      ]}
                      grid={ctx.lobby?.state?.board ?? [["e"]]}
                      ref={selectGridRef}
                      disabled={isSpectator() || ctx.freezeInputs}
                    />
                  </div>
                  <div className="absolute z-20">{getPowerupGrid()}</div>
                  <PlayersComponent
                    currentTurn={ctx.lobby?.state?.curr_turn ?? ""}
                    players={ctx.lobby?.players ?? []}
                    powerup={powerup}
                    ref={playersRef}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}{" "}
      </div>
    );
  }
  return ctx.screen === ScreenState.GAME ? (
    <div>
      <Fade in={!ctx.lobby?.state?.board?.[0].length} timeout={400}>
        <div className="flex pt-20">
          <CircularProgress className="m-auto" />
        </div>
      </Fade>
      <Fade
        in={
          !!ctx.lobby?.state?.board?.[0].length &&
          ctx.screen === ScreenState.GAME
        }
        timeout={400}
      >
        {renderGame()}
      </Fade>
    </div>
  ) : (
    <h1>TEST</h1>
  );
};

export default Game;
