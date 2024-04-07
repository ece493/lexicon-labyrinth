import { createBrowserRouter } from "react-router-dom";
import Home from "./pages/home";
import Game from "./pages/game";
import Lobby from "./pages/lobby";
import JoinLobby from "./pages/join-lobby";
import { StateWrapper } from "./pages/state-wrapper";
import { TestDoubleStateWrapper } from "./pages/test-double-state-wrapper";
import { ScreenState } from "./data/model";

//https://stackoverflow.com/questions/35352638/how-to-get-parameter-value-from-query-string
export const router = createBrowserRouter([
  {
    path: "/",
    element: <StateWrapper initScreen={ScreenState.START}/>,
  },
  {
    path: "/game-test",
    element: <TestDoubleStateWrapper />,
  },
  {
    path: "/lobby/:lobbyId",
    element: <StateWrapper useURLParams initScreen={ScreenState.START}/>,
  },
  {
    path: "/join",
    element: <JoinLobby />,
  },
]);
