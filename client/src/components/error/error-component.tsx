import React, { useContext } from "react";
import { GameContext } from "../../context/ctx";
import { ScreenState } from "../../data/model";
import DefaultLayout from "../layout/default-layout";
import Button from "@mui/material/Button";

// FR19 - Game.Reused.Word
export const ErrorComponent: React.FC<{ msg: string; screen: ScreenState; }> = ({ msg, screen }) => {
    const ctx = useContext(GameContext);
    return (
        <DefaultLayout>
            <h1 className="text-slate-100">{msg}</h1>
            <Button
                onClick={() => ctx.setScreen(screen)}
                className={"bg-red-400 h-10 py-2 px-4 text-pink-100"}
                style={{ textTransform: 'none' }}
            >Return</Button>
        </DefaultLayout>
    );
};
