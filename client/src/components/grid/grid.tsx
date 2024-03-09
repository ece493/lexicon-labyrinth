import { Typography } from "@mui/material";
import { Board } from "../../data/model";
import { useState, useEffect, useRef } from "react";

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
  setSelecting: any;
  selecting: boolean;
  setLastSelectedTile: any;
  lastSelectedTile: number[];
}

const Tile: React.FC<TileComponentProps> = ({
  x,
  y,
  grid,
  word,
  setWord,
  selecting,
  setSelecting,
  lastSelectedTile,
  setLastSelectedTile,
}) => {
  const [selected, setSelected] = useState(false);
  const [isFirstTileDuringMouseDown, setIsFirstTileDuringMouseDown] = useState(false);
  const [isFirstTileAfterMouseDown, setIsFirstTileAfterMouseDown] = useState(false);

  const [prevTile, setPrevTile] = useState([0,0]);
  const selfRef = useRef(null);

  useEffect(() => {
    if (word.length === 1 && !isFirstTileDuringMouseDown) {
      setSelected(false);
    }
    if (isFirstTileAfterMouseDown) setIsFirstTileAfterMouseDown(false)
  }, [word]);

  useEffect(() => {
    if (!selecting && isFirstTileDuringMouseDown) {
      setIsFirstTileDuringMouseDown(false);
      setIsFirstTileAfterMouseDown(true)
    }
  }, [selecting]);

  function isAdjacent() {
    return Math.abs(lastSelectedTile[0] - x) <= 1 && Math.abs(lastSelectedTile[1] - y) <= 1;
  }

  function getPrevTileDirection(){
    const xdif = prevTile[0] - x
    const ydif = prevTile[1] - y

    if (xdif > 0){
     if (ydif === 0) return 0
     if (ydif === -1) return 315
     if (ydif === 1) return 45
    }else if( xdif === 0 ){
     if (ydif === -1) return -90
     if (ydif === 1) return 90
    }else if (xdif < 0){
      if (ydif === 0) return 180
     if (ydif === -1) return 225
     if (ydif === 1) return 135
    }
  }

  return (
    <div draggable="false" className="relative">
      <div
        ref={selfRef}
        draggable="false"
        onMouseDown={(e) => {
          setIsFirstTileDuringMouseDown(true);
          setSelected(true);
          setSelecting(true);
          setWord(grid.tiles[y][x]);
          setLastSelectedTile([x, y]);
        }}
        onTouchStart={(e) => {
          setIsFirstTileDuringMouseDown(true);
          setSelected(true);
          setSelecting(true);
          setWord(grid.tiles[y][x]);
          setLastSelectedTile([x, y]);
        }}
        onMouseEnter={(e) => {
          if (selecting && isAdjacent() && !selected) {
            setWord(word + grid.tiles[y][x]);
            setSelected(true);
            setLastSelectedTile([x, y]);
            setPrevTile(lastSelectedTile)
          }
        }}
        className={`relative ${!selecting || (selecting && isAdjacent())? "cursor-pointer": "cursor-default"} ${
          selected ? "bg-blue-200" : "bg-blue-400"
        } rounded-sm w-12 h-12 flex flex-col justify-center items-center z-10`}
        style={{ opacity: selecting && !isAdjacent() && !selected ? 0.3 : "" }}
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
      {selected && !isFirstTileDuringMouseDown && !isFirstTileAfterMouseDown ? (
        <div
          draggable="false"
          className="z-0 absolute h-1 w-20 bg-blue-300 top-1/2 left-1/2 transform  -translate-y-1/2"
          style={{transform: `rotate(${getPrevTileDirection()}deg)`, transformOrigin:"center left"}}
        ></div>
      ) : null}
    </div>
  );
};

export const GridComponent: React.FC<GridComponentProps> = ({
  grid,
  board_size,
  word,
  setWord,
}) => {
  const [selecting, setSelecting] = useState(false);
  const [lastSelectedTile, setLastSelectedTile] = useState([0, 0]);
  const buildGrid = () => {
    var idx = 0;
    const arr = Array(board_size[0] * board_size[1]);
    for (let i = 0; i < board_size[0]; i++) {
      for (let j = 0; j < board_size[1]; j++) {
        arr[idx] = (
          <Tile
            key={`${i}-${j}`}
            grid={grid}
            x={j}
            y={i}
            word={word}
            setWord={setWord}
            setSelecting={setSelecting}
            selecting={selecting}
            lastSelectedTile={lastSelectedTile}
            setLastSelectedTile={setLastSelectedTile}
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
      onMouseUp={(e) => {
        setSelecting(false);
      }}
      onMouseLeave={(e) => {
        setSelecting(false);
      }}
    >
      {buildGrid()}
    </div>
  );
};
