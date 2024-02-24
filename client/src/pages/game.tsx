import React from "react";
import { GridComponent } from "../components/grid/grid";

const Game: React.FC = () => {
  return (
    <div className="flex bg-blue-400 h-screen">
      <GridComponent
        board_size={[4, 4]}
        grid={{
          tiles: [
            ["a", "b", "c", "d"],
            ["e", "f", "g", "h"],
            ["i", "j", "k", "l"],
            ["m", "n", "o", "p"],
          ],
        }}
      ></GridComponent>
    </div>
  );
};

export default Game;
