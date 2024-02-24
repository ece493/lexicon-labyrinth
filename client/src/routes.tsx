import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
} from "react-router-dom";
import Home from "./pages/home";
import Game from "./pages/game";
import Lobby from "./pages/lobby";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/game/:gameId",
    element: <Game />,
  },
  {
    path: "/lobby/:lobbyId",
    element: <Lobby />,
  },
]);
