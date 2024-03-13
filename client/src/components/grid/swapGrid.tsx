import { Board } from "../../data/model";
import { useState, useEffect, useRef } from "react";
import { TileComponent, isTileEqual, nullTile } from "./tile";
import { GridComponent } from "./grid";

interface SwapGridComponentProps {
  grid: Board;
  board_size: [number, number];
  setPowerup: any;
  help: string;
  setHelp: any;
}

export const SwapGridComponent: React.FC<SwapGridComponentProps> = ({
  grid,
  board_size,
  help,
  setHelp,
  setPowerup,
}) => {
  const [secondTile, setSecondTile] = useState(nullTile);
  const [firstTile, setFirstTile] = useState(nullTile);

  useEffect(() => {
    setHelp("Select the first tile to swap");
  }, []);

  function handleClick(x: number, y: number) {
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

      const command = {
        firstTile: firstTile,
        secondTile: secondTile,
      };
      // TODO: SEND TO BACKEND

      setTimeout(() => {
        setHelp("");
        setPowerup(null);
      }, 500);
    }
  }

  function buildTile(x: number, y: number, v: string) {
    return (
      <TileComponent
        onClick={() => {
          handleClick(x, y);
        }}
        selected={
          isTileEqual(firstTile, [x, y]) || isTileEqual(secondTile, [x, y])
        }
        key={`${x}-${y}`}
        value={v}
      />
    );
  }

  return (
    <GridComponent grid={grid} board_size={board_size} buildChild={buildTile} />
  );
};
