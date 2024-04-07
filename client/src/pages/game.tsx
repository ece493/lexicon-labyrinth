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
import {
  PowerupVisComponent,
  PowerupVisComponentRef,
} from "../components/grid/powerup-grids/powerupVis";

const letterPoints: { [key: string]: number } = {
  A: 1,
  E: 1,
  I: 1,
  O: 1,
  U: 1,
  L: 1,
  N: 1,
  S: 1,
  T: 1,
  R: 1,
  D: 2,
  G: 2,
  B: 3,
  C: 3,
  M: 3,
  P: 3,
  F: 4,
  H: 4,
  V: 4,
  W: 4,
  Y: 4,
  K: 5,
  J: 8,
  X: 8,
  Q: 10,
  Z: 10,
};

let gameTime = { startTime: Date.now() };
const Game: React.FC = () => {
  const ctx = useContext(GameContext);
  const [word, setWord] = useState("");
  const [error, setError] = useState<null | string>(null);

  // Timing
  const [time, setTime] = React.useState(
    ctx?.lobby?.timer_setting ?? 60
  );
  const [startedTimer, setStartedTimer] = useState(false);
  const [sentTurnEnd, setSentTurnEnd] = useState(false);
  const [isAwaitingWord, setIsAwaitingWord] = useState(false);

  useEffect(() => {
    if (
      time <= 0 &&
      ctx.playerId === ctx.lobby?.state?.curr_turn &&
      !isAwaitingWord &&
      !sentTurnEnd
    ) {
      resetWordSelection();
      ctx.transitions.notifyTurnEnd(ctx);
      setSentTurnEnd(true);
    }
  }, [time]);

  useEffect(() => {
    if (!startedTimer) {
      setStartedTimer(true);
      setInterval(() => {
        let newTime = Math.ceil(
          (ctx?.lobby?.timer_setting ?? 60) -
            (Date.now() - gameTime.startTime) / 1000
        );
        setTime(newTime);
      }, 1000);
    }
  }, [ctx?.lobby?.timer_setting]);

  function isSpectator() {
    return ctx.lobby?.state.curr_turn !== ctx.playerId;
  }

  // May have to change where this is stored to prevent too much re-rendering
  const [wordPath, setWordPath] = useState<number[][]>([]);
  const [powerup, setPowerup] = useState<string | null>(null);

  const turnRef = useRef<TurnRef>(null);
  const selectGridRef = useRef<SelectGridRef>(null);
  const playersRef = useRef<PlayersRef>(null);
  const powerupVisRef = useRef<PowerupVisComponentRef>(null);

  function resetWordSelection() {
    setWord("");
    setWordPath([]);
  }

  function handleSubmit() {
    if (ctx.sock !== null) {
      setIsAwaitingWord(true);
      ctx.transitions.pickWord(wordPath, ctx);
    }
  }

  function loadReceiveCallBacks() {
    ctx.receiveCallBacks.handleWordDeny = (path: number[][], tiles: Board) => {
      setPowerup(null);
      setError("Word has already been played or is invalid!");
      if (turnRef.current) turnRef.current.shakeWord();
      setWord(reconstructWord(path, tiles));
      setTimeout(() => {
        setIsAwaitingWord(false);
        setTimeout(() => {
          ctx.setFreezeInputs(false);
        }, 100);
      }, 400);
    };
    ctx.receiveCallBacks.handleWordAccept = (
      path: number[][],
      newLobby: Lobby
    ) => {
      ctx.pauseMessages.pause = true;
      setError(null);
      setPowerup(null);
      setWord(reconstructWord(path, newLobby.state.board));
      setWordPath(path);
      selectGridRef.current?.fadePath(1200, () => {
        ctx.setLobby(newLobby);
        setTimeout(() => (ctx.pauseMessages.pause = false), 100);
      });
    };
    ctx.receiveCallBacks.handleNewTurn = (newLobby: Lobby) => {
      setPowerup(null);
      setError(null);
      ctx.setLobby(newLobby);
      setSentTurnEnd(false);
      gameTime.startTime = Date.now();

      setTimeout(() => {
        ctx.setFreezeInputs(false);
        setIsAwaitingWord(false);
      }, 500);
    };
    ctx.receiveCallBacks.handleLoseLife = (
      newLobby: Lobby,
      playerId: string
    ) => {
      ctx.pauseMessages.pause = true;
      setPowerup(null);
      setError(null);
      let player = newLobby.players.find((p) => p.id === playerId);
      if (playerId === ctx.playerId) {
        setWord(`You lost a life!`);
      } else {
        setWord(`${player?.name ?? player} lost a life!`);
      }
      playersRef.current?.loseLife(playerId, () => {
        ctx.setLobby(newLobby);
        setTimeout(() => (ctx.pauseMessages.pause = false), 100);
      });
    };
    ctx.receiveCallBacks.handleDeath = (newLobby: Lobby, playerId: string) => {
      ctx.pauseMessages.pause = true;
      setPowerup(null);
      setError(null);
      let player = newLobby.players.find((p) => p.id === playerId);
      if (playerId === ctx.playerId) {
        setWord(`You are out!`);
      } else {
        setWord(`${player?.name ?? player} is out!`);
      }
      playersRef.current?.endPlayer(playerId, () => {
        ctx.setLobby(newLobby);
        setTimeout(() => (ctx.pauseMessages.pause = false), 800);
      });
    };
    ctx.receiveCallBacks.handleGameEnd = (newLobby: Lobby) => {
      setPowerup(null);
      setError(null);
      setTimeout(() => ctx.setFreezeInputs(false), 500);
    };
    ctx.receiveCallBacks.handleRotateAccept = (
      newLobby: Lobby,
      type: string,
      index: number,
      rotations: number
    ) => {
      ctx.pauseMessages.pause = true;
      setError(null);
      setPowerup(null);
      powerupVisRef.current?.rotate(type, index, rotations, () => {
        ctx.setLobby(newLobby);
        ctx.setFreezeInputs(false);
        setTimeout(() => (ctx.pauseMessages.pause = false), 100);
      });
    };
    ctx.receiveCallBacks.handleTransformAccept = (
      newLobby: Lobby,
      tile: number[],
      newChar: string
    ) => {
      ctx.pauseMessages.pause = true;
      setPowerup(null);
      setError(null);
      powerupVisRef.current?.transform(tile, newChar, () => {
        ctx.setLobby(newLobby);
        ctx.setFreezeInputs(false);
        setTimeout(() => (ctx.pauseMessages.pause = false), 100);
      });
    };
    ctx.receiveCallBacks.handleScrambleAccept = (newLobby: Lobby) => {
      ctx.pauseMessages.pause = true;
      setPowerup(null);
      setError(null);
      setPowerup("SCRAMBLE");
      setTimeout(() => {
        ctx.setLobby(newLobby);
        ctx.setFreezeInputs(false);
        setPowerup(null);
        setTimeout(() => (ctx.pauseMessages.pause = false), 100);
      }, 1120);
    };
    ctx.receiveCallBacks.handleSwapAccept = (
      newLobby: Lobby,
      tiles: number[][]
    ) => {
      ctx.pauseMessages.pause = true;
      setPowerup(null);
      setError(null);
      powerupVisRef.current?.swap(tiles, () => {
        ctx.setLobby(newLobby);
        ctx.setFreezeInputs(false);
        setTimeout(() => (ctx.pauseMessages.pause = false), 100);
      });
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

  function getPlayerName() {
    const player = ctx.lobby?.players.find(
      (p) => p.id === ctx.lobby?.state.curr_turn
    );
    if (!player) return "player";
    return player.id === ctx.playerId ? "Your" : player?.name;
  }

  function getPotentialFunds(tiles: Board) {
    let funds = 0;
    wordPath.forEach((e) => {
      funds += letterPoints[tiles[e[1]][e[0]]];
    });
    return funds;
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
                  <div className="bg-transparent opacity-20 w-full h-full absolute z-40" />
                ) : null}
              </div>
            </Fade>
            <div className="flex align-top justify-center width w-full ">
              <div className="flex flex-col items-center pt-5">
                <TurnComponent
                  ref={turnRef}
                  handleSubmit={handleSubmit}
                  word={word}
                  disabled={isSpectator() || ctx.freezeInputs}
                  error={error}
                  player={getPlayerName()}
                  powerup={powerup}
                  time={time}
                  resetWord={resetWordSelection}
                  potentialFunds={getPotentialFunds(
                    ctx?.lobby?.state?.board ?? [[]]
                  )}
                />
                <div className="flex flex-col sm:flex-row sm:items-start items-center justify-center">
                  <PowerupsComponent
                    funds={
                      ctx.lobby?.players?.find((p) => p.id === ctx.playerId)
                        ?.money ?? 0
                    }
                    powerup={powerup}
                    setPowerup={setPowerup}
                    disabled={isSpectator() || ctx.freezeInputs}
                    resetWordSelection={resetWordSelection}
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
                  <div className="absolute z-20">
                    <PowerupVisComponent
                      setWord={setWord}
                      board_size={[
                        ctx.lobby?.board_size ?? 0,
                        ctx.lobby?.board_size ?? 0,
                      ]}
                      grid={ctx.lobby?.state?.board ?? []}
                      ref={powerupVisRef}
                      disabled={isSpectator() || ctx.freezeInputs}
                    />
                  </div>
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
        <div>
          {!ctx.lobby?.state?.board?.[0].length ? (
            <div className="flex pt-20">
              <CircularProgress className="m-auto" />
            </div>
          ) : (
            <></>
          )}
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
