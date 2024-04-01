import React, { useState } from "react";
import { Bot, Lobby, Player, isPlayerABot } from "../../data/model";
import robotSvg from "./assets/robot.svg";
import personSvg from "./assets/person.svg";
import Button from "@mui/material/Button";
import { Divider, Fab, IconButton, Typography } from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from "../icons/addIcon";

type PlayerBotManagerComponentProps = {
    player: Player | Bot,
    is_player: boolean,
    delete_player?: () => void,
    cycle_difficulty?: () => string,
    toggleManageMode?: () => void,
}

type PlayerBotDisplayComponentProps = {
    is_player: boolean,
    name: string,
    img: string,
}

export const PlayerComponent: React.FC<Player & {is_player: boolean}> = ({...p}) => <BotPlayerComponent name={p.name} img={personSvg} is_player={p.is_player} />;
export const BotComponent: React.FC<Bot & { is_player: boolean }> = ({...p}) => <BotPlayerComponent name={p.name} img={robotSvg} is_player={p.is_player} />;

export const BotPlayerComponent: React.FC<PlayerBotDisplayComponentProps> = ({is_player, name, img}) => {
    return (
        <div className={`m-0 flex flex-auto flex-col items-center justify-center h-40 w-32 bg-blue-400 p-4 ${is_player ? "border-white border-2" : ""}`} >
            <img className="m-0 h-16 w-16 opacity-80 invert" src={img}></img>
            <h4 className={`m-0 text-slate-100 text-center ${is_player ? "text-red-300" : ""}`}>{name}</h4>
        </div>
    );
}

export const PlayerBotAdminComponent: React.FC<PlayerBotManagerComponentProps> = ({ is_player, delete_player, cycle_difficulty, toggleManageMode }) => {
    const [difficulty, setDifficulty] = useState<string>("Medium");
    return (
        <div className={`m-0 flex flex-auto flex-col items-center justify-between h-48 w-40 bg-blue-400 ${is_player?"border-white border-2": ""}`}>
            <div className="w-full h-10 m-0">
                <IconButton onClick={toggleManageMode} size="medium" className="float-right">
                    <CloseIcon sx={{ color: "white" }} fontSize="inherit" />
                </IconButton>
            </div>
            <div className="p-4 w-auto">
                { delete_player &&
                    <Button className="m-0 h-8 bg-slate-100 text-blue-600 py-2 px-4 z-10"
                        style={{ textTransform: 'none' }}
                        onClick={delete_player}>
                            Remove
                    </Button>
                }
                {cycle_difficulty &&
                    <Divider flexItem className="py-2" sx={{
                        "&::before, &::after": {
                            borderColor: "white", // https://stackoverflow.com/questions/58295779/divider-color-change-react-material-ui
                        },
                    }}>
                        <Typography className="text-sm text-slate-100">Difficulty</Typography>
                    </Divider>
                }
                { cycle_difficulty &&
                    <div className="flex flex-col items-center w-auto">
                        <Button className="bg-slate-100 h-8 text-blue-600 py-2 px-4 z-[20]"
                            style={{ textTransform: 'none' }}
                            onClick={() => setDifficulty(cycle_difficulty())}>{difficulty}</Button>
                    </div>
                }
            </div>
            <div className="h-6"></div>
        </div>
    );
}

export const PlayerBotManagerComponent: React.FC<PlayerBotManagerComponentProps> = ({ is_player, player, delete_player, cycle_difficulty })=> {
    const [manageMode, setManageMode] = useState<boolean>(false);
    const toggleManageMode = () => setManageMode(m => !m);
    return <div className={`h-auto w-auto p-0 m-0 ${!manageMode && delete_player? "hover:opacity-80": ""}`}
        onClick={(manageMode) ? () => { } : () => setManageMode(!manageMode)}>{
            (manageMode && delete_player)
                ? <PlayerBotAdminComponent player={player} is_player={is_player} delete_player={() => {
                    setManageMode(!manageMode);
                    delete_player();
                    }} cycle_difficulty={cycle_difficulty} toggleManageMode={toggleManageMode}/>
                : (isPlayerABot(player))
                    ? <BotComponent {...(player as Bot)} is_player={is_player} />
                    : <PlayerComponent {...player} is_player={is_player} />
        }</div>;
}