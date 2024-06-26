import { Board } from "../../data/model";
import { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import { GridComponent } from "./grid";
import { TileComponent, nullTile, isTileEqual } from "./tile";
import { Fade } from "@mui/material";
import { motion } from "framer-motion";

// FR17 - Tile.Drag
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

// FR17 - Tile.Drag
export interface SelectGridRef {
  fadePath: (t: number, setNewLobby: () => void) => void;
}

// FR17 - Tile.Drag
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
    
    function isDeselectableNonFirstTile(x: number, y: number) {
      if (wordPath.length < 1) return false;
      return (
        Math.abs(wordPath[wordPath.length - 1][0] - x) <= 1 &&
        Math.abs(wordPath[wordPath.length - 1][1] - y) <= 1 &&
        wordPath.some((n) => isTileEqual([x, y], n)) &&
        wordPath.length > 1
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
      setWord(grid[y][x]);
      setError(null);
      setWordPath([[x, y]]);
      setSelecting(true);
    }

    function handleSelectNonFirstTile(x: number, y: number) {
      if (selecting && isSelectableNonFirstTile(x, y)) {
        setWord(word + grid[y][x]);
        setWordPath([...wordPath, [x, y]]);
      }else if (selecting && isDeselectableNonFirstTile(x, y)){
        setWord(word.slice(0, word.length - 1));
        setWordPath(wordPath.slice(0, wordPath.length - 1));
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
          key={`${fadeOutSelected}`}
          animate={{
            opacity: fadeOutSelected ? (selected ? 0 : 1) : 1,
          }}
        >
          <div
            draggable="false"
            onPointerDown={(e) => { (e.target as HTMLDivElement).releasePointerCapture(e.pointerId); handleSelectStart(x, y)}}
            onPointerEnter={(e) => handleSelectNonFirstTile(x, y)}
            className={`z-20 ${
              !selecting || (selecting && isSelectableNonFirstTile(x, y))
                ? "cursor-pointer"
                : "cursor-default"
            } touch-none`}
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
        style={{
          opacity: disabled ? "0.5" : "",
        }}
        draggable="false"
        onDragStart={(e) => {
          e.preventDefault();
        }}
        onPointerUp={(e) => {
          setSelecting(false);
        }}
        onPointerLeave={(e) => {
          setSelecting(false);
        }}
        className="relative"
      >
        {disabled ? (
          <div className="bg-transparent w-full h-full absolute z-40" />
        ) : null}
          <GridComponent
            grid={grid}
            board_size={board_size}
            buildChild={buildTile}
          />
      </div>
    );
  }
);
