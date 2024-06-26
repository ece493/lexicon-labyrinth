import React from "react";
import { FadeWrapper } from "../animations/fade-wrapper";

interface DefaultLayoutProps {
    children: React.ReactNode
}

const DefaultLayout: React.FC<DefaultLayoutProps> = ({children}) => {
    return (
        <div className="m-0 h-screen flex flex-col justify-center bg-blue-400 align-middle items-center">
            <FadeWrapper>
            <div className="h-80 w-[40rem] flex flex-col p-8 bg-blue-500 justify-center items-center gap-3">
                { children }
            </div>
            </FadeWrapper>
        </div>
    );
};

export default DefaultLayout;