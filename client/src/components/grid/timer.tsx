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
  maxTime: number;
}

const TimerComponent: React.FC<TimerComponentProp> = ({ maxTime }) => {
  const [time, setTime] = React.useState(maxTime);
  const ctx = useContext(GameContext);

  const [startTime, setStartTime] = React.useState(Date.now());
  const [intervalRef, setIntervalRef] = React.useState<any>(null);

  function countDown() {
    let newTime = Math.ceil(maxTime - (Date.now() - startTime) / 1000);
    if (newTime >= 0) {
      setTime(newTime);
    }
  }

  useEffect(() => {
    if (time === 0 && ctx.playerId === ctx.lobby?.state?.curr_turn) {
      clearInterval(intervalRef);
      ctx.transitions.notifyTurnEnd(ctx);
    }
  }, [time]);

  function startCountdown() {
    setIntervalRef(
      setInterval(() => {
        countDown();
      }, 1000)
    );
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
