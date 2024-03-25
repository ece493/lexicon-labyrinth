import React, {
  forwardRef,
  useContext,
  useEffect,
  useImperativeHandle,
} from "react";
import { Typography } from "@mui/material";
import TimerIcon from "../icons/timerIcon";
interface TimerComponentProp {}

const TimerComponent: React.FC<TimerComponentProp> = () => {
  const [time, setTime] = React.useState(60);

  const [startTime, setStartTime] = React.useState(Date.now());

  function countDown() {
    let newTime = Math.ceil(60 - (Date.now() - startTime) / 1000);
    if (newTime >= 0) setTime(newTime);
  }

  function startCountdown() {
    setInterval(() => {
      countDown();
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
