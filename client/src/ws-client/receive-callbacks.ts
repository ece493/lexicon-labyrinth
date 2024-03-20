export type ReceiveCallbacks = {
  handleWordAccept: () => void;
  handleWordDeny: (path: number[][]) => void;
};

export const ReceiveCallbacksDefault = {
  handleWordAccept: () => console.log("Ran default word accept handler"),
  handleWordDeny: (path: number[][]) =>
    console.log("Ran default word deny handler"),
};
