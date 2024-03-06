import React from "react";

import { Player } from "../../data/model";
import ButtonComponent from "./button";
import FundsIcon from "../icons/fundsIcon";

interface PowerupsComponentProp {
  funds: number;
}

const PowerupsComponent: React.FC<PowerupsComponentProp> = ({ funds }) => {
  return (
    <div className="flex flex-col p-4 justify-start">
      <div className="space-x-1 items-center justify-center flex flex-row">
        <FundsIcon />
        <p className="text-bold text-lg text-slate-100">{funds}</p>
      </div>
      <div className="space-y-2 w-40">
        <ButtonComponent label="Rotate" onClick={() => {}} />
        <ButtonComponent label="Scramble" onClick={() => {}} />
        <ButtonComponent label="Transform" onClick={() => {}} />
        <ButtonComponent label="Swap" onClick={() => {}} />
      </div>
    </div>
  );
};

export default PowerupsComponent;
