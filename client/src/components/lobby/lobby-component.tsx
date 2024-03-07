import React from "react";
import { Bot, Lobby, Player, isPlayerABot } from "../../data/model";
import robotSvg from "./assets/robot.svg";
import personSvg from "./assets/person.svg";

interface LobbyProps {
    lobby: Lobby,
    player_id: number
}

interface PlayerBotComponentProps {
    name: string,
    img: string
}

const PlayerComponent: React.FC<Player> = ({...p}) => {
    return (<BotPlayerComponent name={p.name} img={personSvg} />);
}

const BotComponent: React.FC<Bot> = ({...p}) => {
    return (<BotPlayerComponent name={p.name} img={robotSvg} />);
}

const BotPlayerComponent: React.FC<PlayerBotComponentProps> = ({name, img}) => {
    return (
        <div className="flex flex-auto flex-col items-center justify-center h-40 w-32 bg-blue-500 p-4 rounded-3xl" >
            <img className="h-16 w-16 opacity-80 invert" src={img}></img>
            <h4 className="text-slate-100 text-center">{name}</h4>
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
