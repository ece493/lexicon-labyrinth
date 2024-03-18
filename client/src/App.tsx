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
  return <RouterProvider router={router} />
}

export default App;
