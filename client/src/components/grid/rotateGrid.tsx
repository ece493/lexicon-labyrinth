import { Board } from "../../data/model";
import { useState, useEffect, useRef } from "react";
import {TileComponent, nullTile, isTileEqual} from "./tile";
import ButtonComponent from "./button";
import DownIcon from "../icons/downIcon";
import UpIcon from "../icons/upIcon";
import RightIcon from "../icons/rightIcon";
import LeftIcon from "../icons/leftIcon";

interface RotateGridComponentProps {
  ogGrid: Board;
  board_size: [number, number];
  setPowerup: any;
  help: string;
  setHelp: any;
}

export const RotateGridComponent: React.FC<RotateGridComponentProps> = ({
  ogGrid,
  board_size,
  help,
  setHelp,
  setPowerup,
}) => {
  // TODO refactor with grid
  
  const [tiles, setTiles] = useState(structuredClone(ogGrid.tiles));
  const [selectedRow, setSelectedRow] = useState(-1);
  const [selectedCol, setSelectedCol] = useState(-1);

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
      prevSelectedRow === rowNum ? [...tiles] : structuredClone(ogGrid.tiles);

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
      prevSelectedCol === colNum ? [...tiles] : structuredClone(ogGrid.tiles);

    

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
    // TODO send new grid to server

    const command = {
      rowNum: selectedRow,
      colNum: selectedCol,
    };

    setTimeout(() => {
      setHelp("");
      setPowerup(null);
    }, 500);
  }

  function buildGrid() {
    var idx = 0;
    const arr = Array(board_size[0] * board_size[1]);
    for (let i = 0; i < board_size[0]; i++) {
      arr.push(
        <TileComponent
          onClick={() => {
            setSelectedCol(-1);
            rotateRow(i, selectedRow);
            setSelectedRow(i);
          }}
          dark
        >
          <LeftIcon />
        </TileComponent>
      );

      for (let j = 0; j < board_size[1]; j++) {
        arr.push(
          <TileComponent
            selected={selectedCol === j || selectedRow === i}
            readonly
            value={tiles[i][j]}
          />
        );
        idx++;
      }

      arr.push(
        <TileComponent
          onClick={() => {
            setSelectedCol(-1);
            rotateRow(i, selectedRow, true);
            setSelectedRow(i);
          }}
          dark
        >
          <RightIcon />
        </TileComponent>
      );
    }

    arr.unshift(<TileComponent value="" transparent />);
    for (let i = board_size[0] - 1; i >= 0; i--) {
      arr.unshift(
        <TileComponent
          dark
          onClick={() => {
            setSelectedRow(-1);
            rotateCol(i, selectedCol);
            setSelectedCol(i);
          }}
        >
          <UpIcon />
        </TileComponent>
      );
    }
    arr.unshift(<TileComponent value="" transparent />);

    arr.push(<TileComponent value="" transparent />);
    for (let i = 0; i < board_size[0]; i++) {
      arr.push(
        <TileComponent
          dark
          onClick={() => {
            setSelectedRow(-1);
            rotateCol(i, selectedCol, true);
            setSelectedCol(i);
          }}
          value=""
        >
          <DownIcon />
        </TileComponent>
      );
    }
    arr.push(<TileComponent value="" transparent />);

    return arr;
  }
  
  return (
    <div className="flex flex-col mt-2 mx-2">
      <div className="flex flex-row mb-2">
        <ButtonComponent label="Confirm" onClick={handleConfirm} />
      </div>
      <div
        draggable="false"
        onDragStart={(e) => {
          e.preventDefault();
        }}
        className={` p-4 grid grid-rows-${board_size[1] + 2} grid-cols-${
          board_size[0] + 2
        }
      gap-4 my-auto bg-blue-500 rounded-sm`}
      >
        {buildGrid()}
      </div>
    </div>
  );
};
