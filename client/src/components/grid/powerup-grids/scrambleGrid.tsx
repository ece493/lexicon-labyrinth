import { useContext, useEffect, useState } from "react";
import { Board } from "../../../data/model";
import { GridComponent } from "../grid";
import { TileComponent } from "../tile";
import { GameContext } from "../../../context/ctx";
import { Fade } from "@mui/material";

// FR34 - Powerup.Refresh
interface ScrambleGridComponentProps {
  grid: Board;
  board_size: [number, number];
  setPowerup: any;
  help: string;
  setHelp: any;
  resetWordSelection: () => void;
  visOnly?: boolean
}

// FR34 - Powerup.Refresh
export const ScrambleGridComponent: React.FC<ScrambleGridComponentProps> = ({
  grid,
  board_size,
  help,
  setHelp,
  resetWordSelection,
  setPowerup,
  visOnly
}) => {
  const [showGrid, setShowGrid] = useState(true);

  useEffect(() => {
    setHelp("Scrambling...")
    setTimeout(() => {
      setShowGrid(false);
      setHelp("")
    }, 1100);
  }, []);

  function buildTile(x: number, y: number, v: string) {
    return <TileComponent key={`${x}-${y}`} value={""} drift selected/>;
  }

  return (
    <Fade in={showGrid}>
      <div>
        <GridComponent
          grid={grid}
          buildChild={buildTile}
          board_size={board_size}
        />
      </div>
    </Fade>
  );
};
