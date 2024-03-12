import React from "react";
import { Button } from "@mui/material";
import { Player } from "../../data/model";

interface ButtonComponentProps {
  label: string;
  onClick: any;
  disabled?: boolean;
  invert?: boolean;
  long?: boolean;
}

const ButtonComponent: React.FC<ButtonComponentProps> = ({
  label,
  onClick,
  invert,
  long,
  disabled,
}) => {
  //
  return (
    <Button
      onClick={onClick}
      style={{ textTransform: "none", opacity: disabled ? 0.5 : ""  }}
      className={` w-full h-8 ${long ? "px-20" : ""} ${
        !invert ? "bg-blue-600" : "bg-slate-100"
      }  rounded-sm text-bold text-sm ${
        invert ? "text-blue-600" : "text-slate-100"
      }`}
      disabled={disabled}
    >
      {label}
    </Button>
  );
};

export default ButtonComponent;
