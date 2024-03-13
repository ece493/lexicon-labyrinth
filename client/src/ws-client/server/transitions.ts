import { Action } from "../../data/model";
import { ActionsList } from "../model";

export type ServerTransitions = {
    initialize: (ws: WebSocket) => void,
    joinLobby: (ws: WebSocket, code: string) => void,
    changeParam: (ws: WebSocket, param: string, value: string) => void,
    readyLobby: (ws: WebSocket) => void,
    pickWord: (ws: WebSocket) => void,
    pickPowerup: (ws: WebSocket) => void,
    leaveGame: (ws: WebSocket) => void,
};

const initialize = (ws: WebSocket) => {
    const msg: Action = {
        action: ActionsList.initialize,
        player_id: 0,
        data: []
    };
    ws.send(JSON.stringify(msg));
}

const joinLobby = (ws: WebSocket, code: string) => {
    const msg: Action = {
        action: ActionsList.join_lobby,
        player_id: 0,
        data: code
    };
    ws.send(JSON.stringify(msg));
}

const changeParam = (ws: WebSocket, param: string, value: string) => {
    const msg: Action = {
        action: ActionsList.change_param,
        player_id: 0,
        data: [param, value]
    };
    ws.send(JSON.stringify(msg));
}

const readyLobby = (ws: WebSocket) => {
    const msg: Action = {
        action: ActionsList.ready_lobby,
        player_id: 0,
        data: []
    };
    ws.send(JSON.stringify(msg));
}

const pickWord = (ws: WebSocket, path: [number, number][]) => {
    const msg: Action = {
        action: ActionsList.pick_word,
        player_id: 0,
        data: path
    };
    ws.send(JSON.stringify(msg));
}