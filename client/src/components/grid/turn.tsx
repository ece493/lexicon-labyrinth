import React, {
  forwardRef,
  useContext,
  useEffect,
  useImperativeHandle,
} from "react";

import { Player } from "../../data/model";
import FundsIcon from "../icons/fundsIcon";
import { Grow, Typography } from "@mui/material";
import TimerIcon from "../icons/timerIcon";
import AddIcon from "../icons/addIcon";
import ButtonComponent from "./button";
import { motion } from "framer-motion";
import Zoom from "@mui/material/Zoom";
import TimerComponent from "./timer";



interface TurnComponentProp {
  word: string;
  player: string;
  powerup: string | null;
  handleSubmit: () => void;
  error: string | null;
  disabled?: boolean;
  time: number;
  resetWord: any;
  potentialFunds: number;
}

export interface TurnRef {
  shakeWord: () => void;
}

// FR17 - Tile.Drag 
const TurnComponent = forwardRef<TurnRef, TurnComponentProp>(
  (
    {
      word,
      player,
      powerup,
      handleSubmit,
      error,
      disabled,
      time,
      resetWord,
      potentialFunds
    },
    ref
  ) => {
    const [wordX, setWordX] = React.useState(0);

    useImperativeHandle(ref, () => ({
      shakeWord() {
        setWordX(20);
        setTimeout(() => setWordX(-20), 80);
        setTimeout(() => setWordX(0), 160);
      },
    }));

    return (
      <div className="flex flex-col items-center p-1">
        {error ? (
          <Zoom in={!!error} timeout={200}>
            <Typography className="text-slate-200 text-sm bg-purple-900 px-3 py-1 rounded-sm">
              {error}
            </Typography>
          </Zoom>
        ) : (
          <Typography
            className="text-slate-200 text-sm  px-3 py-1"
            style={{ opacity: powerup ? "0.1" : "" }}
          >
            {`${player}${player === "Your" ? "" : "'s"} turn`}
          </Typography>
        )}
        <Zoom key={word} in={true} appear timeout={300}>
          <motion.div animate={{ x: wordX }}>
            <Typography className="text-slate-100 text-4xl p-2" align="center">
              {word
                ? word
                : disabled
                ? player === "Your"
                  ? "Loading..."
                  : `${player} is playing`
                : "click and drag to select a word"}
            </Typography>
          </motion.div>
        </Zoom>

        <div className="flex flex-row space-x-2 items-center p-1">
          <TimerComponent time={time} />
          <motion.div animate={{ opacity: powerup || disabled ? 0.4 : 1 }}>
            <ButtonComponent
              onClick={handleSubmit}
              label="Submit"
              long
              invert
              disabled={!!powerup || disabled || word === ""}
            />
          </motion.div>
          <div
            className="flex flex-row space-x-1 items-center mr-3"
            style={{ opacity: powerup ? "0.1" : "" }}
          >
            <AddIcon />
            <FundsIcon />
            <Typography className="text-slate-100">
              {disabled ? 0 : potentialFunds }
            </Typography>
          </div>
        </div>
      </div>
    );
  }
);

export default TurnComponent;
