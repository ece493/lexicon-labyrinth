import { Action, ScreenState, isAction } from "../data/model";
import { ActionsList } from "./model";

// https://socket.io/how-to/use-with-react
export const connect = (setScreen: (s: ScreenState) => void) => {
    // TO-DO: Remove undefined
    // const url = process.env.NODE_ENV === 'production' ? "undefined" : 'ws://localhost:8888/websocket';
    const ws = new WebSocket("ws://localhost:8888/websocket");
    ws.onmessage = (ev) => wsReceiveHandler(setScreen, ev);
    return ws;
}

export const wsReceiveHandler = (setScreen: (s: ScreenState) => void, ev: MessageEvent<any>) => {
    if (!isAction(ev.data)) return null;
    const action = ev.data as Action;
    switch (action.action) {
        case ActionsList.return_lobby_code:
            // Code for return_lobby_code
            setScreen(ScreenState.LOBBY);
            break;
        case ActionsList.lobby_does_not_exist:
            // Code for lobby_does_not_exist
            setScreen(ScreenState.GAME);
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
            // Code for word_accepted
            break;
        case ActionsList.word_denied:
            // Code for word_denied
            break;
        case ActionsList.end_turn:
            // Code for end_turn
            break;
        case ActionsList.start_turn:
            // Code for start_turn
            break;
        case ActionsList.powerup_denied:
            // Code for powerup_denied
            break;
        case ActionsList.powerup_activated:
            // Code for powerup_activated
            break;
        case ActionsList.you_died:
            // Code for you_died
            break;
        case ActionsList.you_win:
            // Code for you_win
            setScreen(ScreenState.END);
            break;
        default:
            break;
    }
}