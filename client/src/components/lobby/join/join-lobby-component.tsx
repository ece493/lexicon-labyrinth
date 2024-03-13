import React from "react";

const JoinLobbyComponent: React.FC = () => {
    return (
        <div className="m-0 h-screen flex flex-col justify-center bg-blue-400 align-middle items-center">
            <div className="m-0 h-[70vh] w-[75vw] flex flex-row bg-blue-500 p-12 gap-12 rounded-3xl" >
                <div className="h-auto w-full flex flex-col p-8 bg-blue-400 rounded-3xl justify-center items-center">
                    <h1 className="text-slate-100">Enter Your Lobby Code Here</h1>
                    <input className="p-1 text-3xl rounded-2xl"></input>
                    <button className="m-6 bg-red-400 text-lg rounded-2xl h-12 px-6 text-pink-100">Start</button>
                </div>
            </div>
        </div>
    );
};

export default JoinLobbyComponent;