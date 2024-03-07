import React from "react";

import { Player } from "../../data/model";
import ButtonComponent from "./button";
import FundsIcon from "../icons/fundsIcon";
import { Typography } from "@mui/material";

interface PowerupsComponentProp {
  funds: number;
}

const prices = {
  rotate: 25,
  scramble:25,
  transform: 20,
  swap:10
}

const PowerupsComponent: React.FC<PowerupsComponentProp> = ({ funds }) => {
  return (
    <div className="flex flex-col m-2 p-2 justify-start bg-blue-500 rounded-sm">
      <div className="space-x-1 items-center justify-center flex flex-row">
        <FundsIcon />
        <Typography className="text-bold text-lg text-slate-100 py-2">{funds}</Typography>
      </div>
      <div className="space-y-2 w-40">
        <ButtonComponent label={`${prices.rotate} Rotate`} onClick={() => {}} />
        <ButtonComponent label={`${prices.scramble} Scramble`} onClick={() => {}} />
        <ButtonComponent label={`${prices.transform} Transform`} onClick={() => {}} />
        <ButtonComponent label={`${prices.swap} Swap`} onClick={() => {}} />
      </div>
    </div>
  );
};

export default PowerupsComponent;
