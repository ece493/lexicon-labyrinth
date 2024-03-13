import React, { useState } from "react";
import { RouterProvider } from "react-router-dom";
import { router } from "./routes";
import "./App.css";
import { GameContext } from "./context/ctx";
import { connect } from "./ws-client/client";
import { Screen } from "./data/model";

function App() {
  const [screen, setScreen] = useState<Screen>(Screen.START);
  return <GameContext.Provider value={{ connectWs: connect, sock: null, screen, setScreen }}>
    <RouterProvider router={router} />
  </GameContext.Provider>
}

export default App;
