import { Board } from "../../data/model";

interface GridComponentProps {
  grid: Board;
  board_size: [number, number];
}

interface TileComponentProps {
  grid: Board;
  x: number;
  y: number;
}

const Tile: React.FC<TileComponentProps> = ({ x, y, grid }) => {
  return (
    <div  className="bg-blue-400 rounded-lg w-12 h-12 flex flex-col justify-center items-center">
      <p className="text-bold text-lg text-slate-100 text-center">
        {grid.tiles[y][x]}
      </p>
    </div>
  );
};

export const GridComponent: React.FC<GridComponentProps> = ({
  grid,
  board_size,
}) => {
  const buildGrid = () => {
    var idx = 0;
    const arr = Array(board_size[0] * board_size[1]);
    for (let i = 0; i < board_size[0]; i++) {
      for (let j = 0; j < board_size[1]; j++) {
        arr[idx] = <Tile key={`${i}-${j}`} grid={grid} x={i} y={j} />;
        idx++;
      }
    }
    return arr;
  };
  return (
    <div className={`my-2 grid grid-rows-${board_size[1]} grid-cols-${board_size[0]}
      gap-4 my-auto bg-blue-500 p-${board_size[0]} rounded-lg`} >
      {buildGrid()}
    </div>
  );
};
