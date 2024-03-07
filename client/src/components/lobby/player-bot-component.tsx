import React from "react";
import { Bot, Lobby, Player, isPlayerABot } from "../../data/model";
import robotSvg from "./assets/robot.svg";
import personSvg from "./assets/person.svg";

interface PlayerBotComponentProps {
    name: string,
    img: string
}

export const PlayerComponent: React.FC<Player> = ({...p}) => {
    return (<BotPlayerComponent name={p.name} img={personSvg} />);
}

export const BotComponent: React.FC<Bot> = ({...p}) => {
    return (<BotPlayerComponent name={p.name} img={robotSvg} />);
}

export const BotPlayerComponent: React.FC<PlayerBotComponentProps> = ({name, img}) => {
    return (
        <div className="m-0 flex flex-auto flex-col items-center justify-center h-40 w-32 bg-blue-500 p-4 rounded-3xl" >
            <img className="m-0 h-16 w-16 opacity-80 invert" src={img}></img>
            <h4 className="m-0 text-slate-100 text-center">{name}</h4>
        </div>
    );
}
