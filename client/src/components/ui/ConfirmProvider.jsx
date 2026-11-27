import { createContext, useCallback, useContext, useState } from "react";
import ConfirmModal from "./ConfirmModal";

const Ctx = createContext(null);

// const confirm = useConfirm();
// if (await confirm({ title: "Delete?", message: "...", confirmText: "Delete", variant: "danger" })) { ... }
export const useConfirm = () => useContext(Ctx);

export function ConfirmProvider({ children }) {
  const [state, setState] = useState(null);
  const confirm = useCallback((options) => new Promise((resolve) => setState({ ...options, resolve })), []);
  const close = (answer) => {
    state.resolve(answer);
    setState(null);
  };
  return (
    <Ctx.Provider value={confirm}>
      {children}
      {state && <ConfirmModal {...state} onClose={close} />}
    </Ctx.Provider>
  );
}
