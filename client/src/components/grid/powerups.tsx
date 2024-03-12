import React from "react";

import { Player } from "../../data/model";
import ButtonComponent from "./button";
import FundsIcon from "../icons/fundsIcon";
import { Typography } from "@mui/material";

interface PowerupsComponentProp {
  funds: number;
  setPowerup: any;
  powerup: string | null;
}

const prices = {
  rotate: 25,
  scramble:25,
  transform: 20,
  swap:10
}

const PowerupsComponent: React.FC<PowerupsComponentProp> = ({ funds, powerup, setPowerup }) => {
  return (
    <div className="flex flex-col mt-2 p-2 box-border justify-start bg-blue-500 rounded-sm w-40">
      <div className="space-x-1 items-center justify-center flex flex-row">
        <FundsIcon />
        <Typography className="text-bold text-lg text-slate-100 py-2">{funds}</Typography>
      </div>
      <div className="space-y-2">
        <ButtonComponent disabled={prices.rotate > funds || !!powerup} label={`${prices.rotate} Rotate`} onClick={() => {}} />
        <ButtonComponent disabled={prices.scramble > funds || !!powerup} label={`${prices.scramble} Scramble`} onClick={() => {}} />
        <ButtonComponent disabled={prices.transform > funds || !!powerup} label={`${prices.transform} Transform`} onClick={() => {}} />
        <ButtonComponent disabled={prices.swap > funds || !!powerup} label={`${prices.swap} Swap`} onClick={() => {setPowerup("SWAP")}} />
      </div>
    </div>
  );
};

export default PowerupsComponent;
