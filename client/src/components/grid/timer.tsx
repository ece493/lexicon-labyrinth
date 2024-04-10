import React, {
  forwardRef,
  useContext,
  useEffect,
  useImperativeHandle,
} from "react";
import { Typography } from "@mui/material";
import TimerIcon from "../icons/timerIcon";
import { GameContext } from "../../context/ctx";
interface TimerComponentProp {
  time: number
}

// FR21 - Game.Timer
const TimerComponent: React.FC<TimerComponentProp> = ({ time }) => {
  return (
    <div className=" flex flex-row space-x-1 justify-center items-center p-1 ">
      <TimerIcon />
      <Typography className="text-slate-100">{time < 0? 0 : time}</Typography>
    </div>
  );
};

export default TimerComponent;
