import { Typography, Grow } from "@mui/material";
import React, { useEffect, useRef, useContext } from "react";
import { GameContext } from "../context/ctx";
import ButtonComponent from "../components/grid/button";
import { ScreenState } from "../data/model";
import { Fade } from "@mui/material";

// FR26 - Game.Winner
const EndPage: React.FC = () => {
  const ctx = useContext(GameContext);
  const winner = ctx.lobby?.players.find((p) => p.lives > 0);

  return (
    <div className="bg-blue-400 w-screen h-screen ">
      <Fade in={true} appear>
        <div
          className="flex flex-col m-auto w-20 content-start items-center "
          style={{ paddingTop: "5vh" }}
        >
          <Grow in={true} appear>
            <div className="flex flex-col content-start items-center ">
              <Typography className="text-slate-200 text-md  px-3 py-1">
                Winner
              </Typography>
              <Typography className="text-slate-200 px-3 py-1 text-7xl pb-8">
                {winner?.name ?? "WINNER"}
              </Typography>
            </div>
          </Grow>

          <ButtonComponent
            onClick={() => {
              ctx.setScreen(ScreenState.START);
            }}
            label=" continue"
          ></ButtonComponent>
        </div>
      </Fade>
    </div>
  );
};

export default EndPage;
