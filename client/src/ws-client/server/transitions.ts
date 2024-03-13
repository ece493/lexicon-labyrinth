export type ServerTransitions = {
    initialize: (ws: WebSocket) => void,
    joinLobby: (ws: WebSocket, code: string) => void,
    changeParam: (ws: WebSocket, code: string, param: string, value: string) => void,
    readyLobby: (ws: WebSocket, code: string) => void,
    pickWord: (ws: WebSocket, code: string) => void,
    pickPowerup: (ws: WebSocket, code: string) => void,
    leaveGame: (ws: WebSocket, code: string) => void,
};
