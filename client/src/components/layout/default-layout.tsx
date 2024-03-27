import { ButtonBaseProps } from "@mui/material";
import Button from "@mui/material/Button";
import React from "react";

interface DefaultLayoutProps {
    children: React.ReactNode
}

const DefaultLayout: React.FC<DefaultLayoutProps> = ({children}) => {
    return (
        <div className="m-0 h-screen flex flex-col justify-center bg-blue-400 align-middle items-center">
            <div className="h-80 w-[40rem] flex flex-col p-8 bg-blue-500 justify-center items-center gap-3">
                { children }
            </div>
        </div>
    );
};

export default DefaultLayout;