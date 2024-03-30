import JoinLobbyComponent, { JoinLobbyErrorComponent } from "../components/lobby/join/join-lobby-component";

const JoinLobbyPage = () => <JoinLobbyComponent />;
export const JoinLobbyErrorPage = (msg: string) => <JoinLobbyErrorComponent msg={msg}/>;
export default JoinLobbyPage;
