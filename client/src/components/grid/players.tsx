import React, { ReactNode } from "react";
import { Reorder } from "framer-motion";

import { Player, Bot } from "../../data/model";
import RobotIcon from "../icons/robotIcon";
import PlayerIcon from "../icons/playerIcon";
import { Typography } from "@mui/material";
import LifeIcon from "../icons/lifeIcon";
import DeadIcon from "../icons/deadIcon";

interface PlayersComponentProp {
  players: Player[];
  powerup: string | null;
  currentTurn: string;
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

const PlayersComponent: React.FC<PlayersComponentProp> = ({
  players,
  powerup,
  currentTurn,
}) => {
  function getOrderedPlayers() {
    const orderedLivePlayers: Player[] = [];
    const livePlayers = players.filter((p) => p.lives !== 0);
    let j = livePlayers.findIndex((p) => p.id === currentTurn);
    for (let i = 0; i < livePlayers.length; i++) {
      if (j === livePlayers.length) {
        j = 0;
      }
      orderedLivePlayers.push(livePlayers[j]);
      j++;
    }
    return [...orderedLivePlayers, ...players.filter((p) => p.lives === 0)];
  }

  return (
    <div
      className="flex flex-col w-40 my-2 space-y-2"
      style={{ opacity: powerup ? "0.1" : "", position: "relative" }}
    >
      {/* <div className="absolute w-full h-full bg-transparent z-20"></div> */}
      <Reorder.Group
        axis="y"
        values={getOrderedPlayers().map((p) => p.id)}
        style={{ padding: 0, margin: 0 }}
        onReorder={() => {}}
      >
        {getOrderedPlayers().map((player) => {
          return (
            <Reorder.Item
              value={player.id}
              key={player.id}
              dragListener={false}
              className={`flex flex-col items-start  justify-center  bg-blue-500  overflow-hidden rounded-sm mb-2`}
              style={{ opacity: player.lives === 0 ? "0.3" : "" }}
            >
              <div className="flex flex-row items-center px-2 py-1 justify-start space-x-1">
                {(player as Bot).difficulty ? (
                  <RobotIcon></RobotIcon>
                ) : player.lives === 0 ? (
                  <DeadIcon />
                ) : (
                  <PlayerIcon />
                )}
                <Typography className=" text-slate-100 ">
                  {player.name}
                </Typography>
              </div>
              <div className="flex flex-row pl-2 w-full px-2 bg-blue-600 py-1 relative">
                {getLivesIcons(player.lives)}
              </div>
            </Reorder.Item>
          );
        })}
      </Reorder.Group>
    </div>
  );
};

export default PlayersComponent;
