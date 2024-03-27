import React, { useContext, useEffect, useState } from "react";
import { GameContext } from "../../../context/ctx";
import { connect } from "../../../ws-client/client";
import { ScreenState } from "../../../data/model";
import DefaultLayout from "../../layout/default-layout";
import Button from "@mui/material/Button";

const JoinLobbyComponent: React.FC = () => {
    const ctx = useContext(GameContext);
    const [code, setCode] = useState("");
    const isDisabled = !code.length || !ctx.sock || ctx.sock.readyState !== WebSocket.OPEN;
    return (
        <DefaultLayout>
            <h1 className="m-0 text-slate-100">Enter Your Lobby Code Here</h1>
            <input defaultValue={code} onChange={(e) => setCode(e.target.value)}
                className="p-1 text-3xl"></input>
            <Button
                onClick={() => ctx.sock && ctx.transitions.joinLobby(code, ctx)}
                className={`${isDisabled ? "bg-slate-400" : "bg-red-400"} h-10 py-2 px-4 text-pink-100`}
                disabled={isDisabled}
                style={{ textTransform: 'none' }}
            >Start</Button>
        </DefaultLayout>
    );
};

export const JoinLobbyErrorComponent: React.FC<{msg: string}> = ({msg}) => {
    const ctx = useContext(GameContext);
    return (
        <DefaultLayout>
            <h1 className="text-slate-100">{msg}</h1>
            <Button
                onClick={() => ctx.setScreen(ScreenState.LOBBY_CODE_ENTRY)}
                className={"bg-red-400 h-10 py-2 px-4 text-pink-100"}
                style={{ textTransform: 'none' }}
            >Start</Button>
        </DefaultLayout>
    );
};

export default JoinLobbyComponent;