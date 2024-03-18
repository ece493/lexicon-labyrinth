import React, { useEffect, useState } from "react";
import { RouterProvider } from "react-router-dom";
import { router } from "./routes";
import "./App.css";
import { GameContext } from "./context/ctx";
import { connect } from "./ws-client/client";
import { ScreenState } from "./data/model";
import { TransitionManager } from "./ws-client/server/transitions";
import { useNavigate } from "react-router-dom";

function App() {
  const [screen, setScreen] = useState<ScreenState>(ScreenState.START);
  const nav = useNavigate();
  useEffect(() => {
    switch (screen) {
      case ScreenState.START:
        return nav("/");
      case ScreenState.LOBBY:
        return nav("/");
      case ScreenState.GAME:
        // Code for GAME screen
        break;
      default:
        // Code for other screens
        break;
    }
  }, [screen]);
  return <GameContext.Provider value={{
      sock: connect(setScreen),
      screen,
      setScreen,
      lobby: null,
      transitions: TransitionManager
      }}>
    <RouterProvider router={router} />
  </GameContext.Provider>
}

export default App;
