import { useEffect } from "react";
import { Board } from "../../data/model";
import { GridComponent } from "./grid";
import { TileComponent } from "./tile";

interface ScrambleGridComponentProps {
  grid: Board;
  board_size: [number, number];
  setPowerup: any;
  help: string;
  setHelp: any;
  resetWordSelection: () => void;

}

export const ScrambleGridComponent: React.FC<ScrambleGridComponentProps> = ({
  grid,
  board_size,
  help,
  setHelp,
  resetWordSelection,
  setPowerup,
}) => {
  useEffect(() => {
    setHelp("Scrambling...");

    //TODO get scrambled grid
    setTimeout(() => {
      resetWordSelection()
      setPowerup(null);
    }, 500);
  }, []);

  function buildTile(x: number, y: number, v: string) {
    return <TileComponent key={`${x}-${y}`} value={v} />;
  }

  return (
    <GridComponent grid={grid} buildChild={buildTile} board_size={board_size} />
  );
};
