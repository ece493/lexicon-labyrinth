import React from "react";

import { Player } from "../../data/model";
import ButtonComponent from "./button";
import FundsIcon from "../icons/fundsIcon";
import { Typography } from "@mui/material";
import LeftIcon from "../icons/leftIcon";
import RightIcon from "../icons/rightIcon";
import RotateIcon from "../icons/rotateIcon";
import TransformIcon from "../icons/transformIcon";
import SwapIcon from "../icons/swapIcon";
import ScrambleIcon from "../icons/scrambleIcon";

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
        <Typography className="font-bold text-lg text-slate-100 py-2">
          {funds}
        </Typography>
      </div>
      <div className="space-y-2">
        <div className="flex flex-row">
          <Typography className="font-bold text-sm text-slate-200 py-1 mr-2">
            {prices.rotate}
          </Typography>
          <ButtonComponent
            disabled={prices.rotate > funds || !!powerup}
            label={`Rotate`}
            onClick={() => {
              setPowerup("ROTATE");
            }}
          >
            <RotateIcon />
          </ButtonComponent>
        </div>
        <div className="flex flex-row">
          <Typography className="font-bold text-sm text-slate-200 py-1 mr-2">
            {prices.scramble}
          </Typography>
          <ButtonComponent
            disabled={prices.scramble > funds || !!powerup}
            label={`Scramble`}
            onClick={() => {
              setPowerup("SCRAMBLE");
            }}
          >
            <ScrambleIcon />
          </ButtonComponent>
        </div>

        <div className="flex flex-row">
          <Typography className="font-bold text-sm text-slate-200 py-1 mr-2">
            {prices.transform}
          </Typography>
          <ButtonComponent
            disabled={prices.transform > funds || !!powerup}
            label={`Transform`}
            onClick={() => {
              setPowerup("TRANSFORM");
            }}
          >
            <TransformIcon />
          </ButtonComponent>
        </div>

        <div className="flex flex-row">
          <Typography className="font-bold text-sm text-slate-200 py-1 mr-2">
            {prices.swap}
          </Typography>

          <ButtonComponent
            disabled={prices.swap > funds || !!powerup}
            label={`Swap`}
            onClick={() => {
              setPowerup("SWAP");
            }}
          >
            <SwapIcon />
          </ButtonComponent>
        </div>
      </div>
    </div>
  );
};

export default PowerupsComponent;
