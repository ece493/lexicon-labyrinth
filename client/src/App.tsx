import React, { useState } from "react";
import { RouterProvider } from "react-router-dom";
import { router } from "./routes";
import "./App.css";
import { GameContext } from "./context/ctx";
import { connect } from "./ws-client/client";
import { ScreenState } from "./data/model";

function App() {
  const [screen, setScreen] = useState<ScreenState>(ScreenState.START);
  const [lobbyCode, setLobbyCode] = useState<string|null>(null);
  return <GameContext.Provider value={{ connectWs: connect, sock: null, screen, setScreen, lobbyCode, setLobbyCode }}>
    <RouterProvider router={router} />
  </GameContext.Provider>
}

export default App;
