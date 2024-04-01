import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GameContext } from "../context/ctx";
import { Lobby, Action, ScreenState } from "../data/model";
import { ActionsList } from "../ws-client/model";
import { Button } from "@mui/material";

interface BypassProps {
  bypassLobbyRole?: string;
  lobbyCode?: string;
  setLobbyCode?: any;
}

const BypassButton: React.FC<BypassProps> = ({
  bypassLobbyRole,
  lobbyCode,
  setLobbyCode,
}) => {
  const ctx = useContext(GameContext);
  const [setupState, setSetupState] = useState("START");
  const [onBot, setOnBot] = useState(false);
  const [disabled, setDisabled] = useState(false);

  const handleBypassLobby = () => {
    if (bypassLobbyRole === "HOST") {
      if (setupState === "START") {
        ctx.setPlayerName(`HOST`);
        setSetupState("NAMED");
      } else if (setupState === "NAMED") {
        ctx.transitions.initialize(ctx);
        setSetupState("INITIALIZED");
      } else if (setupState === "INITIALIZED") {
        setLobbyCode(ctx.lobby?.lobby_code);
        setSetupState("CODE-READY");
        setOnBot(true);
      } else if (setupState === "CODE-READY") {
        ctx.transitions.readyLobby(ctx);
        setDisabled(true)
      }
    } else {
      if (setupState === "START") {
        ctx.setPlayerName(`PLAYER${Math.floor(Math.random() * 10)}`);
        setSetupState("NAMED");
      } else if (setupState === "NAMED") {
        ctx.transitions.joinLobby(lobbyCode ?? "", ctx);
        setOnBot(true)
        setDisabled(true)
      }
    }
  };

  return (
    <div className="absolute top-0 left-0">
      <Button
        style={{
          zIndex: bypassLobbyRole === "HOST" ?  onBot? 2: 4 : onBot? 1:3,
        }}
        variant="contained"
        onClick={handleBypassLobby}
        disabled ={disabled}
      >
        Bypass {bypassLobbyRole}
      </Button>
    </div>
  );
};

export default BypassButton;
