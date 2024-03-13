import { Action, isAction } from "../data/model";
import { ACTIONS_LIST } from "./model";

// https://socket.io/how-to/use-with-react
export const connect = () => {
    // TO-DO: Remove undefined
    // const url = process.env.NODE_ENV === 'production' ? "undefined" : 'ws://localhost:8888/websocket';
    return new WebSocket("ws://localhost:8888/websocket");
}

export const WebSocketReceiveHandler = (ev: MessageEvent<any>) => {
    
    if (!isAction(ev.data)) return null;
    const action = ev.data as Action;
    switch (action.action) {
        case ACTIONS_LIST.return_lobby_code:
            // Code for return_lobby_code
            break;
        case ACTIONS_LIST.lobby_does_not_exist:
            // Code for lobby_does_not_exist
            break;
        case ACTIONS_LIST.successfully_joined_lobby:
            // Code for successfully_joined_lobby
            break;
        case ACTIONS_LIST.success:
            // Code for success
            break;
        case ACTIONS_LIST.error:
            // Code for error
            break;
        case ACTIONS_LIST.start_game:
            // Code for start_game
            break;
        case ACTIONS_LIST.player_joined:
            // Code for player_joined
            break;
        case ACTIONS_LIST.player_left:
            // Code for player_left
            break;
        case ACTIONS_LIST.update_lobby_settings:
            // Code for update_lobby_settings
            break;
        case ACTIONS_LIST.word_accepted:
            // Code for word_accepted
            break;
        case ACTIONS_LIST.word_denied:
            // Code for word_denied
            break;
        case ACTIONS_LIST.end_turn:
            // Code for end_turn
            break;
        case ACTIONS_LIST.start_turn:
            // Code for start_turn
            break;
        case ACTIONS_LIST.powerup_denied:
            // Code for powerup_denied
            break;
        case ACTIONS_LIST.powerup_activated:
            // Code for powerup_activated
            break;
        case ACTIONS_LIST.you_died:
            // Code for you_died
            break;
        case ACTIONS_LIST.you_win:
            // Code for you_win
            break;
        default:
            break;
    }
}