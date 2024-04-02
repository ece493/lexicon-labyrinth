import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface TileComponentProps {
  value?: string;
  selected?: boolean;
  dark?: boolean;
  transparent?: boolean;
  readonly?: boolean;
  onClick?: any;
  children?: any;
  disabled?: boolean;
  drift?: boolean;
}

const nullTile = [-1, -1];

function isTileEqual(t1: number[], t2: number[]) {
  return t1[1] === t2[1] && t1[0] === t2[0];
}


// scrabble letter price sheet
// https://hasbro-new.custhelp.com/app/answers/detail/a_id/55/~/what-is-the-total-face-value-of-all-the-scrabble-tiles%3F
const letterPoints: { [key: string]: number }
  = { A: 1, E: 1, I: 1, O: 1, U: 1, L: 1, N: 1, S: 1, T: 1, R: 1, D: 2, G: 2, B: 3, C: 3, M: 3, P: 3, F: 4, H: 4, V: 4, W: 4, Y: 4, K: 5, J: 8, X: 8, Q: 10, Z: 10, };

const TileComponent: React.FC<TileComponentProps> = ({
  value,
  transparent,
  selected,
  dark,
  readonly,
  onClick,
  children,
  disabled,
  drift,
}) => {
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);
  let driftFactor = 500;
  let driftTime = 200;

  function startDrift() {
    if (drift) {
      let driftX = Math.floor(Math.random() * driftFactor);
      let driftY = Math.floor(Math.random() * driftFactor);

      let negativeFactorX = Math.random() < 0.5 ? -1 : 1;
      let negativeFactorY = Math.random() < 0.5 ? -1 : 1;

      setX(driftX * negativeFactorX);
      setY(driftY * negativeFactorY);

      setTimeout(() => {
        setX(Math.floor(0));
        setY(Math.floor(0));
      }, driftTime);
    }
  }

  useEffect(() => {
    if (drift) {
      setTimeout(() => startDrift(), 100);
    }
  }, [drift]);

  return (
    <motion.div
      draggable="false"
      className="relative"
      animate={{ x, y }}
      transition={{ type: "spring" }}
      style={{ opacity: transparent ? 0 : "" }}
      onClick={(e) => {
        if (!disabled && onClick) onClick(e);
      }}
    >
      <motion.div
        draggable="false"
        className={`relative ${readonly || disabled ? "" : "cursor-pointer"}
      ${
        dark ? "bg-blue-900" : "bg-blue-400"
      } rounded-sm w-12 h-12 flex flex-col justify-center items-center z-20`}
        animate={
          dark
            ? {
                opacity: disabled ? 0.3 : 1,
              }
            : {
                opacity: disabled ? 0.3 : 1,
                backgroundColor: selected ? "#BFDBFE" : "#60A5FA",
              }
        }
        transition={{ duration: 0.3 }}
      >
        {children ? (
          children
        ) : (
          <div className="relative h-full w-full">
            <motion.p
              draggable="false"
              className={`m-0 absolute top-[0.7rem] w-full text-center text-bold text-lg select-none z-1 ${
                selected ? "text-blue-600" : "text-slate-100"
              } ${dark ? "bg-blue-900" : "bg-blue-400"}`}
              animate={{ backgroundColor: selected ? "#BFDBFE" : "#60A5FA" }}
              transition={{ duration: 0.3 }}
            >
              {value}
            </motion.p>
            <motion.p
              draggable="false"
                className={`absolute -top-[0.8rem] right-1 text-bold text-center text-sm
                  select-none z-1 ${selected ? "text-blue-600" : "text-slate-100"}`}
              transition={{ duration: 0.3 }}
            >
              {letterPoints[value || "A"]}
            </motion.p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export { TileComponent, nullTile, isTileEqual };
