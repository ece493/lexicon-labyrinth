import React, { useContext, useEffect, useState } from "react";
import { GameContext } from "../../context/ctx";
import DefaultLayout from "../layout/default-layout";
import Button from "@mui/material/Button";
import { TileComponent } from "../grid/tile";
import { ScreenState } from "../../data/model";

const TileComponentWrapper: React.FC<{value: string}> = ({value}) => {
    const [empty, setEmpty] =  useState(true);
    useEffect(() => {
        const t = setTimeout(() => setEmpty(false), Math.random()*2000 + 1000);
        return () => clearTimeout(t);
    }, []);
    return <TileComponent value={empty?"":value} dark={empty}/>;
}

const StartComponent: React.FC = () => {
    const ctx = useContext(GameContext);
    const lst1 = "LEXICON".split('').map((l, i) => <TileComponentWrapper key={i} value={l} />);
    const lst2 = "LABYRINTH".split('').map((l, i) => <TileComponentWrapper key={i} value={l} />);

    return (
        <DefaultLayout>
            <div className="flex flex-row gap-2">{lst1}</div>
            <div className="flex flex-row gap-2">{lst2}</div>
            <div className="h-3"></div>
            <Button
                onClick={() => ctx.setScreen(ScreenState.NAME_ENTRY)}
                className={"bg-white h-10 py-2 px-4 text-blue-600"}
                style={{ textTransform: 'none' }}
            >Start</Button>
        </DefaultLayout>
    );
};

export default StartComponent;