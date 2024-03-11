import React, { ReactNode } from "react";

import { Player, Bot } from "../../data/model";
import RobotIcon from "../icons/robotIcon";
import PlayerIcon from "../icons/playerIcon";
import { Typography } from "@mui/material";
import LifeIcon from "../icons/lifeIcon";
import DeadIcon from "../icons/deadIcon";

interface PlayersComponentProp {
  players: Player[];
}

function getLivesIcons(lives: number) {
  let icons = [];
  for (let i = 0; i < lives; i += 1) {
    icons.push(
      <div key={i} className="z-1">
        <LifeIcon />
      </div>
    );
  }
  return icons;
}

const PlayersComponent: React.FC<PlayersComponentProp> = ({ players }) => {
  return (
    <div className="flex flex-col w-40 my-2 space-y-2">
      {players.map((player) => {
        return (
          <div key={player.name} className={`flex flex-col items-start  justify-center  bg-blue-500  overflow-hidden rounded-sm`}
          style={{ opacity: player.lives === 0? "0.3":""}}>
            <div className="flex flex-row items-center px-2 py-1 justify-start space-x-1">
              {(player as Bot).difficulty ? (
                <RobotIcon></RobotIcon>
              ) : (
                player.lives === 0?
                <DeadIcon/>:
                <PlayerIcon/>
              )}
              <Typography className=" text-slate-100 ">
                {player.name}
              </Typography>
            </div>
            <div className="flex flex-row pl-2 w-full px-2 bg-blue-600 py-1 relative">
              {getLivesIcons(player.lives)}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PlayersComponent;