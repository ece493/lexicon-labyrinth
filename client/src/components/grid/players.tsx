import React from "react";

import { Player } from "../../data/model";

interface PlayersComponentProp {
  players: Player[];
}

const PlayersComponent: React.FC<PlayersComponentProp> = ({ players }) => {
  return <div>players{}</div>;
};

export default PlayersComponent;
