import React, { useContext } from "react";

import { Player } from "../../data/model";
import ButtonComponent from "./button";
import FundsIcon from "../icons/fundsIcon";
import { Typography } from "@mui/material";
import RotateIcon from "../icons/rotateIcon";
import TransformIcon from "../icons/transformIcon";
import SwapIcon from "../icons/swapIcon";
import ScrambleIcon from "../icons/scrambleIcon";
import { motion } from "framer-motion";
import { GameContext } from "../../context/ctx";


interface PowerupsComponentProp {
  funds: number;
  setPowerup: any;
  powerup: string | null;
  disabled?: boolean;
  resetWordSelection: any
}

const prices = {
  rotate: 5,
  scramble: 4,
  transform: 9,
  swap: 8,
};

// FR33 - Powerup.Rotate, FR35 - Powerup.Swap ,FR36 - Powerup.Transform, FR34 - Powerup.Refresh, FR29 - Powerup.Display
const PowerupsComponent: React.FC<PowerupsComponentProp> = ({
  funds,
  powerup,
  setPowerup,
  disabled,
  resetWordSelection,
}) => {
  const gameContext = useContext(GameContext)

  return (
    <motion.div
      className="flex flex-col mt-2 p-2 box-border justify-start bg-blue-500 rounded-sm sm:w-40 w-11/12 relative"
      animate={{ opacity: powerup || disabled ? 0.3 : 1 }}
    >
      {disabled ? (
        <div className="bg-transparent w-full h-full absolute z-40" />
      ) : null}

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
            flourish
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
              if (gameContext.sock !== null) {
                gameContext.transitions.pickScramblePowerup(gameContext);
                resetWordSelection();
              }
            }}
            flourish
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
            flourish
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
            flourish
          >
            <SwapIcon />
          </ButtonComponent>
        </div>
      </div>
    </motion.div>
  );
};

export default PowerupsComponent;
