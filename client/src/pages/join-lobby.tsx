import React from "react";
import LobbyComponent from "../components/lobby/lobby-component";
import { Bot, Lobby, Player } from "../data/model";
import JoinLobbyComponent, { JoinLobbyErrorComponent } from "../components/lobby/join/join-lobby-component";

const JoinLobbyPage = () => <JoinLobbyComponent />;
export const JoinLobbyErrorPage = () => <JoinLobbyErrorComponent />;
export default JoinLobbyPage;
