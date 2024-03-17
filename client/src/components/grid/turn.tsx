import React, { useEffect } from "react";

import { Player } from "../../data/model";
import FundsIcon from "../icons/fundsIcon";
import { Typography } from "@mui/material";
import TimerIcon from "../icons/timerIcon";
import AddIcon from "../icons/addIcon";
import ButtonComponent from "./button";

interface TurnComponentProp {
  potential_funds: number;
  word: string;
  player: string;
}

const TurnComponent: React.FC<TurnComponentProp> = ({
  potential_funds,
  word,
  player,
}) => {
  const [time, setTime] = React.useState(60);
  const [startTime, setStartTime] = React.useState(Date.now())

  function countDown(){
    let newTime = Math.ceil(60 - (Date.now()-startTime)/1000)
    if (newTime >= 0)
      setTime(newTime);
  }

  function startCountdown() {
    setInterval(() => {
      countDown()
    }, 1000);
  }

  useEffect(() => {
    setStartTime(Date.now())
    startCountdown()
  }, [player]);

  return (
    <div className="flex flex-col items-center p-1">
      <Typography className="text-slate-200 text-sm">
        {player}'s turn
      </Typography>
      

      <Typography className="text-slate-100 text-4xl p-2">{word? word: "click and drag to select a word"}</Typography>
      <div className="flex flex-row space-x-2 items-center p-1">
        <div className=" flex flex-row space-x-1 justify-center items-center p-1 ">
          <TimerIcon />
          <Typography className="text-slate-100">{time}</Typography>
        </div>
        <ButtonComponent onClick={()=>{}}label="Submit" long invert/>
        <div className="flex flex-row space-x-1 items-center mr-3">
          <AddIcon />
          <FundsIcon />
          <Typography className="text-slate-100">{word.length}</Typography>
        </div>
      </div>
    </div>
  );
};

export default TurnComponent;
