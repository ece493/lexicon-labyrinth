import React, { useState } from "react";
import { Bot, Lobby, Player, isPlayerABot } from "../../data/model";
import robotSvg from "./assets/robot.svg";
import personSvg from "./assets/person.svg";

type PlayerBotManagerComponentProps = {
    player: Player | Bot,
    delete_player?: () => void,
    cycle_difficulty?: () => string,
    toggleManageMode?: () => void,
}

type PlayerBotDisplayComponentProps = {
    name: string,
    img: string,
}

export const PlayerComponent: React.FC<Player> = ({...p}) => <BotPlayerComponent name={p.name} img={personSvg} />;
export const BotComponent: React.FC<Bot> = ({...p}) => <BotPlayerComponent name={p.name} img={robotSvg} />;

export const BotPlayerComponent: React.FC<PlayerBotDisplayComponentProps> = ({name, img}) => {
    return (
        <div className="m-0 flex flex-auto flex-col items-center justify-center h-40 w-32 bg-blue-500 p-4 rounded-3xl" >
            <img className="m-0 h-16 w-16 opacity-80 invert" src={img}></img>
            <h4 className="m-0 text-slate-100 text-center">{name}</h4>
        </div>
    );
}

export const PlayerBotAdminComponent: React.FC<PlayerBotManagerComponentProps> = ({ delete_player, cycle_difficulty, toggleManageMode }) => {
    const [difficulty, setDifficulty] = useState<string>("Medium");
    return (
        <div className="m-0 flex flex-auto flex-col items-center justify-center h-40 w-32 bg-blue-500 p-4 rounded-3xl"
            onClick={toggleManageMode}>
            { delete_player &&
                <button className="m-0 bg-red-400 rounded-xl h-10 py-2 px-4 text-pink-100 z-10"
                    onClick={delete_player}>Remove</button>
            }
            { cycle_difficulty &&
                <button className="m-0 bg-red-400 rounded-xl h-10 py-2 px-4 text-pink-100 z-10"
                    onClick={() => setDifficulty(cycle_difficulty())}>{difficulty}</button>
            }
        </div>
    );
}

export const PlayerBotManagerComponent: React.FC<PlayerBotManagerComponentProps> = ({ player, delete_player, cycle_difficulty })=> {
    const [manageMode, setManageMode] = useState<boolean>(false);
    const toggleManageMode = () => setManageMode(m => !m);
    return <div className="h-auto w-auto p-0 m-0" onClick={(manageMode) ? () => { } : () => setManageMode(!manageMode)}>{
            (manageMode && delete_player)
                ? <PlayerBotAdminComponent player={player} delete_player={() => {
                    setManageMode(!manageMode);
                    delete_player();
                    }}cycle_difficulty={cycle_difficulty} toggleManageMode={toggleManageMode}/>
                : (isPlayerABot(player)) ? <BotComponent {...(player as Bot)} /> : <PlayerComponent {...player} />
        }</div>;
}