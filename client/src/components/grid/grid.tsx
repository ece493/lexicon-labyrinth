import { Board } from "../../data/model";

interface GridComponentProps {
  grid: Board;
  board_size: [number, number];
  buildChild: ( x: number, y: number, value: string) => {};
}

export const GridComponent: React.FC<GridComponentProps> = ({
  grid,
  board_size,
  buildChild
}) => {
  function buildGrid() {
    var idx = 0;
    const arr = Array(board_size[0] * board_size[1]);
    for (let i = 0; i < board_size[0]; i++) {
      for (let j = 0; j < board_size[1]; j++) {
        arr.push(buildChild(j,i, grid.tiles[i][j]));
        idx++;
      }
    }
    return arr;
  }

  return (
    <div className="flex flex-col mt-2 mx-2">
      <div
        draggable="false"
        onDragStart={(e) => {
          e.preventDefault();
        }}
        className={` p-4 grid grid-rows-${board_size[1]} grid-cols-${board_size[0]} gap-4 my-auto bg-blue-500 rounded-sm`}
      >
        {buildGrid()}
      </div>
    </div>
  );
};
