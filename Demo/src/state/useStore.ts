import { useSyncExternalStore } from "react";
import { getStore, subscribe, type Store } from "./store";

export function useStore(): Store {
  return useSyncExternalStore(subscribe, getStore, getStore);
}
