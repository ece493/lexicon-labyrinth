import React, {
  forwardRef,
  useContext,
  useEffect,
  useImperativeHandle,
} from "react";

import { Player } from "../../data/model";
import FundsIcon from "../icons/fundsIcon";
import { Typography } from "@mui/material";
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
}

export interface TurnRef {
  shakeWord: () => void;
  resetTimer: () => void;
}

const TurnComponent = forwardRef<TurnRef, TurnComponentProp>(
  ({ word, player, powerup, handleSubmit, error, disabled }, ref) => {
    const [wordX, setWordX] = React.useState(0);
    const [timerComp, setTimerComp] = React.useState(<TimerComponent />);

    useImperativeHandle(ref, () => ({
      shakeWord() {
        setWordX(20);
        setTimeout(() => setWordX(-20), 80);
        setTimeout(() => setWordX(0), 160);
      },
      resetTimer() {
        setTimerComp(<div style={{width:"54px"}}/>);
        setTimeout(() => setTimerComp(<TimerComponent />), 0);
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
            {player}'s turn
          </Typography>
        )}
        <motion.div animate={{ x: wordX }}>
          {" "}
          <Typography className="text-slate-100 text-4xl p-2">
            {word
              ? word
              : disabled
              ? `${player} is playing`
              : "click and drag to select a word"}
          </Typography>
        </motion.div>

        <div className="flex flex-row space-x-2 items-center p-1">
          {timerComp}
          <motion.div animate={{ opacity: powerup || disabled ? 0.4 : 1 }}>
            <ButtonComponent
              onClick={handleSubmit}
              label="Submit"
              long
              invert
              disabled={!!powerup || disabled}
            />
          </motion.div>
          <div
            className="flex flex-row space-x-1 items-center mr-3"
            style={{ opacity: powerup ? "0.1" : "" }}
          >
            <AddIcon />
            <FundsIcon />
            <Typography className="text-slate-100">{word.length}</Typography>
          </div>
        </div>
      </div>
    );
  }
);

export default TurnComponent;
