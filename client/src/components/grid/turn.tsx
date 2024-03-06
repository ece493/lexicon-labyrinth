import React from "react";

import { Player } from "../../data/model";
import FundsIcon from "../icons/fundsIcon";
import { Typography } from "@mui/material";
import TimerIcon from "../icons/timerIcon";
import AddIcon from "../icons/addIcon";


interface TurnComponentProp {
  potential_funds: number;
  word: string;
}

const TurnComponent: React.FC<TurnComponentProp> = ({
  potential_funds,
  word,
}) => {
  const [time, setTime] = React.useState(60);

  return (
    <div className="flex flex-row space-x-5 items-center p-2">
      <div className="flex flex-row space-x-1 items-center p-1">
        <TimerIcon />
        <Typography className="text-slate-100">{time}</Typography>
      </div>
     
      <Typography className="text-slate-100 text-4xl">{word}</Typography>
      <div className="flex flex-row space-x-1 items-center mr-3">
        <AddIcon />
        <FundsIcon />
        <Typography className="text-slate-100">{potential_funds}</Typography>
      </div>
    </div>
  );
};

export default TurnComponent;
