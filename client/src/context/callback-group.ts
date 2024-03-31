import { Action } from "../data/model";
import { ActionsList } from "../ws-client/model";

export type CallbackGroup = {
    example: null | ((ws: WebSocket) => void),
    setExample: (c: CallbackGroup, callback: (ws: WebSocket) => void) => void,
};

const setExample = (c: CallbackGroup, callback: (ws: WebSocket) => void) => {
    c.example = callback;
}

export const StateCallbacks: CallbackGroup = {
    example: null,
    setExample: setExample,
}