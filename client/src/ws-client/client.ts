import { GameContextData } from "../context/ctx";
import { Action, ScreenState, isAction } from "../data/model";
import { ActionsList } from "./model";
import { ReceiveCallbacks } from "./receive-callbacks";

// https://socket.io/how-to/use-with-react
export const connect = (
  setScreen: (s: ScreenState) => void,
  receiveCallBacks: ReceiveCallbacks,
  ctx: GameContextData,
) => {
  // TO-DO: Remove undefined
  // const url = process.env.NODE_ENV === 'production' ? "undefined" : 'ws://localhost:8888/websocket';
  const ws = new WebSocket("ws://localhost:8888/websocket");
  ws.onopen = (_) => console.log("connected websocket!");
  ws.onmessage = (ev) => wsReceiveHandler(setScreen, ev, receiveCallBacks, ctx);
  return ws;
};

export const wsReceiveHandler = (
  setScreen: (s: ScreenState) => void,
  ev: MessageEvent<any>,
  receiveCallBacks: ReceiveCallbacks,
  ctx: GameContextData
) => {
  const data = JSON.parse(ev.data);
  if (!isAction(data)) return null;
  const action = data as Action;
  switch (action.action) {
    case ActionsList.return_lobby_code:
      // Code for return_lobby_code
      setScreen(ScreenState.LOBBY);
      break;
    case ActionsList.lobby_does_not_exist:
      // Code for lobby_does_not_exist
      setScreen(ScreenState.LOBBY_CODE_ENTRY_FAILED);
      break;
    case ActionsList.successfully_joined_lobby:
      // Code for successfully_joined_lobby
      setScreen(ScreenState.LOBBY);
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
    case ActionsList.update_lobby_settings:
      // Code for update_lobby_settings
      break;
    case ActionsList.word_accepted:
      receiveCallBacks.handleWordAccept(action.data.path, action.data.lobby);
      break;
    case ActionsList.word_denied:
      receiveCallBacks.handleWordDeny(action.data.path);
      break;
    case ActionsList.lose_life:
      receiveCallBacks.handleLoseLife(action.data.lobby, action.data.player_id)
      break;
    case ActionsList.start_turn:
      setTimeout(() => receiveCallBacks.handleNewTurn(action.data), 1200); //TEMP FIX
      break;
    case ActionsList.powerup_denied:
      ctx.lobby = action.data.lobby
      break;
    case ActionsList.you_died:
      receiveCallBacks.handleDeath(action.data.lobby, action.data.player_id)
      break;
    case ActionsList.you_win:
      receiveCallBacks.handleGameEnd(action.data.lobby)
      setScreen(ScreenState.END);
      break;
    default:
      break;
  }
};
