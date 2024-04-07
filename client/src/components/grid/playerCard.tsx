import React, {
  forwardRef,
  ReactNode,
  useEffect,
  useImperativeHandle,
  useState,
} from "react";
import { Reorder, useMotionValue } from "framer-motion";
import { Player, Bot } from "../../data/model";
import RobotIcon from "../icons/robotIcon";
import PlayerIcon from "../icons/playerIcon";
import { Typography } from "@mui/material";
import LifeIcon from "../icons/lifeIcon";
import DeadIcon from "../icons/deadIcon";
import { motion } from "framer-motion";
import FundsIcon from "../icons/fundsIcon";

interface PlayerCardProps {
  player: Player;
  shake?: boolean;
}

function getLivesIcons(lives: number) {
  let icons = [];
  for (let i = 0; i < lives && i < 4; i += 1) {
    icons.push(
      <div key={i} className="z-1 pt-1">
        <LifeIcon />
      </div>
    );
  }
  if (lives > 4){
      icons.push(
        <div key={"extra"} className="z-1 pt-1">
          <Typography className="text-slate-200 text-xs" style={{paddingLeft:"2px", marginBottom:"2px"}}>+{lives-4}</Typography>
        </div>
      );
    
  }
  return icons;
}

const spacing = 120;
const PlayerCard: React.FC<PlayerCardProps> = ({ player, shake }) => {
  const [x, setX] = useState(0);

  function shakeCard() {
    setX(200);
    setTimeout(() => {
      setX(0);
    }, spacing);
  }

  useEffect(() => {
    if (shake) shakeCard();
  }, [shake]);

  return (
    <Reorder.Item
      value={player.id}
      key={player.id}
      dragListener={false}
      className="p-0 m-0 relative"
      style={{ listStyleType: "none" }}
    >
      <motion.div
        animate={{ x }}
        transition={{ type: "spring" }}
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
          <Typography className=" text-slate-100 ">{player.name}</Typography>
        </div>
        <div className="flex flex-row pl-2 w-full px-2 bg-blue-600 py-1 relative items-center">
          <FundsIcon small></FundsIcon>
          <Typography className=" text-slate-100 text-sm" style={{ marginRight: "6px", marginLeft:"2px" }}>{player.money}</Typography>
          <Typography className=" text-slate-100 text-sm" style={{ marginRight: "6px", marginLeft:"2px", paddingBottom:"2px" }}>|</Typography>

          {getLivesIcons(player.lives)}
        </div>
      </motion.div>
    </Reorder.Item>
  );
};

export default PlayerCard;
