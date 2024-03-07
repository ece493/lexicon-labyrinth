import React from "react";
import { Lobby } from "../../data/model";

interface LobbyProps {
    lobby: Lobby,
    player_id: number
}

const LobbyComponent: React.FC<LobbyProps> = ({lobby, player_id}) => {
    return (
        <div className="flex flex-col justify-center bg-blue-400 h-screen align-middle items-center">
            <div className="h-[75vh] w-[75vw] bg-blue-500 p-12 rounded-3xl" >

            </div>
            <div className="w-[75vw] h-16">
                <div className="flex flex-auto justify-end h-full py-4">
                    <button className="bg-red-400 rounded-xl h-10 py-2 px-4 text-pink-200">Start</button>
                </div>
            </div>
        </div>
    );
};

export default LobbyComponent;
