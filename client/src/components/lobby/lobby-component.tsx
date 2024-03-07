import React from "react";
import { Lobby } from "../../data/model";

interface LobbyProps {
    lobby: Lobby,
    player_id: number
}

const LobbyComponent: React.FC<LobbyProps> = ({lobby, player_id}) => {
    return (
        <div className="flex justify-center bg-blue-400 h-screen align-middle items-center">
            <div className="h-64 w-[75vw] bg-blue-500 p-12 rounded-3xl" >

            </div>
        </div>
    );
};

export default LobbyComponent;
