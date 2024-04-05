import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { GameContext } from "../context/ctx";
import { Lobby, ScreenState } from "../data/model";
import { TransitionManager } from "../ws-client/server/transitions";
import { connect } from "../ws-client/client";
import Home from "./home";
import LobbyPage from "./lobby";
import Game from "./game";
import JoinLobbyPage, { JoinLobbyErrorPage } from "./join-lobby";
import {
  GetReceiveCallbacksDefault,
  ReceiveCallbacks,
} from "../ws-client/receive-callbacks";
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
import BypassButton from "./bypass-button";
import { ErrorComponent } from "../components/error/error-component";

interface StateWrapperProps {
  initScreen?: ScreenState;
  bypassLobby?: boolean;
  useURLParams?: boolean;
  bypassLobbyRole?: string;
  lobbyCode?: string;
  setLobbyCode?: any;
}

const messageQ: (() => void)[] = [];
const pauseMessages = { pause: false };

export const StateWrapper: React.FC<StateWrapperProps> = ({
  initScreen = ScreenState.TEST_HOME,
  useURLParams = false,
  bypassLobby,
  bypassLobbyRole,
  lobbyCode,
  setLobbyCode,
}) => {
  const { lobbyId } = useParams();
  const [screen, setScreen] = useState<ScreenState>(initScreen);
  const [lobby, setLobby] = useState<Lobby | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [receiveCallbacks, setReceiveCallbacks] = useState<ReceiveCallbacks>(
    GetReceiveCallbacksDefault()
  );
  const [sock, setSock] = useState<WebSocket | null>(null);
  const [playerName, setPlayerName] = useState("");
  const [freezeInputs, setFreezeInputs] = useState(false);

  function addToQ(f: () => void) {
    messageQ.push(f);
  }

  useEffect(() => {
    setSock(
      connect(setLobby, setPlayerId, setScreen, receiveCallbacks, addToQ)
    );
    setInterval(() => {
      if (!pauseMessages.pause && messageQ.length > 0) {
        console.log("Processing message");
        const f = messageQ.shift();
        if (f) f();
      }
    }, 100);
  }, []);

  const stateToScreen = (s: ScreenState) => {
    switch (s) {
      case ScreenState.TEST_HOME:
        return <Home />;
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
      case ScreenState.BOOTED_FROM_LOBBY:
        return (
          <ErrorComponent
            msg={"You were kicked from the Lobby"}
            screen={ScreenState.START}
          />
        );
      case ScreenState.END:
        return <EndPage />;
      default:
        return <Home />;
    }
  };
  return (
    <GameContext.Provider
      value={{
        playerName,
        setPlayerName,
        playerId,
        setPlayerId,
        sock,
        screen,
        defaultLobbyCode: lobbyId ? lobbyId : "",
        setScreen,
        lobby,
        setLobby,
        transitions: TransitionManager,
        receiveCallBacks: receiveCallbacks,
        sequenceNumber: 0,
        freezeInputs,
        setFreezeInputs,
        pauseMessages
      }}
    >
      {!bypassLobby ? null : (
        <BypassButton
          bypassLobbyRole={bypassLobbyRole}
          lobbyCode={lobbyCode}
          setLobbyCode={setLobbyCode}
        />
      )}
      <div className="m-0 bg-blue-400 h-screen w-screen relative">
        <AnimatePresence mode="wait">{stateToScreen(screen)}</AnimatePresence>
      </div>
    </GameContext.Provider>
  );
};
