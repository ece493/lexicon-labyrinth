import React from "react";

import { Player } from "../../data/model";
import ButtonComponent from "./button";
import FundsIcon from "../icons/fundsIcon";
import { Typography } from "@mui/material";
import LeftIcon from "../icons/leftIcon";
import RightIcon from "../icons/rightIcon";

interface PowerupsComponentProp {
  funds: number;
  setPowerup: any;
  powerup: string | null;
}

const prices = {
  rotate: 25,
  scramble: 25,
  transform: 20,
  swap: 10,
};

const PowerupsComponent: React.FC<PowerupsComponentProp> = ({
  funds,
  powerup,
  setPowerup,
}) => {
  return (
    <div
      className="flex flex-col mt-2 p-2 box-border justify-start bg-blue-500 rounded-sm w-40"
      style={{ opacity: powerup ? "0.1" : "" }}
    >
      <div className="space-x-1 items-center justify-center flex flex-row">
        <FundsIcon />
        <Typography className="text-bold text-lg text-slate-100 py-2">
          {funds}
        </Typography>
      </div>
      <div className="space-y-2">
        <ButtonComponent
          disabled={prices.rotate > funds || !!powerup}
          label={`${prices.rotate} Rotate`}
          onClick={() => {
            setPowerup("ROTATE");
          }}
        >
          <div className="flex flex-row space-x-0">
            <LeftIcon/><RightIcon/>
          </div>
        </ButtonComponent>
        <ButtonComponent
          disabled={prices.scramble > funds || !!powerup}
          label={`${prices.scramble} Scramble`}
          onClick={() => {
            setPowerup("SCRAMBLE");
          }}
        />
        <ButtonComponent
          disabled={prices.transform > funds || !!powerup}
          label={`${prices.transform} Transform`}
          onClick={() => {
            setPowerup("TRANSFORM");
          }}
        />
        <ButtonComponent
          disabled={prices.swap > funds || !!powerup}
          label={`${prices.swap} Swap`}
          onClick={() => {
            setPowerup("SWAP");
          }}
        />
      </div>
    </div>
  );
};

export default PowerupsComponent;
