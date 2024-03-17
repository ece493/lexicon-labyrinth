import { Typography } from "@mui/material";
import { Board } from "../../data/model";
import { useState, useEffect, useRef } from "react";
import { TileComponent, nullTile, isTileEqual } from "./tile";
import { GridComponent } from "./grid";

const alphabetTiles = [
  ["a", "b", "c", "d", "e"],
  ["f", "g", "h", "i", "j"],
  ["k", "l", "m", "n", "o"],
  ["p", "q", "r", "s", "t"],
  ["u", "v", "w", "x", "y"],
  ["z"],
];

interface TransformGridComponentProps {
  grid: Board;
  board_size: [number, number];
  setPowerup: any;
  help: string;
  setHelp: any;
}

export const TransformGridComponent: React.FC<TransformGridComponentProps> = ({
  grid,
  board_size,
  help,
  setHelp,
  setPowerup,
}) => {
  const [selectedTile, setSelectedTile] = useState<number[]>(nullTile);
  const [selectedReplacement, setSelectedReplacement] =
    useState<number[]>(nullTile);

  useEffect(() => {
    setHelp("Select a tile to transform");
  }, []);

  const isSelectingTile = isTileEqual(selectedTile, nullTile);

  function buildCurrentTile(x: number, y: number, v: string) {
    return (
      <TileComponent
        selected={isTileEqual(selectedTile, [x, y])}
        onClick={() => {
          setSelectedTile([x, y]);
          setHelp("Select a character to transform the tile into");
        }}
        key={`${x}-${y}`}
        value={v}
      />
    );
  }

  function buildAlphabetTile(x: number, y: number, v: string) {
    return (
      <TileComponent
        selected={isTileEqual(selectedReplacement, [x, y])}
        onClick={() => {
          setSelectedReplacement([x, y]);
          //TODO SEND TRANSFORM REQUEST
          const command = {
            coordinated: selectedTile,
            newCharacter: v,
          };
          setTimeout(() => {
            setHelp("");
            setPowerup(null);
          }, 500);
        }}
        key={`${x}-${y}`}
        value={v}
      />
    );
  }
  return (
    <div>
      {isSelectingTile ? (
        <GridComponent
          grid={grid}
          board_size={board_size}
          buildChild={buildCurrentTile}
        />
      ) : (
        <GridComponent
          grid={{tiles: alphabetTiles}}
          board_size={[6, 5]}
          buildChild={buildAlphabetTile}
        />
      )}
    </div>
  );
};
