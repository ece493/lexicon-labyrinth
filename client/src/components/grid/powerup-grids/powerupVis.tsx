import { Board } from "../../../data/model";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { GridComponent } from "../grid";
import { TileComponent, nullTile, isTileEqual } from "../tile";
import { Fade } from "@mui/material";
import { motion } from "framer-motion";
import React from "react";

interface PowerupVisComponentProps {
  grid: Board;
  board_size: [number, number];
  setWord: any;
  disabled: boolean
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
      setShowSelf(true)
      const t1 = tiles[0];
      const t2 = tiles[1];
      const xDif = t1[0] - t2[0];
      const yDif = t1[1] - t2[1];

      tilePositions[t1[1]][t1[0]].x = -1*shiftVal * xDif;
      tilePositions[t1[1]][t1[0]].y = -1*shiftVal * yDif;
      tilePositions[t2[1]][t2[0]].x =  shiftVal * xDif;
      tilePositions[t2[1]][t2[0]].y =  shiftVal * yDif;

      setTimeout(() => {
        setShowSelf(false)
        onComplete();
        setTilePositions(getDefaultPosGrid(grid));
      }, 1000);
    },
    rotate(
      type: string,
      index: number,
      rotations: number,
      onComplete: () => void
    ) {},
    transform(tile: number[], char: string, onComplete: () => void) {
      setShowSelf(true)

      tilePositions[tile[1]][tile[0]].y = -30
      
      setTimeout(()=>{
        const tilePositionsCopy = [...tilePositions]
        tilePositionsCopy[tile[1]][tile[0]].y = 0
        setTilePositions(tilePositionsCopy)

        setTimeout(() => {
          setShowSelf(false)
          onComplete();
          setTilePositions(getDefaultPosGrid(grid));
        }, 240);
      },200)
    },
  }));

  useEffect(() => {
    setTilePositions(getDefaultPosGrid(grid));
  }, [grid]);

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
    setTilePositions(rotateTilesOne(type, index, 1));

    for (let i = 1; i <= rotations; i++) {
      setTimeout(
        () => setTilePositions(rotateTilesOne(type, index, 1)),
        200 * i
      );
    }
  }

  function buildTile(x: number, y: number, v: string) {
    return (
      <motion.div
        draggable="false"
        className="relative"
        animate={{
          x: tilePositions[y][x]?.x ?? 0,
          y: tilePositions[y][x]?.y ?? 0,
        }}
      >
        <div draggable="false" className={`z-20`}>
          <TileComponent value={v} />
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
