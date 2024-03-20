import { Board } from "../../data/model";
import { useState } from "react";
import { GridComponent } from "./grid";
import { TileComponent, nullTile, isTileEqual } from "./tile";
import { Fade } from "@mui/material";

interface GridComponentProps {
  grid: Board;
  board_size: [number, number];
  word: string;
  setWord: any;
  wordPath: number[][];
  setWordPath: any;
  setError: any;
}

export const SelectionGridComponent: React.FC<GridComponentProps> = ({
  grid,
  board_size,
  word,
  setWord,
  wordPath,
  setWordPath,
  setError,
}) => {
  const [firstTile, setFirstTile] = useState(nullTile);
  const [selecting, setSelecting] = useState(false);

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
    setWord(grid.tiles[y][x]);
    setError(null);
    setWordPath([[x, y]]);
    setSelecting(true);
  }

  function handleSelectNonFirstTile(x: number, y: number) {
    if (selecting && isSelectableNonFirstTile(x, y)) {
      setWord(word + grid.tiles[y][x]);
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
      <div draggable="false" className="relative">
        <div
          draggable="false"
          onMouseDown={(e) => handleSelectStart(x, y)}
          onTouchStart={(e) => handleSelectStart(x, y)}
          onMouseEnter={(e) => handleSelectNonFirstTile(x, y)}
          className={`${
            !selecting || (selecting && isSelectableNonFirstTile(x, y))
              ? "cursor-pointer"
              : "cursor-default"
          }`}
        >
          <TileComponent value={v} selected={selected} disabled={selecting && !isSelectableNonFirstTile(x, y) && !selected}/>
        </div>
        {selected && !isTileEqual([x, y], firstTile)
          ? <Fade in={selected && !isTileEqual([x, y], firstTile)} timeout={300}>{renderPathLine(indexInPath, x, y)}</Fade>
          : null}
      </div>
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
    >
      <GridComponent
        grid={grid}
        board_size={board_size}
        buildChild={buildTile}
      />
    </div>
  );
};
