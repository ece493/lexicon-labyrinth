import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GameContext } from "../context/ctx";
import { Lobby, ScreenState } from "../data/model";
import { TransitionManager } from "../ws-client/server/transitions";
import Home from "./home";
import LobbyPage from "./lobby";
import Game from "./game";
import JoinLobbyPage, { JoinLobbyErrorPage } from "./join-lobby";
import EndPage from "./end";
import NameEntryPage from "./name-entry";
import {
  AnimatePresence,
  AnimationScope,
  motion,
  useAnimate,
  usePresence,
} from "framer-motion";
import StartPage from "./start";
import { StateWrapper } from "./state-wrapper";

// No FR - For Tests
export const TestDoubleStateWrapper: React.FC = (
) => {
  const [lobbyCode, setLobbyCode ] = useState<string>("");

  return (
    <div>
    <div>
      <StateWrapper bypassLobby  bypassLobbyRole="HOST" lobbyCode={lobbyCode} setLobbyCode={setLobbyCode}/>
    </div>
    <div>
      <StateWrapper bypassLobby bypassLobbyRole="PLAYER" lobbyCode={lobbyCode} setLobbyCode={setLobbyCode}/>
    </div>
    <div>
      <StateWrapper bypassLobby bypassLobbyRole="PLAYER" lobbyCode={lobbyCode} setLobbyCode={setLobbyCode}/>
    </div>
  </div>
  );
};
