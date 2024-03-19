import { createBrowserRouter } from "react-router-dom";
import Home from "./pages/home";
import Game from "./pages/game";
import Lobby from "./pages/lobby";
import JoinLobby from "./pages/join-lobby";
import { StateWrapper } from "./pages/state-wrapper";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <StateWrapper />,
  },
  {
    path: "/game/:gameId",
    element: <Game />,
  },
  {
    path: "/lobby/:lobbyId",
    element: <Lobby />,
  },
  {
    path: "/join",
    element: <JoinLobby />,
  },
]);
