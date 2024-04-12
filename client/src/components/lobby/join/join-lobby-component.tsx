import React, { useContext, useEffect, useState } from "react";
import { GameContext } from "../../../context/ctx";
import DefaultLayout from "../../layout/default-layout";
import Button from "@mui/material/Button";

const JoinLobbyComponent: React.FC = () => {
    const ctx = useContext(GameContext);
    const [code, setCode] = useState(ctx.defaultLobbyCode);
    const isDisabled = !code.length || !ctx.sock || ctx.sock.readyState !== WebSocket.OPEN;
    return (
        <DefaultLayout>
            <h1 className="m-0 text-slate-100">Enter Your Lobby Code Here</h1>
            <input defaultValue={code} onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="p-1 text-3xl"></input>
            <div className="flex flex-row gap-2">
                {/* FR4 - Lobby.Join - Via Code */}
                <Button
                    onClick={() => ctx.sock && ctx.transitions.initialize(ctx)}
                    className="bg-white h-10 py-2 px-4 text-blue-600"
                    style={{ textTransform: 'none' }}
                >New Lobby</Button>
                <Button
                    onClick={() => ctx.sock && ctx.transitions.joinLobby(code, ctx)}
                    className={`${isDisabled ? "bg-slate-400" : "bg-red-400"} h-10 py-2 px-4 text-pink-100`}
                    disabled={isDisabled}
                    style={{ textTransform: 'none' }}
                >Start</Button>
            </div>
        </DefaultLayout>
    );
};

export default JoinLobbyComponent;