import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { GameContext } from "../context/ctx";
import { ScreenState } from "../data/model";
import { TransitionManager } from "../ws-client/server/transitions";
import { connect } from "../ws-client/client";
import Home from "./home";
import LobbyPage from "./lobby";
import Game from "./game";
import JoinLobbyPage, { JoinLobbyErrorPage } from "./join-lobby";
import JoinLobbyComponent from "../components/lobby/join/join-lobby-component";

interface StateWrapperProps {
    initScreen?: ScreenState
}

export const StateWrapper: React.FC<StateWrapperProps> = ({ initScreen = ScreenState.START }) => {
    const [screen, setScreen] = useState<ScreenState>(initScreen);
    const stateToScreen = (s: ScreenState) => {
        switch (screen) {
            case ScreenState.START:
                return <Home />;
            case ScreenState.LOBBY:
                return <LobbyPage />;
            case ScreenState.GAME:
                return <Game />;
            case ScreenState.LOBBY_CODE_ENTRY:
                return <JoinLobbyPage />;
            case ScreenState.LOBBY_CODE_ENTRY_FAILED:
                return <JoinLobbyErrorPage />;
            default:
                return <Home />;
        }
    }
    return <GameContext.Provider value={{
        sock: connect(setScreen),
        screen,
        setScreen,
        lobby: null,
        transitions: TransitionManager
    }}>
        { stateToScreen(screen) }
    </GameContext.Provider>
}