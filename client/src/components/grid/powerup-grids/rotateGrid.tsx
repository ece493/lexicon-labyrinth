import { Board } from "../../../data/model";
import { useState, useEffect, useRef, useContext } from "react";
import { TileComponent, nullTile, isTileEqual } from "../tile";
import ButtonComponent from "../button";
import DownIcon from "../../icons/downIcon";
import UpIcon from "../../icons/upIcon";
import RightIcon from "../../icons/rightIcon";
import LeftIcon from "../../icons/leftIcon";
import { GridComponent } from "../grid";
import { GameContext } from "../../../context/ctx";
import { PowerupVisComponent, PowerupVisComponentRef } from "./powerupVis";

interface RotateGridComponentProps {
  ogGrid: Board;
  board_size: [number, number];
  setPowerup: any;
  help: string;
  setHelp: any;
  resetWordSelection: () => void;
}

export const RotateGridComponent: React.FC<RotateGridComponentProps> = ({
  ogGrid,
  board_size,
  help,
  setHelp,
  setPowerup,
  resetWordSelection,
}) => {
  const [tiles, setTiles] = useState(structuredClone(ogGrid));
  const [selectedRow, setSelectedRow] = useState(-1);
  const [selectedCol, setSelectedCol] = useState(-1);
  const [rotations, setRotations] = useState(0);
  const gameContext = useContext(GameContext);
  const powerupVisRef = useRef<PowerupVisComponentRef>(null);

  useEffect(() => {
    setHelp("Rotate a row or column by clicking an arrow");
  }, []);

  function rotateRow(
    rowNum: number,
    prevSelectedRow: number,
    right: boolean = false
  ) {
    //rotates left by default

    const tilesCopy =
      prevSelectedRow === rowNum ? [...tiles] : structuredClone(ogGrid);

    const row = [...tilesCopy[rowNum]];

    if (right) {
      const temp = row.pop();
      row.unshift(temp as string);
    } else {
      const temp = row.shift();
      row.push(temp as string);
    }

    tilesCopy[rowNum] = row;
    setTiles(tilesCopy);
  }

  function rotateCol(
    colNum: number,
    prevSelectedCol: number,
    down: boolean = false
  ) {
    //rotates down by default

    const tilesCopy =
      prevSelectedCol === colNum ? [...tiles] : structuredClone(ogGrid);

    if (down) {
      const temp = tilesCopy[board_size[0] - 1][colNum];
      for (let i = board_size[0] - 1; i > 0; i--) {
        tilesCopy[i][colNum] = tilesCopy[i - 1][colNum];
      }
      tilesCopy[0][colNum] = temp;
    } else {
      const temp = tilesCopy[0][colNum];
      for (let i = 0; i < board_size[0] - 1; i++) {
        tilesCopy[i][colNum] = tilesCopy[i + 1][colNum];
      }
      tilesCopy[board_size[0] - 1][colNum] = temp;
    }
    setTiles(tilesCopy);
  }

  function handleConfirm() {
    if (gameContext.sock !== null) {
      gameContext.transitions.pickRotatePowerup(
        selectedRow === -1 ? "col" : "row",
        selectedRow === -1 ? selectedCol - 1 : selectedRow - 1,
        rotations,
        gameContext
      );

      resetWordSelection();
      setPowerup(null);
    }
  }

  function buildFullGrid() {
    const tileCopy = structuredClone(tiles);

    for (let i = 0; i < board_size[1]; i++) {
      const row = tileCopy[i];
      row.unshift(":<");
      row.push(":>");
      tileCopy[i] = row;
    }

    const upArrows = [""];
    for (let i = 0; i < board_size[0]; i++) upArrows.push(":^");
    upArrows.push("");
    tileCopy.unshift(upArrows);

    const downArrows = [""];
    for (let i = 0; i < board_size[0]; i++) downArrows.push(":v");
    downArrows.push("");
    tileCopy.push(downArrows);

    return tileCopy;
  }

  function incrementRotCount(type: string) {
    if (type === "row") {
      if (selectedRow !== -1) {
        setRotations(rotations + 1);
      } else {
        setRotations(1);
      }
    } else {
      if (selectedCol !== -1) {
        setRotations(rotations + 1);
      } else {
        setRotations(1);
      }
    }
  }

  function decrementRotCount(type: string) {
    if (type === "row") {
      if (selectedRow !== -1) {
        setRotations(rotations - 1);
      } else {
        setRotations(-1);
      }
    } else {
      if (selectedCol !== -1) {
        setRotations(rotations - 1);
      } else {
        setRotations(-1);
      }
    }
  }

  // TODO
  // Select affected tiles in all powerups (light them up!)
  // disable rotation while animating here
  // delay on turn changes "Your is playing... showing"

  function buildTile(x: number, y: number, v: string) {
    switch (v) {
      case ":v":
        return (
          <TileComponent
            dark
            onClick={() => {
              powerupVisRef?.current?.rotate("col", x - 1, 1, () => {
                setSelectedRow(-1);
                rotateCol(x - 1, selectedCol - 1, true);
                setSelectedCol(x);
                incrementRotCount("col");
              });
            }}
            value=""
          >
            <DownIcon />
          </TileComponent>
        );
      case ":^":
        return (
          <TileComponent
            dark
            onClick={() => {
              powerupVisRef?.current?.rotate("col", x - 1, -1, () => {
                setSelectedRow(-1);
                rotateCol(x - 1, selectedCol - 1);
                setSelectedCol(x);
                decrementRotCount("col");
              });
            }}
          >
            <UpIcon />
          </TileComponent>
        );
      case ":>":
        return (
          <TileComponent
            onClick={() => {
              powerupVisRef?.current?.rotate("row", y - 1, 1, () => {
                setSelectedCol(-1);
                rotateRow(y - 1, selectedRow - 1, true);
                setSelectedRow(y);
                incrementRotCount("row");
              });
            }}
            dark
          >
            <RightIcon />
          </TileComponent>
        );
      case ":<":
        return (
          <TileComponent
            onClick={() => {
              powerupVisRef?.current?.rotate("row", y - 1, -1, () => {
                setSelectedCol(-1);
                rotateRow(y - 1, selectedRow - 1);
                setSelectedRow(y);
                decrementRotCount("row");
              });
            }}
            dark
          >
            <LeftIcon />
          </TileComponent>
        );
      case "":
        return <TileComponent value="" transparent />;
      default:
        return (
          <TileComponent
            selected={selectedCol === x || selectedRow === y}
            readonly
            value={v}
          />
        );
    }
  }

  return (
    <div className="flex flex-col mt-2 mx-2">
      <div className="flex flex-row px-2">
        <ButtonComponent label="Confirm" onClick={handleConfirm} />
      </div>
      <div className="relative">
        <GridComponent
          grid={buildFullGrid()}
          buildChild={buildTile}
          board_size={[board_size[0] + 2, board_size[1] + 2]}
        />
        <div
          className="absolute z-20"
          style={{
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        >
          <PowerupVisComponent
            setWord={() => {}}
            board_size={[tiles.length, tiles.length]}
            grid={tiles}
            ref={powerupVisRef}
            disabled={false}
          />
        </div>
      </div>
    </div>
  );
};
