import React from "react";
import { GridComponent } from "../components/grid/grid";
import TurnComponent from "../components/grid/turn";
import PowerupsComponent from "../components/grid/powerups";
import PlayersComponent from "../components/grid/players";
import { Player } from "../data/model";
import { useState } from "react";

const Game: React.FC = () => {
  const [word, setWord] = useState(""); // May have to change where this is stored to prevent too much re-rendering

  return (
    <div className="flex bg-blue-400 h-screen">
      <div className="flex align-top justify-center width w-full">
        <div className="flex flex-col items-center pt-5">
          <TurnComponent
            word={word}
            player={"player name"}
            potential_funds={15}
          />
          <div className="flex flex-row items-start justify-center">
            <PowerupsComponent funds={20}></PowerupsComponent>
            <GridComponent
              word={word}
              setWord={setWord}
              board_size={[8, 8]}
              grid={{
                tiles: [
                  ["a", "b", "c", "d", "a", "b", "c", "d"],
                  ["e", "f", "g", "h", "a", "b", "c", "d"],
                  ["i", "j", "k", "l", "a", "b", "c", "d"],
                  ["m", "n", "o", "p", "a", "b", "c", "d"],
                  ["m", "n", "o", "p", "a", "b", "c", "d"],
                  ["m", "n", "o", "p", "a", "b", "c", "d"],
                  ["m", "n", "o", "p", "a", "b", "c", "d"],
                  ["m", "n", "o", "p", "a", "b", "c", "d"],
                ],
              }}
            ></GridComponent>
            <PlayersComponent
              turns={{
                order: [1,0,3],
                curr_turn: 0,
              }}
              players={[]}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Game;
