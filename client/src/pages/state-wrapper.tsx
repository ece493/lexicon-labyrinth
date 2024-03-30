import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GameContext } from "../context/ctx";
import { Lobby, ScreenState } from "../data/model";
import { TransitionManager } from "../ws-client/server/transitions";
import { connect } from "../ws-client/client";
import Home from "./home";
import LobbyPage from "./lobby";
import Game from "./game";
import JoinLobbyPage, { JoinLobbyErrorPage } from "./join-lobby";
import { ReceiveCallbacksDefault } from "../ws-client/receive-callbacks";
import EndPage from "./end";
import NameEntryPage from "./name-entry";
import { AnimatePresence, AnimationScope, motion, useAnimate, usePresence } from "framer-motion";
import StartPage from "./start";

interface StateWrapperProps {
  initScreen?: ScreenState;
}


export const StateWrapper: React.FC<StateWrapperProps> = ({
  initScreen = ScreenState.TEST_HOME,
}) => {
  const ctx = useContext(GameContext)
  const [screen, setScreen] = useState<ScreenState>(initScreen);
  const [lobby, setLobby] = useState<Lobby|null>(null);
  const [playerId, setPlayerId] = useState<string>("");
  const dReceiveCallbacks = ReceiveCallbacksDefault;
  const [sock, setSock] = useState<WebSocket|null>(null);
  const [playerName, setPlayerName] = useState("");
  useEffect(() => setSock(connect(setLobby, setPlayerId, setScreen, dReceiveCallbacks, ctx)), []);
  
  const stateToScreen = (s: ScreenState) => {
    switch (s) {
      case ScreenState.TEST_HOME:
        return <Home />
        case ScreenState.START:
          return <StartPage />;
          case ScreenState.NAME_ENTRY:
        return <NameEntryPage />;
      case ScreenState.LOBBY:
        return <LobbyPage />;
      case ScreenState.GAME:
        return <Game />;
      case ScreenState.LOBBY_CODE_ENTRY:
        return <JoinLobbyPage />;
      case ScreenState.LOBBY_CODE_ENTRY_FAILED:
        return JoinLobbyErrorPage("Lobby Does Not Exist!");
      case ScreenState.LOBBY_FULL:
        return JoinLobbyErrorPage("Lobby is Full!");
      case ScreenState.END:
        return <EndPage />;
      default:
        return <Home />;
    }
  };
  return (
    <GameContext.Provider
      value={{
        playerName: playerName,
        setPlayerName,
        playerId,
        setPlayerId,
        sock: sock,
        screen,
        setScreen,
        lobby,
        setLobby,
        transitions: TransitionManager,
        receiveCallBacks: dReceiveCallbacks,
        sequenceNumber: 0,
      }}
    >
      <div className="m-0 bg-blue-400 h-screen w-screen overflow-hidden relative">
        <AnimatePresence mode="wait">
          {stateToScreen(screen)}
        </AnimatePresence>
      </div>
    </GameContext.Provider>
  );
};
