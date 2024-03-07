import React from "react";
import { Bot, Lobby, Player, isPlayerABot } from "../../data/model";
import { BotComponent, PlayerComponent } from "./player-bot-component";

interface LobbyProps {
    lobby: Lobby,
    player_id: number
}

const LobbySettingsComponent: React.FC<LobbyProps> = ({...p}) => {
    return(
        <div className="h-full w-full">
            <div className="flex flex-col w-full">
                <p className="text-slate-100">Lobby Code</p>
                <h1 className="text-slate-100 text-3xl">{p.lobby.lobby_code}</h1>
            </div>
            <div className="py-4"></div>
            <div className="flex flex-col w-full py-1">
                <p className="text-slate-100">Number of Lives</p>
                <input className="p-1 rounded-lg" value={p.lobby.max_lives}></input>
            </div>
            <div className="flex flex-col w-full py-1">
                <p className="text-slate-100">Turn Timer</p>
                <input className="p-1 rounded-lg" value={p.lobby.timer_setting}></input>
            </div>
            <div className="flex flex-col w-full py-1">
                <p className="text-slate-100">Board Width</p>
                <input className="p-1 rounded-lg" value={p.lobby.board_size[0]}></input>
            </div>
        </div>
    );
}

const LobbyComponent: React.FC<LobbyProps> = ({lobby, player_id}) => {
    return (
        <div className="h-screen flex flex-col justify-center bg-blue-400 align-middle items-center">
            <div className="h-[75vh] w-[75vw] flex flex-row bg-blue-500 p-12 gap-12 rounded-3xl" >
                <div className="h-full w-2/3 flex flex-col p-8 bg-blue-400 rounded-3xl justify-center items-center">
                    <div className="flex flex-row h-1/2 w-fit gap-4">
                        {lobby.players.slice(0,3).map(p => (isPlayerABot(p)) ? <BotComponent {...(p as Bot)} /> : <PlayerComponent {...p} />)}
                    </div>
                    <div className="flex flex-row h-1/2 w-fit gap-4">
                        {lobby.players.slice(3,6).map(p => (isPlayerABot(p)) ? <BotComponent {...(p as Bot)} /> : <PlayerComponent {...p} />)}
                    </div>
                </div>
                <div className="h-full w-1/3 bg-blue-400 p-12 rounded-3xl" >
                    <LobbySettingsComponent lobby={lobby} player_id={player_id} />
                </div>
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
