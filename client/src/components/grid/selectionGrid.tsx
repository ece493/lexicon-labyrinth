import { Board } from "../../data/model";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { GridComponent } from "./grid";
import { TileComponent, nullTile, isTileEqual } from "./tile";
import { Fade } from "@mui/material";
import { motion } from "framer-motion";

interface GridComponentProps {
  grid: Board;
  board_size: [number, number];
  word: string;
  setWord: any;
  wordPath: number[][];
  setWordPath: any;
  setError: any;
  resetSelection: () => void;
  disabled?: boolean;
}

export interface SelectGridRef {
  fadePath: (t: number, setNewLobby: () => void) => void;
}

function getRandomCharacter() {
  const characters = "abcdefghijklmnopqrstuvwxyz";
  const randomIndex = Math.floor(Math.random() * characters.length);
  return characters.charAt(randomIndex);
}

type TilePos = { x: number; y: number };
const shiftVal = 64;
function getDefaultPosGrid(grid: Board): TilePos[][] {  
  const tilePos: TilePos[][] = [];

  for (let i = 0; i < grid.length; i++) {
    tilePos.push([]);
    for (let j = 0; j < grid.length; j++) {
      tilePos[i].push({ x: 0, y: 0 });
    }
  }
  return tilePos;
}

export const SelectionGridComponent = forwardRef<
  SelectGridRef,
  GridComponentProps
>(
  (
    {
      grid,
      board_size,
      word,
      setWord,
      wordPath,
      setWordPath,
      setError,
      resetSelection,
      disabled,
    },
    ref
  ) => {
    const [firstTile, setFirstTile] = useState(nullTile);
    const [selecting, setSelecting] = useState(false);

    const [fadeOutSelected, setFadeOutSelected] = useState(false);
    const [fadeOutSelectedLines, setFadeOutSelectedLines] = useState(false);

    const [animating, setAnimating] = useState(false);
    const [animationGrid, setAnimatingGrid] = useState(grid);
    const [tilePositions, setTilePositions] = useState<TilePos[][]>(
      getDefaultPosGrid(grid)
    );

    const displayGrid = animating ? animationGrid : grid;

    useEffect(() => {
      console.log("Select init", grid, word);
    }, []);

    useEffect(() => {
      setTilePositions(getDefaultPosGrid(grid));
    }, [grid]);

    function animateTransform(coords: number[], newVal: string) {
      const setRandomChar = () => {
        const animationGridCopy = [...animationGrid];
        animationGridCopy[coords[0]][coords[1]] = getRandomCharacter();
      };
      setAnimating(true);
      setAnimatingGrid(displayGrid);

      setRandomChar();
      setTimeout(setRandomChar, 50);
      setTimeout(setRandomChar, 150);
      setTimeout(setRandomChar, 300);
      setTimeout(() => {
        const animationGridCopy = [...animationGrid];
        animationGridCopy[coords[0]][coords[1]] = newVal;
        setAnimating(false);
      }, 900);
    }

    function rotateTilesOne(
      type: string,
      index: number,
      rotations: number
    ): TilePos[][] {
      const newTilePos: TilePos[][] = [];
      if (type === "col") {
        for (let i = 0; i < tilePositions.length; i++) {
          newTilePos.push([]);
          for (let j = 0; j < tilePositions.length; j++) {
            if (j === index) {
              if (i >= tilePositions.length - rotations) {
                newTilePos[i].push({
                  x: tilePositions[i][j].x,
                  y:
                    tilePositions[i][j].y +
                    -1 * (tilePositions.length - rotations) * shiftVal,
                });
              } else {
                newTilePos[i].push({
                  x: tilePositions[i][j].x,
                  y: tilePositions[i][j].y + rotations * shiftVal,
                });
              }
            } else {
              newTilePos[i].push({
                x: tilePositions[i][j].x,
                y: tilePositions[i][j].y,
              });
            }
          }
        }
      } else {
        for (let i = 0; i < newTilePos.length; i++) {
          newTilePos.push([]);
          for (let j = 0; j < newTilePos.length; j++) {
            if (i === index) {
              newTilePos[i].push({ x: rotations * shiftVal, y: 0 });
            } else {
              newTilePos[i].push({ x: 0, y: 0 });
            }
          }
        }
      }
      return newTilePos;
    }
    function animateRotate(type: string, index: number, rotations: number) {
      setAnimating(true);
      setAnimatingGrid(displayGrid);
      setTilePositions(rotateTilesOne(type, index, 1));

      for (let i = 1; i <= rotations; i++) {
        setTimeout(
          () => setTilePositions(rotateTilesOne(type, index, 1)),
          200 * i
        );
      }
    }

    useImperativeHandle(ref, () => ({
      fadePath(time: number, setNewLobby: () => void) {
        setTimeout(() => {
          setFadeOutSelectedLines(true);
          setFadeOutSelected(true);
          setTimeout(() => {
            setWordPath([]);
            setWord("");
            setNewLobby();
            setTimeout(() => {
              setFadeOutSelected(false);
              setFadeOutSelectedLines(false);
            }, time * 0.1);
          }, time * 0.5);
        }, time * 0.4);
      },
    }));

    function isSelectableNonFirstTile(x: number, y: number) {
      if (wordPath.length < 1) return false;
      return (
        Math.abs(wordPath[wordPath.length - 1][0] - x) <= 1 &&
        Math.abs(wordPath[wordPath.length - 1][1] - y) <= 1 &&
        !wordPath.some((n) => isTileEqual([x, y], n))
      );
    }

    function getPrevTileDirection(x: number, y: number, indexInPath: number) {
      const prevTile = wordPath[indexInPath - 1];
      const xdif = prevTile[0] - x;
      const ydif = prevTile[1] - y;

      if (xdif > 0) {
        if (ydif === 0) return 0;
        if (ydif === -1) return 315;
        if (ydif === 1) return 45;
      } else if (xdif === 0) {
        if (ydif === -1) return -90;
        if (ydif === 1) return 90;
      } else if (xdif < 0) {
        if (ydif === 0) return 180;
        if (ydif === -1) return 225;
        if (ydif === 1) return 135;
      }
    }

    function handleSelectStart(x: number, y: number) {
      setFirstTile([x, y]);
      setWord(displayGrid[y][x]);
      setError(null);
      setWordPath([[x, y]]);
      setSelecting(true);
    }

    function handleSelectNonFirstTile(x: number, y: number) {
      if (selecting && isSelectableNonFirstTile(x, y)) {
        setWord(word + displayGrid[y][x]);
        setWordPath([...wordPath, [x, y]]);
      }
    }

    function renderPathLine(indexInPath: number, x: number, y: number) {
      return (
        <div
          draggable="false"
          className="z-0 absolute h-1 w-20 bg-blue-300 top-1/2 left-1/2 transform  -translate-y-1/2"
          style={{
            transform: `rotate(${getPrevTileDirection(x, y, indexInPath)}deg)`,
            transformOrigin: "center left",
          }}
        />
      );
    }

    function buildTile(x: number, y: number, v: string) {
      const indexInPath = wordPath.findIndex((n) => n[0] === x && n[1] === y);
      const selected = indexInPath >= 0;
      return (
        <motion.div
          draggable="false"
          className="relative"
          animate={{
            opacity: fadeOutSelected ? (selected ? 0 : 1) : 1,
            x: tilePositions[y][x]?.x ?? 0,
            y: tilePositions[y][x]?.y ?? 0,
          }}
        >
          <div
            draggable="false"
            onMouseDown={(e) => handleSelectStart(x, y)}
            onTouchStart={(e) => handleSelectStart(x, y)}
            onMouseEnter={(e) => handleSelectNonFirstTile(x, y)}
            className={`z-20 ${
              !selecting || (selecting && isSelectableNonFirstTile(x, y))
                ? "cursor-pointer"
                : "cursor-default"
            }`}
          >
            <TileComponent
              value={v}
              selected={selected}
              disabled={
                selecting && !isSelectableNonFirstTile(x, y) && !selected
              }
            />
          </div>
          {selected && !(indexInPath === 0) ? (
            <motion.div
              animate={{ opacity: fadeOutSelectedLines ? 0 : 1 }}
              transition={{ duration: 0.05 }}
            >
              <Fade
                in={selected && !isTileEqual([x, y], firstTile)}
                timeout={300}
              >
                {renderPathLine(indexInPath, x, y)}
              </Fade>
            </motion.div>
          ) : null}
        </motion.div>
      );
    }

    return (
      <div
        draggable="false"
        onDragStart={(e) => {
          e.preventDefault();
        }}
        onMouseUp={(e) => {
          setSelecting(false);
        }}
        onMouseLeave={(e) => {
          setSelecting(false);
        }}
        className="relative"
      >
        {disabled ? (
          <div className="bg-transparent w-full h-full absolute z-40" />
        ) : null}
        <GridComponent
          grid={displayGrid}
          board_size={board_size}
          buildChild={buildTile}
        />
      </div>
    );
  }
);
