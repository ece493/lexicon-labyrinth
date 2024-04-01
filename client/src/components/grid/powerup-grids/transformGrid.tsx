import { Typography, Zoom } from "@mui/material";
import { Board } from "../../../data/model";
import { useState, useEffect, useRef, useContext } from "react";
import { TileComponent, nullTile, isTileEqual } from "../tile";
import { GridComponent } from "../grid";
import { GameContext } from "../../../context/ctx";

const alphabetTiles = [
  ["A", "B", "C", "D", "E"],
  ["F", "G", "H", "I", "J"],
  ["K", "L", "M", "N", "O"],
  ["P", "Q", "R", "S", "T"],
  ["U", "V", "W", "X", "Y"],
  ["Z"],
];

interface TransformGridComponentProps {
  grid: Board;
  board_size: [number, number];
  setPowerup: any;
  help: string;
  setHelp: any;
  resetWordSelection: () => void;
}

export const TransformGridComponent: React.FC<TransformGridComponentProps> = ({
  grid,
  board_size,
  help,
  setHelp,
  setPowerup,
  resetWordSelection,
}) => {
  const gameContext = useContext(GameContext);

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

          if (gameContext.sock !== null) {
            gameContext.transitions.pickTransformPowerup(
              selectedTile,
              alphabetTiles[y][x],
              gameContext
            );
            resetWordSelection();
            setPowerup(null);
          }
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
        <Zoom in={true}>
          <div>
            <GridComponent
              grid={alphabetTiles}
              board_size={[6, 5]}
              buildChild={buildAlphabetTile}
            />
          </div>
        </Zoom>
      )}
    </div>
  );
};
