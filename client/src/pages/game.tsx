import React from "react";
import { GridComponent } from "../components/grid/grid";
import TurnComponent from "../components/grid/turn";
import PowerupsComponent from "../components/grid/powerups";
import PlayersComponent from "../components/grid/players";
import { Player } from "../data/model";

const Game: React.FC = () => {
  return (
    <div className="flex bg-blue-400 h-screen">
      <div className="flex align-top justify-center width w-full">
        <div className="flex flex-col items-center">
          <TurnComponent word="test" player ={"player name"} potential_funds={15}/>
          <div className="flex flex-row items-start justify-center">
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
