import React from "react";

import { Player } from "../../data/model";

interface ButtonComponentProps {
  label: string;
  onClick: any
  disabled?: boolean
}

const ButtonComponent: React.FC<ButtonComponentProps> = ({ label,  onClick}) => {
  return (
    <div onClick={onClick} className="cursor-pointer px-2 flex align-center justify-center w-20 h-8 bg-blue-800  rounded-sm">
      <p className="m-auto text-bold text-sm text-slate-100">{label}</p>
    </div>
  );
};

export default ButtonComponent;
