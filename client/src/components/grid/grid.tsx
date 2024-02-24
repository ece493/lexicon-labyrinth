import { Board } from "../../data/model";

interface GridComponentProps {
  grid: Board;
  board_size: [number, number];
}

interface TileComponentProps {
  val: string;
}

const Tile: React.FC<TileComponentProps> = ({ val }) => {
  return (
    <div>
      <p className="text-bold text-lg">{val}</p>
    </div>
  );
};

export const GridComponent: React.FC<GridComponentProps> = ({
  grid,
  board_size,
}) => {
  return (
    <div
      className={`grid grid-rows-${board_size[0]} grid-cols-${board_size[1]} gap-4`}
    >
      {grid.tiles.map((g) => (
        <Tile />
      ))}
    </div>
  );
};
