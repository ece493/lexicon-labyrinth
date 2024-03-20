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
      } rounded-sm w-12 h-12 flex flex-col justify-center items-center z-10`}
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
          <motion.p
            draggable="false"
            className={`relative text-bold text-lg select-none z-1 ${
              selected ? "text-blue-600" : "text-slate-100"
            } text-center ${dark ? "bg-blue-900" : "bg-blue-400"}`}
            animate={{ backgroundColor: selected ? "#BFDBFE" : "#60A5FA" }}
            transition={{ duration: 0.3 }}
          >
            {value}
          </motion.p>
        )}
      </motion.div>
    </motion.div>
  );
};

export { TileComponent, nullTile, isTileEqual };
