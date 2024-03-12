import { Typography } from "@mui/material";
import { Board } from "../../data/model";
import { useState, useEffect, useRef } from "react";

const nullTile = [-1, -1];

interface SwapGridComponentProps {
  grid: Board;
  board_size: [number, number];
  setPowerup: any;
  help: string;
  setHelp: any;
}

interface TileComponentProps {
  grid: Board;
  x: number;
  y: number;
  help: string;
  setHelp: any;
  secondTile: number[];
  setSecondTile: any;
  setFirstTile: any;
  firstTile: number[];
  setPowerup: any;
}

function isTileEqual(t1: number[], t2: number[]) {
  return t1[1] === t2[1] && t1[0] === t2[0];
}

const Tile: React.FC<TileComponentProps> = ({
  x,
  y,
  grid,
  help,
  setHelp,
  setSecondTile,
  secondTile,
  firstTile,
  setFirstTile,
  setPowerup,
}) => {
  const selected =
    isTileEqual(firstTile, [x, y]) || isTileEqual(secondTile, [x, y]);

  function handleClick(e: any) {
    if (!isTileEqual(firstTile, nullTile) && !isTileEqual(secondTile, nullTile))
      return; //Selection is locked in

    if (isTileEqual(firstTile, [x, y])) {
      setFirstTile(nullTile);
      setHelp("Select the first tile to swap");
    } else if (isTileEqual(firstTile, nullTile)) {
      setFirstTile([x, y]);
      setHelp("Select the second tile to swap");
    } else {
      setSecondTile([x, y]);
      // TODO: SEND TO BACKEND

      setTimeout(() => {
        setHelp("");
        setPowerup(null);
      }, 500);
    }
  }

  useEffect(() => {
    setHelp("Select the first tile to swap");
  }, []);
  return (
    <div draggable="false" className="relative">
      <div
        draggable="false"
        onClick={handleClick}
        className={`relative cursor-pointer
        ${
          selected ? "bg-blue-200" : "bg-blue-400"
        } rounded-sm w-12 h-12 flex flex-col justify-center items-center z-10`}
      >
        <p
          draggable="false"
          className={`relative text-bold text-lg select-none z-1 ${
            selected ? "text-blue-600" : "text-slate-100"
          } text-center ${selected ? "bg-blue-200" : "bg-blue-400"}`}
        >
          {grid.tiles[y][x]}
        </p>
      </div>
    </div>
  );
};

export const SwapGridComponent: React.FC<SwapGridComponentProps> = ({
  grid,
  board_size,
  help,
  setHelp,
  setPowerup,
}) => {
  const [secondTile, setSecondTile] = useState(nullTile);
  const [firstTile, setFirstTile] = useState(nullTile);
  const buildGrid = () => {
    var idx = 0;
    const arr = Array(board_size[0] * board_size[1]);
    for (let i = 0; i < board_size[0]; i++) {
      for (let j = 0; j < board_size[1]; j++) {
        arr[idx] = (
          <Tile
            setPowerup={setPowerup}
            key={`${i}-${j}`}
            grid={grid}
            x={j}
            y={i}
            help={help}
            setHelp={setHelp}
            secondTile={secondTile}
            setSecondTile={setSecondTile}
            firstTile={firstTile}
            setFirstTile={setFirstTile}
          />
        );
        idx++;
      }
    }
    return arr;
  };
  return (
    <div
      draggable="false"
      onDragStart={(e) => {
        e.preventDefault();
      }}
      className={`mt-2 mx-2 p-4 grid grid-rows-${board_size[1]} grid-cols-${board_size[0]}
      gap-4 my-auto bg-blue-500 rounded-sm`}
    >
      {buildGrid()}
    </div>
  );
};
