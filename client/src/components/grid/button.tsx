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
  long
}) => {
  return (
    <Button
      onClick={onClick}
      style={{ textTransform: "none" }}
      className={` w-full h-8 ${
        long?"px-20":""
      } ${
        !invert ? "bg-blue-600" : "bg-slate-100"
      }  rounded-sm text-bold text-sm ${
        invert ? "text-blue-600" : "text-slate-100"
      }`}
    >
      {label}
    </Button>
  );
};

export default ButtonComponent;
