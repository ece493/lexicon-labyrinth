import React, {
  forwardRef,
  ReactNode,
  useImperativeHandle,
  useState,
} from "react";
import { Reorder } from "framer-motion";

import { Player, Bot } from "../../data/model";
import RobotIcon from "../icons/robotIcon";
import PlayerIcon from "../icons/playerIcon";
import { Typography } from "@mui/material";
import LifeIcon from "../icons/lifeIcon";
import DeadIcon from "../icons/deadIcon";
import PlayerCard from "./playerCard";

interface PlayersComponentProp {
  players: Player[];
  powerup: string | null;
  currentTurn: string;
}

export interface PlayersRef {
  endPlayer: (pId: string, setLobbyState: () => void) => void;
  loseLife: (pId: string, setLobbyState: () => void) => void;
}

const PlayersComponent = forwardRef<PlayersRef, PlayersComponentProp>(
  ({ players, powerup, currentTurn }, ref) => {
    useImperativeHandle(ref, () => ({
      endPlayer(pId: string, setLobbyState: () => void) {
        setShake(pId);
        setTimeout(() => setShake(null), 0);
        setTimeout(() => setLobbyState(), 100);
      },
      loseLife(pId: string, setLobbyState: () => void) {
        setShake(pId);
        setTimeout(() => setShake(null), 0);
        setTimeout(() => setLobbyState(), 100);
      },
    }));

    const [shake, setShake] = useState<string | null>(null);

    function getOrderedPlayers() {
      const orderedLivePlayers: Player[] = [];
      const livePlayers = players.filter((p) => p.lives !== 0);
      let j = livePlayers.findIndex((p) => p.id === currentTurn);
      if (j === -1) {
        let p = players.findIndex((p) => p.id === currentTurn);
        for (let i = 0; i < players.length; i++) {
          // finds next alive player at pretends it's their turn
          if (p === players.length) {
            p = 0;
          }
          if (players[p].lives > 0) {
            j = livePlayers.findIndex((pl) => pl.id === players[p].id);
            break;
          }
          p++;
        }
      }
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
              <PlayerCard
                key={player.id}
                player={player}
                shake={shake === player?.id}
              />
            );
          })}
        </Reorder.Group>
      </div>
    );
  }
);

export default PlayersComponent;
