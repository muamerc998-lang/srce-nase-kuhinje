'use client'
import { useSyncExternalStore } from 'react'
import type { Store } from './store'

/** React pretplata na lokalno spremište. Na serveru i pri hidraciji vraća početno stanje. */
export function useStore<T>(store: Store<T>): T {
  return useSyncExternalStore(
    (cb) => store.subscribe(cb),
    () => store.get(),
    () => store.getServer(),
  )
}

/** true tek nakon hidracije (za sadržaj koji zavisi od lokalnih podataka). */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  )
}
