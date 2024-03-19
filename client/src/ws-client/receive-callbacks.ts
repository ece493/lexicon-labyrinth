export type ReceiveCallbacks = {
  handleWordAccept: () => void;
  handleWordDeny: () => void;
};

export const ReceiveCallbacksDefault = {
  handleWordAccept: () => console.log("Ran default word accept handler"),
  handleWordDeny: () => console.log("Ran default word deny handler"),
};
