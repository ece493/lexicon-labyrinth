import React, { useContext, useEffect, useState } from "react";
import { GameContext } from "../../../context/ctx";
import { connect } from "../../../ws-client/client";

const JoinLobbyComponent: React.FC = () => {
    const ctx = useContext(GameContext);
    const [code, setCode] = useState("");
    return (
        <div className="m-0 h-screen flex flex-col justify-center bg-blue-400 align-middle items-center">
            <div className="m-0 h-[70vh] w-[75vw] flex flex-row bg-blue-500 p-12 gap-12 rounded-3xl" >
                <div className="h-auto w-full flex flex-col p-8 bg-blue-400 rounded-3xl justify-center items-center">
                    <h1 className="text-slate-100">Enter Your Lobby Code Here</h1>
                    <input defaultValue={code} onChange={(e) => setCode(e.target.value)}
                        className="p-1 text-3xl rounded-2xl"></input>
                    <button
                        onClick={() => ctx.sock && ctx.transitions.joinLobby(ctx.sock, code)}
                        className="m-6 bg-red-400 text-lg rounded-2xl h-12 px-6 text-pink-100"
                        disabled={!code.length
                            || !ctx.sock || ctx.sock.readyState !== WebSocket.OPEN}>Start</button>
                </div>
            </div>
        </div>
    );
};

const JoinLobbyErrorComponent: React.FC = () => {
    const ctx = useContext(GameContext);
    const [code, setCode] = useState("");
    return (
        <div className="m-0 h-screen flex flex-col justify-center bg-blue-400 align-middle items-center">
            <div className="m-0 h-[70vh] w-[75vw] flex flex-row bg-blue-500 p-12 gap-12 rounded-3xl" >
                <div className="h-auto w-full flex flex-col p-8 bg-blue-400 rounded-3xl justify-center items-center">
                    <h1 className="text-slate-100">Lobby Does Not Exist!</h1>
                </div>
            </div>
        </div>
    );
};

export default JoinLobbyComponent;