import React, { useEffect, useState } from "react";
import { Button } from "@mui/material";
import { motion } from "framer-motion";

interface ButtonComponentProps {
  label?: string;
  onClick: any;
  disabled?: boolean;
  invert?: boolean;
  long?: boolean;
  children?: any;
  flourish?: boolean;
}

const ButtonComponent: React.FC<ButtonComponentProps> = ({
  label,
  onClick,
  invert,
  long,
  disabled,
  children,
  flourish,
}) => {
  return (
    <Button
      onClick={onClick}
      style={{ textTransform: "none", opacity: disabled ? 0.5 : "", overflow:"hidden" }}
      className={` w-full h-8 ${long ? "px-20" : ""} ${
        !invert ? "bg-blue-600" : "bg-slate-100"
      }  rounded-sm text-bold text-sm ${
        invert ? "text-blue-600" : "text-slate-100"
      }`}
      disabled={disabled}
    >
      {children}
      <div className={children ? "ml-1" : ""}>{label}</div>
      {/* <motion.div className="absolute bg-blue-100 w-10 h-20 opacity-70"></motion.div> */}
    </Button>
  );
};

export default ButtonComponent;
