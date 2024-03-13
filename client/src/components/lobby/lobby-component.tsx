import React from "react";
import { Bot, Lobby, Player, isPlayerABot } from "../../data/model";
import { BotComponent, PlayerBotManagerComponent, PlayerComponent } from "./player-bot-component";

interface LobbyProps {
    lobby: Lobby,
    player_id: number
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
    return (
        <div className="m-0 h-auto w-full">
            <div className="m-0 flex flex-col w-full">
                <p className="m-0 text-slate-100">Lobby Code</p>
                <h1 className="m-0 text-slate-100 text-3xl">{p.lobby.lobby_code}</h1>
            </div>
            <div className="m-0 py-4"></div>
            <div className="m-0 flex flex-col w-full py-1">
                <p className="m-0 text-slate-100">Number of Lives</p>
                <input name="max_lives" defaultValue={p.lobby.max_lives} type="number" className="m-0 p-1 text-xl rounded-xl"></input>
            </div>
            <div className="m-0 flex flex-col w-full py-1">
                <p className="m-0 text-slate-100">Turn Timer</p>
                <input name="timer_setting" defaultValue={p.lobby.timer_setting} type="number" className="m-0 p-1 text-xl rounded-xl"></input>
            </div>
            <div className="m-0 flex flex-col w-full py-1">
                <p className="m-0 text-slate-100">Board Width</p>
                <input name="board_size" defaultValue={p.lobby.board_size[0]} type="number" className="m-0 p-1 text-xl rounded-xl"></input>
            </div>
        </div>
    );
}

const LobbyComponent: React.FC<LobbyProps> = ({lobby, player_id}) => {
    const difficulties = ["Easy", "Medium", "Hard"];
    const toggleDifficulty = (currentDifficulty: number): number => (currentDifficulty + 1) % 3;

    const curriedDeletePlayer = (p: Player | Bot) => (player_id === lobby.host)
            ? () => {"delete sequence"}
            : undefined;
    const curriedCycleDifficulty = (p: Player | Bot) => (player_id === lobby.host && isPlayerABot(p))
        ? () => {
            p.difficulty = toggleDifficulty(p.difficulty);
            return difficulties[p.difficulty];
        }
        : undefined;

    return (
        <form>
            <div className="m-0 h-screen flex flex-col justify-center bg-blue-400 align-middle items-center">
                <div className="m-0 h-[70vh] w-[75vw] flex flex-row bg-blue-500 p-12 gap-12 rounded-3xl" >
                    <div className="m-0 h-auto w-2/3 flex flex-col p-8 bg-blue-400 rounded-3xl justify-center items-center">
                        <div className="m-0 flex flex-row h-1/2 w-fit gap-4">
                            {lobby.players.slice(0, 3).map(p => <PlayerBotManagerComponent player={p} delete_player={curriedDeletePlayer(p)} cycle_difficulty={curriedCycleDifficulty(p)} />)}
                        </div>
                        <div className="m-0 flex flex-row h-1/2 w-fit gap-4">
                            {lobby.players.slice(3, 6).map(p => <PlayerBotManagerComponent player={p} delete_player={curriedDeletePlayer(p)} cycle_difficulty={curriedCycleDifficulty(p)} />)}
                        </div>
                    </div>
                    <div className="m-0 h-auto w-1/3 bg-blue-400 p-12 rounded-3xl" >
                        {
                            (player_id === lobby.host)
                            ? <LobbySettingsAdminComponent lobby={lobby} player_id={player_id} />
                            : <LobbySettingsReadOnlyComponent lobby={lobby} player_id={player_id} />
                        }
                    </div>
                </div>
                <div className="m-0 w-[75vw] h-16">
                    <div className="m-0 flex flex-auto justify-end h-auto py-4">
                        <button className="m-0 bg-red-400 rounded-xl h-10 py-2 px-4 text-pink-100">Start</button>
                    </div>
                </div>
            </div>
        </form>
    );
};

export default LobbyComponent;