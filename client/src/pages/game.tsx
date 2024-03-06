import React from "react";
import { GridComponent } from "../components/grid/grid";
import TurnComponent from "../components/grid/turn";
import PowerupsComponent from "../components/grid/powerups";

const Game: React.FC = () => {
  return (
    <div className="flex bg-blue-400 h-screen">
      <div className="flex align-top justify-center width w-full">
        <div className="flex flex-col items-center">
          <TurnComponent word="test" potential_funds={15}/>
          <div className="flex flex-row justify-center">
            <PowerupsComponent funds={20}></PowerupsComponent>
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
        </div>
      </div>
    </div>
  );
};

export default Game;
