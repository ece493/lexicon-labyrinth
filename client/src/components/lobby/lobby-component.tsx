import React from "react";
import { Bot, Lobby, Player, isPlayerABot } from "../../data/model";
import { BotComponent, PlayerBotManagerComponent, PlayerComponent } from "./player-bot-component";
import Slider from "@mui/material/Slider";
import { GameContextData } from "../../context/ctx";
import Button from "@mui/material/Button";

interface LobbyProps {
    lobby: Lobby,
    player_id: string,
    ctx: GameContextData
}

const LobbySettingsReadOnlyComponent: React.FC<LobbyProps> = ({...p}) => {
    return(
        <div className="m-0 h-auto w-full">
            <div className="m-0 flex flex-col w-full">
                <p className="m-0 text-slate-100">Lobby Code</p>
                <h1 className="m-0 text-slate-100 text-3xl">{p.lobby.lobby_code}</h1>
            </div>
            <div className="m-0 py-4"></div>
            <div className="m-0 flex flex-col w-full py-1">
                <p className="m-0 text-slate-100">Number of Lives</p>
                <h2 className="m-0 rounded-lg text-blue-100 text-xl">{p.lobby.max_lives}</h2>
            </div>
            <div className="m-0 flex flex-col w-full py-1">
                <p className="m-0 text-slate-100">Turn Timer</p>
                <h2 className="m-0 rounded-lg text-blue-100 text-xl">{p.lobby.timer_setting}</h2>
            </div>
            <div className="m-0 flex flex-col w-full py-1">
                <p className="m-0 text-slate-100">Board Width</p>
                <h2 className="m-0 rounded-lg text-blue-100 text-xl">{p.lobby.board_size[0]}</h2>
            </div>
        </div>
    );
}

const LobbySettingsAdminComponent: React.FC<LobbyProps> = ({ ...p }) => {
    const updateSetting = (setting: string, val: number) => {
        p.ctx.transitions.changeParam(setting, val.toString(), p.ctx);
    };

    return (
        <div className="m-0 h-auto w-full">
            <div className="m-0 flex flex-col w-full">
                <p className="m-0 text-slate-100">Lobby Code</p>
                <h1 className="m-0 text-slate-100 text-3xl">{p.lobby.lobby_code}</h1>
            </div>
            <div className="m-0 py-4"></div>
            <div className="m-0 flex flex-col w-full py-1">
                <p className="m-0 text-slate-100">Number of Lives</p>
                <Slider
                    size="medium"
                    name="max_lives"
                    min={1}
                    max={15}
                    onChangeCommitted={(e, v) => updateSetting("max_lives", v as number)}
                    defaultValue={p.lobby.max_lives}
                    valueLabelDisplay="auto"
                />
            </div>
            <div className="m-0 flex flex-col w-full py-1">
                <p className="m-0 text-slate-100">Turn Timer</p>
                <Slider
                    size="medium"
                    name="timer_setting"
                    min={10}
                    max={60}
                    onChangeCommitted={(e, v) => updateSetting("timer_setting", v as number)}
                    defaultValue={p.lobby.timer_setting}
                    valueLabelDisplay="auto"
                />
            </div>
            <div className="m-0 flex flex-col w-full py-1">
                <p className="m-0 text-slate-100">Board Width</p>
                <Slider
                    size="medium"
                    name="board_size"
                    min={5}
                    max={10}
                    onChangeCommitted={(e, v) => updateSetting("board_size", v as number)}
                    defaultValue={p.lobby.board_size[0]}
                    valueLabelDisplay="auto"
                />
            </div>
        </div>
    );
}

const LobbyComponent: React.FC<LobbyProps> = ({lobby, player_id, ctx}) => {
    const difficulties = ["Easy", "Medium", "Hard"];
    const toggleDifficulty = (currentDifficulty: number): number => (currentDifficulty + 1) % 3;

    const curriedDeletePlayer = (p: Player | Bot) => (player_id === lobby.host)
            ? () => {
                "delete sequence";
                return;
            }
            : undefined;
    const curriedCycleDifficulty = (p: Player | Bot) => (player_id === lobby.host && isPlayerABot(p))
        ? () => {
            p.difficulty = toggleDifficulty(p.difficulty);
            return difficulties[p.difficulty];
        }
        : undefined;

    const startButton = () => {
        return <div className="m-0 w-[75vw] h-16">
            <div className="m-0 flex flex-auto justify-end h-auto py-4">
                <Button className="bg-red-400 h-10 py-2 px-4 text-pink-100" style={{ textTransform: 'none' }}>Start</Button>
            </div>
        </div>;
    }

    return (
        <form>
            <div className="m-0 h-screen flex flex-col justify-center bg-blue-400 align-middle items-center">
                <div className="m-0 h-[70vh] w-[75vw] flex flex-row bg-blue-500 p-12 gap-12" >
                    <div className="m-0 h-auto w-2/3 flex flex-col p-8 bg-blue-400 justify-center items-center">
                        <div className="m-0 flex flex-row h-1/2 w-fit gap-4">
                            {lobby.players.slice(0, 3).map((p, i) => <PlayerBotManagerComponent key={i} player={p} delete_player={curriedDeletePlayer(p)} cycle_difficulty={curriedCycleDifficulty(p)} />)}
                        </div>
                        <div className="m-0 flex flex-row h-1/2 w-fit gap-4">
                            {lobby.players.slice(3, 6).map((p, i) => <PlayerBotManagerComponent key={i} player={p} delete_player={curriedDeletePlayer(p)} cycle_difficulty={curriedCycleDifficulty(p)} />)}
                        </div>
                    </div>
                    <div className="m-0 h-auto w-1/3 bg-blue-400 p-12" >
                        {
                            (player_id === lobby.host)
                            ? <LobbySettingsAdminComponent lobby={lobby} player_id={player_id} ctx={ctx}/>
                            : <LobbySettingsReadOnlyComponent lobby={lobby} player_id={player_id} ctx={ctx}/>
                        }
                    </div>
                </div>
                {(player_id === lobby.host) && startButton()}
            </div>
        </form>
    );
};

export default LobbyComponent;