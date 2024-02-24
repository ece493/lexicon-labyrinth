import React from "react";
import { GridComponent } from "../components/grid/grid";

const Game: React.FC = () => {
  return (
    <div className="flex bg-blue-400 h-screen">
      <GridComponent
        board_size={[7, 7]}
        grid={{
          tiles: [
            ["a", "b", "c", "d", "e", "f", "g"],
            ["h", "i", "j", "k", "l", "m", "n"],
            ["o", "p", "q", "r", "s", "t", "u"],
            ["v", "w", "x", "y", "z", "A", "B"],
            ["C", "D", "E", "F", "G", "H", "I"],
            ["J", "K", "L", "M", "N", "O", "P"],
            ["Q", "R", "S", "T", "U", "V", "W"],
          ],
        }}
      ></GridComponent>
    </div>
  );
};

export default Game;
