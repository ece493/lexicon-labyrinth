interface TileComponentProps {
  value?: string;
  selected?: boolean;
  dark?: boolean;
  transparent?: boolean;
  readonly?: boolean;
  onClick?: any;
  children?: any;
}

const nullTile = [-1, -1];

function isTileEqual(t1: number[], t2: number[]) {
  return t1[1] === t2[1] && t1[0] === t2[0];
}

const TileComponent: React.FC<TileComponentProps> = ({
  value,
  transparent,
  selected,
  dark,
  readonly,
  onClick,
  children,
}) => {
  return (
    <div
      draggable="false"
      className="relative"
      style={{ opacity: transparent ? 0 : "" }}
      onClick={onClick}
    >
      <div
        draggable="false"
        className={`relative ${readonly ? "" : "cursor-pointer"}
      ${
        selected ? "bg-blue-200" : dark ? "bg-blue-900" : "bg-blue-400"
      } rounded-sm w-12 h-12 flex flex-col justify-center items-center z-10`}
      >
        {children ? (
          children
        ) : (
          <p
            draggable="false"
            className={`relative text-bold text-lg select-none z-1 ${
              selected ? "text-blue-600" : "text-slate-100"
            } text-center ${
              selected ? "bg-blue-200" : dark ? "bg-blue-900" : "bg-blue-400"
            }`}
          >
            {value}
          </p>
        )}
      </div>
    </div>
  );
};

export  {TileComponent, nullTile, isTileEqual};
