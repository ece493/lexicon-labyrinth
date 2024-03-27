import React, { useContext, useState } from "react";
import { GameContext } from "../../../context/ctx";
import { ScreenState } from "../../../data/model";
import DefaultLayout from "../../layout/default-layout";
import Button from "@mui/material/Button";

const NameEntryLobbyComponent: React.FC = () => {
    const ctx = useContext(GameContext);
    const isDisabled = ctx.playerName.length===0;
    return (
        <DefaultLayout>
            <h1 className="m-0 text-slate-100">Enter Your Nickname Here</h1>
            <input defaultValue={""} onChange={(e) => ctx.setPlayerName(e.target.value)}
                className="p-1 text-3xl"></input>
            <Button
                onClick={() => ctx.setScreen(ScreenState.LOBBY_CODE_ENTRY)}
                disabled={isDisabled}
                className={`${isDisabled ? "bg-slate-400" : "bg-red-400"} h-10 py-2 px-4 text-pink-100`}
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
                    >Return</Button>
        </DefaultLayout>
    );
};

export default NameEntryLobbyComponent;