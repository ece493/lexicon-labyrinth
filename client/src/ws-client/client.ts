import { GameContextData } from "../context/ctx";
import { Action, Lobby, ScreenState, isAction } from "../data/model";
import { ActionsList } from "./model";
import { ReceiveCallbacks } from "./receive-callbacks";

type PlayerId = {
  playerId: string | null
}

// https://socket.io/how-to/use-with-react
export const connect = (
  setLobby: (l: Lobby) => void,
  setPlayerId: (s: string) => void,
  setScreen: (s: ScreenState) => void,
  receiveCallBacks: ReceiveCallbacks,
  addToQ: (f:()=> void) => void
) => {
  // TO-DO: Remove undefined
  // const url = process.env.NODE_ENV === 'production' ? "undefined" : 'ws://localhost:8888/websocket';
  const ws = new WebSocket("ws://localhost:8888/websocket");
  ws.onopen = (_) => console.log("connected websocket!");
  ws.onmessage = (ev) => addToQ(()=> wsReceiveHandler(setLobby, setPlayerId, setScreen, ev, receiveCallBacks));
  return ws;
};

export const wsReceiveHandler = (
  setLobby: (l: Lobby) => void,
  setPlayerId: (s: string) => void,
  setScreen: (s: ScreenState) => void,
  ev: MessageEvent<any>,
  receiveCallBacks: ReceiveCallbacks
) => {
  const data = JSON.parse(ev.data);
  if (!isAction(data)) return null;
  const action = data as Action;
  console.log("received", action);
  switch (action.action) {
    case ActionsList.return_lobby_code:
      // Code for return_lobby_code
      console.log("action.player_id", action.player_id);
      setScreen(ScreenState.LOBBY);
      break;
    case ActionsList.return_player_id:
      // Code for return_lobby_code
      console.log("action.player_id", action.player_id);
      setPlayerId(action.player_id);
      break;
    case ActionsList.lobby_does_not_exist:
      // Code for lobby_does_not_exist
      setScreen(ScreenState.LOBBY_CODE_ENTRY_FAILED);
      break;
    case ActionsList.lobby_full:
      // Code for lobby_does_not_exist
      setScreen(ScreenState.LOBBY_FULL);
      break;
    case ActionsList.successfully_joined_lobby:
      // Code for successfully_joined_lobby
      setScreen(ScreenState.LOBBY);
      setLobby(action.data.lobby);
      break;
    case ActionsList.success:
      // Code for success
      break;
    case ActionsList.error:
      // Code for error
      break;
    case ActionsList.start_game:
      // Code for start_game
      setScreen(ScreenState.GAME);
      break;
    case ActionsList.player_joined:
      // Code for player_joined
      break;
    case ActionsList.player_left:
      // Code for player_left
      break;
    case ActionsList.word_accepted:
      receiveCallBacks.handleWordAccept(action.data.path, action.data.lobby);
      break;
    case ActionsList.word_denied:
      receiveCallBacks.handleWordDeny(
        action.data.path,
        action.data.lobby.state.board
      );
      break;
    case ActionsList.lose_life:
      receiveCallBacks.handleLoseLife(action.data.lobby, action.data.player_id);
      break;
    case ActionsList.start_turn:
      receiveCallBacks.handleNewTurn(action.data);
      break;
    case ActionsList.powerup_denied:
      break;
    case ActionsList.rotate_powerup_accept:
      receiveCallBacks.handleRotateAccept(
        action.data.lobby,
        action.data.powerup_data.type,
        action.data.powerup_data.index,
        action.data.powerup_data.rotations
      );
      break;
    case ActionsList.transform_powerup_accept:
      receiveCallBacks.handleTransformAccept(
        action.data.lobby,
        action.data.powerup_data.tile,
        action.data.powerup_data.newChar
      );
      break;
    case ActionsList.swap_powerup_accept:
      receiveCallBacks.handleSwapAccept(action.data.lobby, action.data.powerup_data.tiles);
      break;
    case ActionsList.scramble_powerup_accept:
      receiveCallBacks.handleScrambleAccept(action.data.lobby);
      break;
    case ActionsList.you_died:
      receiveCallBacks.handleDeath(action.data.lobby, action.data.player_id);
      break;
    case ActionsList.you_win:
        receiveCallBacks.handleGameEnd(action.data.lobby);
        setScreen(ScreenState.END);
      break;
    case ActionsList.remove_player:
      if (action.player_id === action.data.player_id_removed)
        setScreen(ScreenState.BOOTED_FROM_LOBBY);
      setLobby(action.data.lobby);
      break;
    case ActionsList.leave_game:
      setLobby(action.data.lobby);
      break;
    default:
      setLobby(action.data.lobby);
      break;
  }
};
