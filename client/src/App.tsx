import React, { useState } from "react";
import { RouterProvider } from "react-router-dom";
import { router } from "./routes";
import "./App.css";
import { GameContext } from "./context/ctx";
import { connect } from "./ws-client/client";
import { ScreenState } from "./data/model";
import { TransitionManager } from "./ws-client/server/transitions";

function App() {
  const [screen, setScreen] = useState<ScreenState>(ScreenState.START);
  return <GameContext.Provider value={{
      connectWs: connect,
      sock: null,
      screen,
      setScreen,
      lobby: null,
      transitions: TransitionManager
      }}>
    <RouterProvider router={router} />
  </GameContext.Provider>
}

export default App;
