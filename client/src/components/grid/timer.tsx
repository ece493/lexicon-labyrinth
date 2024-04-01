import React, {
  forwardRef,
  useContext,
  useEffect,
  useImperativeHandle,
} from "react";
import { Typography } from "@mui/material";
import TimerIcon from "../icons/timerIcon";
import { GameContext } from "../../context/ctx";
interface TimerComponentProp {}

const TimerComponent: React.FC<TimerComponentProp> = () => {
  const [time, setTime] = React.useState(60);
  const ctx = useContext(GameContext);

  const [startTime, setStartTime] = React.useState(Date.now());
  const [stop, setStop] = React.useState(false);

  function countDown() {
    let newTime = Math.ceil(60 - (Date.now() - startTime) / 1000);
    if (newTime >= 0) {
      setTime(newTime);
    } else {
      setStop(true)
      if (ctx.playerId === ctx.lobby?.state?.curr_turn){
        ctx.transitions.notifyTurnEnd(ctx);
      }
    }
  }

  function startCountdown() {
    setInterval(() => {
      if(!stop) countDown();
    }, 1000);
  }

  useEffect(() => {
    setStartTime(Date.now());
    startCountdown();
  }, []);

  return (
    <div className=" flex flex-row space-x-1 justify-center items-center p-1 ">
      <TimerIcon />
      <Typography className="text-slate-100">{time}</Typography>
    </div>
  );
};

export default TimerComponent;
