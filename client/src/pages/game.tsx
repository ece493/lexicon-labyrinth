import React from "react";
import { GridComponent } from "../components/grid/grid";

const Game: React.FC = () => {
  return (
    <div className="flex bg-blue-400 h-screen">
      <GridComponent
        board_size={[2, 2]}
        grid={{
          tiles: [
            ["a", "b"],
            ["c", "d"],
          ],
        }}
      ></GridComponent>
    </div>
  );
};

export default Game;
