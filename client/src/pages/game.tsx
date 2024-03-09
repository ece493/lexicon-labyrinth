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
          <TurnComponent word={word} player ={"player name"} potential_funds={15}/>
          <div className="flex flex-row items-start justify-center">
            <PowerupsComponent funds={20}></PowerupsComponent>
            <GridComponent
              word={word}
              setWord={setWord}
              board_size={[8, 8]}
              grid={{
                tiles: [
                  ["a", "b", "c", "d","a", "b", "c", "d"],
                  ["e", "f", "g", "h","a", "b", "c", "d"],
                  ["i", "j", "k", "l","a", "b", "c", "d"],
                  ["m", "n", "o", "p","a", "b", "c", "d"],
                  ["m", "n", "o", "p","a", "b", "c", "d"],
                  ["m", "n", "o", "p","a", "b", "c", "d"],
                  ["m", "n", "o", "p","a", "b", "c", "d"],
                  ["m", "n", "o", "p","a", "b", "c", "d"],
                ],
              }}
            ></GridComponent>
            <PlayersComponent players ={[{
            name: "p1",
            id: 0,
            is_spectator: false,
            lives: 2,
            money: 0
          },{
            name: "player2",
            id: 0,
            is_spectator: false,
            lives: 1,
            money: 0
          },{
            name: "player3",
            id: 0,
            is_spectator: false,
            lives: 0,
            money: 0
          },{
            name: "bot1",
            id: 0,
            is_spectator: false,
            lives: 3,
            money: 0,
            difficulty:1
          } as Player,({
            name: "botter2",
            id: 0,
            is_spectator: false,
            lives: 0,
            money: 0,
            difficulty:1
          } as Player)]}/>
          </div>
       
        </div>
        
      </div>
    </div>
  );
};

export default Game;
