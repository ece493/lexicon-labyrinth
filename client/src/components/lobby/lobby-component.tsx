import React from "react";
import { Bot, Lobby, Player, isPlayerABot } from "../../data/model";
import { BotComponent, PlayerBotManagerComponent, PlayerComponent } from "./player-bot-component";
import Slider from "@mui/material/Slider";
import { GameContextData } from "../../context/ctx";
import Button from "@mui/material/Button";
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { FadeWrapper } from "../animations/fade-wrapper";
import { IconButton } from "@mui/material";

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
                <h2 className="m-0 rounded-lg text-blue-100 text-xl">{p.lobby.board_size}</h2>
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
                <div className="m-0 flex flex-row w-full">
                    <h1 className="m-0 text-slate-100 text-3xl mr-2">{p.lobby.lobby_code}</h1>
                    {/* FR3 - Lobby.Link */}
                    <IconButton className="my-auto" disabled={!navigator.clipboard}
                        onClick={() => navigator.clipboard.writeText(`http://localhost:3000/lobby/${p.lobby.lobby_code}`)}>
                        <ContentCopyIcon className="invert" />
                    </IconButton>
                </div>
            </div>
            <div className="m-0 py-4"></div>
            <div className="m-0 flex flex-col w-full py-1">
                <p className="m-0 text-slate-100">Number of Lives</p>
                {/* FR11 - Lobby.Lives */}
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
                {/* FR12 - Lobby.Close */}
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
                {/* FR10 - Lobby.Board.Size */}
                <Slider
                    size="medium"
                    name="board_size"
                    min={4}
                    max={10}
                    onChangeCommitted={(e, v) => updateSetting("board_size", v as number)}
                    defaultValue={p.lobby.board_size}
                    valueLabelDisplay="auto"
                />
            </div>
            <div className="m-0 flex flex-col w-full py-1">
                <Button
                    className="bg-white h-10 py-2 px-4 text-blue-600"
                    style={{ textTransform: 'none' }}
                    onClick={() => p.ctx.transitions.addBot(p.ctx)}
                    >Add Bot</Button>
            </div>
        </div>
    );
}

const LobbyComponent: React.FC<LobbyProps> = ({lobby, player_id, ctx}) => {
    const difficulties = ["Easy", "Medium", "Hard"];
    const toggleDifficulty = (currentDifficulty: number): number => (currentDifficulty + 1) % 3;

    const curriedDeletePlayer = (p: Player | Bot) => (player_id === lobby.host) && (p.id !== player_id)
            ? () => {
                ctx.transitions.removePlayer(p.id, ctx);
                return;
            }
            : undefined;
    const curriedCycleDifficulty = (p: Player | Bot) => (player_id === lobby.host && isPlayerABot(p))
        ? () => {
            ctx.transitions.updateBot(p.id, toggleDifficulty(p.difficulty), ctx);
            p.difficulty = toggleDifficulty(p.difficulty);
            return difficulties[p.difficulty];
        }
        : undefined;

    const startButton = () => {
        const isDisabled = lobby.players.length < 2;
        return <div className="m-0 w-full h-16">
            <div className="m-0 flex flex-auto justify-end h-auto px-2">
                <Button
                    disabled={isDisabled}
                    className={`${isDisabled ? "bg-slate-400" : "bg-red-400"} h-10 py-2 px-4 text-pink-100`} style={{ textTransform: 'none' }}
                    onClick={() => !isDisabled && ctx.transitions.readyLobby(ctx)}
                    >Start</Button>
            </div>
        </div>;
    }

    return (
        <FadeWrapper>
            <div className="m-0 h-screen flex flex-col justify-center bg-blue-400 align-middle items-center">
                <div className="m-0 w-auto flex flex-col gap-2" >
                    <div className="m-0 h-[70vh] w-auto flex flex-row gap-2">
                        <div className="m-0 h-auto w-auto flex flex-col p-8 bg-blue-500 justify-center items-center">
                            <div className="m-0 flex flex-row h-1/2 w-fit gap-4">
                                {lobby.players.slice(0, 3).map((p, i) => <PlayerBotManagerComponent key={i} is_player={p.id===player_id} player={p} delete_player={curriedDeletePlayer(p)} cycle_difficulty={curriedCycleDifficulty(p)} />)}
                            </div>
                            <div className="m-0 flex flex-row h-1/2 w-fit gap-4">
                                {lobby.players.slice(3, 6).map((p, i) => <PlayerBotManagerComponent key={i} is_player={p.id === player_id} player={p} delete_player={curriedDeletePlayer(p)} cycle_difficulty={curriedCycleDifficulty(p)} />)}
                            </div>
                        </div>
                        <div className="m-0 h-auto w-64 bg-blue-500 p-12" >
                            {
                                (player_id === lobby.host)
                                ? <LobbySettingsAdminComponent lobby={lobby} player_id={player_id} ctx={ctx}/>
                                : <LobbySettingsReadOnlyComponent lobby={lobby} player_id={player_id} ctx={ctx}/>
                            }
                        </div>
                    </div>
                    {(player_id === lobby.host) && startButton()}
                </div>
            </div>
        </FadeWrapper>
    );
};

export default LobbyComponent;