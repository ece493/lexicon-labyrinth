import React from "react";
import { SelectionGridComponent } from "../components/grid/selectionGrid";
import TurnComponent from "../components/grid/turn";
import PowerupsComponent from "../components/grid/powerups";
import PlayersComponent from "../components/grid/players";
import { Player } from "../data/model";
import { useState } from "react";
import { SwapGridComponent } from "../components/grid/swapGrid";
import { RotateGridComponent } from "../components/grid/rotateGrid";
import { TransformGridComponent } from "../components/grid/transformGrid";
import { ScrambleGridComponent } from "../components/grid/scrambleGrid";

const Game: React.FC = () => {
  const [word, setWord] = useState(""); // May have to change where this is stored to prevent too much re-rendering
  const [powerup, setPowerup] = useState<string | null>(null);
  const [tiles, setTiles] = useState([
    ["a", "b", "c", "d", "a", "b", "c", "d"],
    ["a", "f", "g", "h", "a", "b", "c", "d"],
    ["i", "j", "k", "l", "a", "b", "c", "d"],
    ["m", "n", "o", "p", "a", "b", "c", "d"],
    ["m", "n", "o", "p", "a", "b", "c", "d"],
    ["m", "n", "o", "p", "a", "b", "c", "d"],
    ["m", "n", "o", "p", "a", "b", "c", "d"],
    ["m", "n", "o", "p", "a", "b", "c", "d"],
  ]);

  function getGrid() {
    switch (powerup) {
      case "SWAP":
        return (
          <SwapGridComponent
            help={word}
            setPowerup={setPowerup}
            setHelp={setWord}
            board_size={[8, 8]}
            grid={{
              tiles,
            }}
          />
        );
      case "ROTATE":
        return (
          <RotateGridComponent
            help={word}
            setPowerup={setPowerup}
            setHelp={setWord}
            board_size={[8, 8]}
            ogGrid={{
              tiles,
            }}
          />
        );
      case "TRANSFORM":
        return (
          <TransformGridComponent
            help={word}
            setPowerup={setPowerup}
            setHelp={setWord}
            board_size={[8, 8]}
            grid={{
              tiles,
            }}
          />
        );
      case "SCRAMBLE":
        return (
          <ScrambleGridComponent
            help={word}
            setPowerup={setPowerup}
            setHelp={setWord}
            board_size={[8, 8]}
            grid={{
              tiles,
            }}
          />
        );

      default:
        return (
          <SelectionGridComponent
            word={word}
            setWord={setWord}
            board_size={[8, 8]}
            grid={{
              tiles,
            }}
          />
        );
    }
  }

  return (
    <div
      className={`flex ${
        powerup ? "bg-blue-900" : "bg-blue-400"
      } pb-20 box-border min-h-screen`}
    >
      <div className="flex align-top justify-center width w-full">
        <div className="flex flex-col items-center pt-5">
          <TurnComponent word={word} player={"player name"} powerup={powerup} />
          <div className="flex flex-row items-start justify-center">
            <PowerupsComponent
              funds={50}
              powerup={powerup}
              setPowerup={setPowerup}
            ></PowerupsComponent>
            {getGrid()}
            <PlayersComponent
              turns={{
                order: [0, 1, 3],
                curr_turn: 3,
              }}
              players={[]}
              powerup={powerup}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Game;
