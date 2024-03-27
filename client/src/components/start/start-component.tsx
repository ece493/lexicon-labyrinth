import React, { useContext } from "react";
import { GameContext } from "../../context/ctx";
import DefaultLayout from "../layout/default-layout";
import Button from "@mui/material/Button";

const StartComponent: React.FC = () => {
    const ctx = useContext(GameContext);
    return (
        <DefaultLayout>
            <h1 className="text-slate-100">Lexicon Labyrinth</h1>
            <Button
                onClick={() => ctx.sock && ctx.transitions.initialize(ctx)}
                className={"bg-red-400 h-10 py-2 px-4 text-pink-100"}
                style={{ textTransform: 'none' }}
            >Start</Button>
        </DefaultLayout>
    );
};

export default StartComponent;