import React from "react";
import { RouterProvider } from "react-router-dom";
import { router } from "./routes";
import "./App.css";
import { ClientContext } from "./ws-client/context/client-ctx";
import { connect } from "./ws-client/client";

function App() {
  return <ClientContext.Provider value={{ connect, sock: null }}>
    <RouterProvider router={router} />
  </ClientContext.Provider>
}

export default App;
