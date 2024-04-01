import JoinLobbyComponent from "../components/lobby/join/join-lobby-component";
import { ErrorComponent } from "../components/error/error-component";
import { ScreenState } from "../data/model";

const JoinLobbyPage = () => <JoinLobbyComponent />;
export const JoinLobbyErrorPage = (msg: string) => <ErrorComponent msg={msg} screen={ScreenState.LOBBY_CODE_ENTRY}/>;
export default JoinLobbyPage;
