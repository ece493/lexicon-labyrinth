import React from "react";

import { Player } from "../../data/model";

interface AddIconComponentProps {}

// FR29 - Powerup.Display
const AddIcon: React.FC<AddIconComponentProps> = ({}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      height="18"
      viewBox="0 -960 960 960"
      width="18"
      className=" fill-slate-100"

    >
      <path d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z" />
    </svg>
  );
};

export default AddIcon;
