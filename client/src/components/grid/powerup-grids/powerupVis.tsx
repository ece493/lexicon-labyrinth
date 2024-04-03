import { Board } from "../../../data/model";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { GridComponent } from "../grid";
import { TileComponent, nullTile, isTileEqual } from "../tile";
import { motion } from "framer-motion";
import React from "react";

interface PowerupVisComponentProps {
  grid: Board;
  board_size: [number, number];
  setWord: any;
  disabled: boolean;
}

function timeout(delay: number) {
  return new Promise((res) => setTimeout(res, delay));
}

function getSingleRotatedTilePos(
  type: string,
  index: number,
  tilePositions: TilePos[][],
  direction: string
): TilePos[][] {
  const newTilePos: TilePos[][] = [];
  if (type === "col") {
    for (let i = 0; i < tilePositions.length; i++) {
      newTilePos.push([]);
      for (let j = 0; j < tilePositions.length; j++) {
        if (j === index) {
          if (direction === "regular") {
            if (
              tilePositions[i][j].y ===
              (tilePositions.length - i - 1) * shiftVal
            ) {
              newTilePos[i].push({
                x: tilePositions[i][j].x,
                y: -1 * i * shiftVal,
                o: 0,
                s: true,
              });
            } else {
              newTilePos[i].push({
                x: tilePositions[i][j].x,
                y: tilePositions[i][j].y + shiftVal,
                o: 1,
                s: true,
              });
            }
          } else {
            if (tilePositions[i][j].y === -1 * i * shiftVal) {
              newTilePos[i].push({
                x: tilePositions[i][j].x,
                y: (tilePositions.length - i - 1) * shiftVal,
                o: 0,
                s: true,
              });
            } else {
              newTilePos[i].push({
                x: tilePositions[i][j].x,
                y: tilePositions[i][j].y + -1 * shiftVal,
                o: 1,
                s: true,
              });
            }
          }
        } else {
          newTilePos[i].push({
            x: tilePositions[i][j].x,
            y: tilePositions[i][j].y,
            o: 1,
            s: false,
          });
        }
      }
    }
  } else {
    for (let i = 0; i < tilePositions.length; i++) {
      newTilePos.push([]);
      for (let j = 0; j < tilePositions.length; j++) {
        if (i === index) {
          if (direction === "regular") {
            if (
              tilePositions[i][j].x ===
              (tilePositions.length - j - 1) * shiftVal
            ) {
              newTilePos[i].push({
                x: -1 * j * shiftVal,
                y: tilePositions[i][j].y,
                o: 0,
                s: true,
              });
            } else {
              newTilePos[i].push({
                x: tilePositions[i][j].x + shiftVal,
                y: tilePositions[i][j].y,
                o: 1,
                s: true,
              });
            }
          } else {
            if (tilePositions[i][j].x === -1 * j * shiftVal) {
              newTilePos[i].push({
                x: (tilePositions.length - j - 1) * shiftVal,
                y: tilePositions[i][j].y,
                o: 0,
                s: true,
              });
            } else {
              newTilePos[i].push({
                x: tilePositions[i][j].x + -1 * shiftVal,
                y: tilePositions[i][j].y,
                o: 1,
                s: true,
              });
            }
          }
        } else {
          newTilePos[i].push({
            x: tilePositions[i][j].x,
            y: tilePositions[i][j].y,
            o: 1,
            s: false,
          });
        }
      }
    }
  }
  console.log(newTilePos);
  return newTilePos;
}

type TilePos = { x: number; y: number; o: number; s: boolean };
const shiftVal = 64;
function getDefaultPosGrid(grid: Board): TilePos[][] {
  const tilePos: TilePos[][] = [];

  for (let i = 0; i < grid.length; i++) {
    tilePos.push([]);
    for (let j = 0; j < grid.length; j++) {
      tilePos[i].push({ x: 0, y: 0, o: 1, s: false });
    }
  }
  return tilePos;
}

function getShowAllGrid(tilePos: TilePos[][]): TilePos[][] {
  const newTilePos: TilePos[][] = [];

  for (let i = 0; i < tilePos.length; i++) {
    newTilePos.push([]);
    for (let j = 0; j < tilePos.length; j++) {
      newTilePos[i].push({
        x: tilePos[i][j].x,
        y: tilePos[i][j].y,
        o: 1,
        s: tilePos[i][j].s,
      });
    }
  }
  return newTilePos;
}

export interface PowerupVisComponentRef {
  swap: (t: number[][], onComplete: () => void) => void;
  rotate: (
    type: string,
    index: number,
    rotations: number,
    onComplete: () => void
  ) => void;
  transform: (tile: number[], char: string, onComplete: () => void) => void;
}

export const PowerupVisComponent = forwardRef<
  PowerupVisComponentRef,
  PowerupVisComponentProps
>(({ grid, board_size, setWord }, ref) => {
  const [tilePositions, setTilePositions] = useState<TilePos[][]>(
    getDefaultPosGrid(grid)
  );
  const [showSelf, setShowSelf] = useState(false);

  useImperativeHandle(ref, () => ({
    swap(tiles: number[][], onComplete: () => void) {
      setShowSelf(true);
      setWord("Swapping...");
      const t1 = tiles[0];
      const t2 = tiles[1];
      const xDif = t1[0] - t2[0];
      const yDif = t1[1] - t2[1];

      setTimeout(() => {
        const tilePositionsCopy = [...tilePositions];
        tilePositionsCopy[t1[1]][t1[0]].x = -1 * shiftVal * xDif;
        tilePositionsCopy[t1[1]][t1[0]].y = -1 * shiftVal * yDif;
        tilePositionsCopy[t1[1]][t1[0]].s = true;

        tilePositionsCopy[t2[1]][t2[0]].x = shiftVal * xDif;
        tilePositionsCopy[t2[1]][t2[0]].y = shiftVal * yDif;
        tilePositionsCopy[t2[1]][t2[0]].s = true;

        setTilePositions(tilePositionsCopy);

        setTimeout(() => {
          setWord("");
          setShowSelf(false);
          onComplete();
          setTilePositions(getDefaultPosGrid(grid));
        }, 400);
      }, 100);
    },
    async rotate(
      type: string,
      index: number,
      rotations: number,
      onComplete: () => void
    ) {
      setShowSelf(true);
      setWord("Rotating...");

      let newTilePos = getSingleRotatedTilePos(
        type,
        index,
        tilePositions,
        rotations > 0 ? "regular" : "reverse"
      );
      setTilePositions(newTilePos);
      await timeout(300);
      newTilePos = getShowAllGrid(newTilePos);
      setTilePositions(newTilePos);

      for (let i = 1; i < Math.abs(rotations); i++) {
        await timeout(350);
        newTilePos = getSingleRotatedTilePos(
          type,
          index,
          newTilePos,
          rotations > 0 ? "regular" : "reverse"
        );
        setTilePositions(newTilePos);
        await timeout(300);
        newTilePos = getShowAllGrid(newTilePos);
        setTilePositions(newTilePos);
      }
      setTimeout(() => {
        setWord("");
        onComplete();
        setTilePositions(getDefaultPosGrid(grid));
        setShowSelf(false);
      }, 200);
    },
    transform(tile: number[], char: string, onComplete: () => void) {
      setShowSelf(true);
      setWord("Transforming...");

      tilePositions[tile[1]][tile[0]].y = -30;
      tilePositions[tile[1]][tile[0]].s = true;

      setTimeout(() => {
        const tilePositionsCopy = [...tilePositions];
        tilePositionsCopy[tile[1]][tile[0]].y = 0;

        setTilePositions(tilePositionsCopy);

        setTimeout(() => {
          setWord("");
          setShowSelf(false);
          onComplete();
          setTilePositions(getDefaultPosGrid(grid));
        }, 240);
      }, 600);
    },
  }));

  useEffect(() => {
    setTilePositions(getDefaultPosGrid(grid));
  }, [grid]);

  function buildTile(x: number, y: number, v: string) {
    return (
      <motion.div
        draggable="false"
        className="relative"
        animate={{
          x: tilePositions[y][x]?.x ?? 0,
          y: tilePositions[y][x]?.y ?? 0,

          opacity: tilePositions[y][x]?.o,
        }}
        style={{}}
      >
        <div draggable="false" className={`z-20`}>
          <TileComponent value={v} selected={tilePositions[y][x]?.s} />
        </div>
      </motion.div>
    );
  }

  return (
    <div draggable="false" className="relative">
      {showSelf ? (
        <GridComponent
          grid={grid}
          board_size={board_size}
          buildChild={buildTile}
        />
      ) : null}
    </div>
  );
});
