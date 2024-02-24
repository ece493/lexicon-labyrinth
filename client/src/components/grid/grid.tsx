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
    <div>
      <p className="text-bold text-lg">{grid.tiles[y][x]}</p>
    </div>
  );
};

export const GridComponent: React.FC<GridComponentProps> = ({
  grid,
  board_size,
}) => {
  const buildGrid = () => {
    const arr = Array(board_size[0]*board_size[1]);
    for (let i = 0; i < board_size[0]; i++) {
      for (let j = 0; j < board_size[1]; j++) {
        arr[i] = <Tile grid={grid} x={i} y={j} />;
      }
    }
    return arr;
  }
  return (
    <div
      className={`grid grid-rows-${board_size[0]} grid-cols-${board_size[1]} gap-4`}
    >
      {buildGrid()}
    </div>
  );
};
