import React from "react";
import { Button } from "@mui/material";
import { Player } from "../../data/model";

interface ButtonComponentProps {
  label: string;
  onClick: any;
  disabled?: boolean;
}

const ButtonComponent: React.FC<ButtonComponentProps> = ({
  label,
  onClick,
}) => {
  return (
    <Button onClick={onClick} style={{textTransform: 'none'}}className="w-full h-8 bg-blue-600  rounded-sm text-bold text-sm text-slate-100">
      {label}
    </Button>
  );
};

export default ButtonComponent;
