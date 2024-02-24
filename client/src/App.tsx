import React from "react";
import logo from "./logo.svg";
import "./App.css";
import { Board } from "./data/model";
import { GridComponent } from "./components/grid/grid";

function App() {
  return (
    <div className="flex bg-blue-400 h-screen">
      <GridComponent
        board_size={[2, 2]}
        grid={{
          tiles: [
            ["a", "b"],
            ["c", "d"],
          ],
        }}
      ></GridComponent>
    </div>
  );
}

export default App;
