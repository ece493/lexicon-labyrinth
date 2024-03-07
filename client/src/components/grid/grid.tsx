import { Typography } from "@mui/material";
import { Board } from "../../data/model";
import { useState, useEffect } from "react";

interface GridComponentProps {
  grid: Board;
  board_size: [number, number];
  word: string;
  setWord: any;
}

interface TileComponentProps {
  grid: Board;
  x: number;
  y: number;
  word: string;
  setWord: any;
}

const Tile: React.FC<TileComponentProps> = ({ x, y, grid, word, setWord }) => {
  const [selected, setSelected] = useState(false);
  const [isFirstTile, setIsFirstTile] = useState(false);

  //TODO
  // prevent double selections, ensure adjacent selections, style better

  useEffect(() => {
    if (word.length === 1 && !isFirstTile) {
      setSelected(false);
    }
  }, [word]);

  return (
    <div
      draggable="true"
      onDrag={(e) => {
        if (!selected || !isFirstTile) {
          setIsFirstTile(true);
          setSelected(true);
          setWord(grid.tiles[y][x]);
        }
      }}
      onDragEnd={(e) => {
        setIsFirstTile(false);
      }}
      onDragOver={(e) => {
        if (!selected) {
          setWord(word + grid.tiles[y][x]);
          setSelected(true);
        }
      }}
      className="cursor-pointer bg-blue-400 rounded-sm w-12 h-12 flex flex-col justify-center items-center"
      style={{ opacity: selected ? "0.5" : "" }}
    >
      <p className="text-bold text-lg text-slate-100 text-center">
        {grid.tiles[y][x]}
      </p>
    </div>
  );
};

export const GridComponent: React.FC<GridComponentProps> = ({
  grid,
  board_size,
  word,
  setWord,
}) => {
  const buildGrid = () => {
    var idx = 0;
    const arr = Array(board_size[0] * board_size[1]);
    for (let i = 0; i < board_size[0]; i++) {
      for (let j = 0; j < board_size[1]; j++) {
        arr[idx] = (
          <Tile
            key={`${i}-${j}`}
            grid={grid}
            x={i}
            y={j}
            word={word}
            setWord={setWord}
          />
        );
        idx++;
      }
    }
    return arr;
  };
  return (
    <div
      className={`mt-2 mx-2 p-2 grid grid-rows-${board_size[1]} grid-cols-${board_size[0]}
      gap-2 my-auto bg-blue-500 rounded-sm`}
     
    >
      {buildGrid()}
    </div>
  );
};
