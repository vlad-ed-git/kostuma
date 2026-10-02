"use client"

import { useTranslations } from "next-intl"
import {
  createContext,
  use,
  useEffect,
  useEffectEvent,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react"

import {
  createBasketStore,
  type BasketEvent,
  type BasketStore,
} from "@/lib/basket/store"

type Basket = {
  store: BasketStore
  /** The signed-in account's uid, or `null` for a guest. */
  account: string | null
  /** Says `message` to screen readers, politely (spec §12, Live regions). */
  announce(message: string): void
}

/**
 * Outside its provider the basket is empty and does nothing, rather than
 * break the page (the layout provides it on every page: e2e checks).
 */
const inert: Basket = {
  store: createBasketStore({ known: [] }),
  account: null,
  announce: () => {},
}

const BasketContext = createContext<Basket>(inert)

type BasketProviderProps = {
  /** Every costume's slug: the basket drops any other. */
  costumes: readonly string[]
  /**
   * The signed-in account's uid (from the server's session), or `null`.
   * Signed in, the basket lives in the account and follows it live.
   */
  account: string | null
  children: ReactNode
}

/**
 * My Pumpkin Basket for every page (lib/basket/store.ts), and the one
 * polite live region its changes are announced in.
 */
export function BasketProvider({
  costumes,
  account,
  children,
}: BasketProviderProps) {
  const t = useTranslations("Basket")
  const [store] = useState(() => createBasketStore({ known: costumes }))
  // A new message replaces the old node, so the same words announce again.
  const [message, setMessage] = useState({ id: 0, text: "" })
  const announce = (text: string) =>
    setMessage(({ id }) => ({ id: id + 1, text }))

  useEffect(() => store.connect(account), [store, account])

  // The account refused a change, which is undone: the visitor hears why.
  const onRefused = useEffectEvent(() => announce(t("refused")))
  useEffect(
    () =>
      store.onEvent((event) => {
        if (event.type === "refused") onRefused()
      }),
    [store]
  )

  const basket: Basket = { store, account, announce }

  return (
    <BasketContext value={basket}>
      {children}
      {/* Not a `status` role: the cue mark's "Loading…" is the page's. */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {message.text && <p key={message.id}>{message.text}</p>}
      </div>
    </BasketContext>
  )
}

/** The basket and what can be done with it. */
export function useBasket() {
  const { store, account, announce } = use(BasketContext)
  const { ready, slugs, unreachable } = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getServerSnapshot
  )
  return {
    /** False on the server and until the basket has been read. */
    ready,
    slugs,
    /** Signed in, and the account can't be reached right now. */
    unreachable,
    account,
    has: (slug: string) => slugs.includes(slug),
    add: store.add,
    remove: store.remove,
    clear: store.clear,
    announce,
  }
}

/** Calls `listener` on each change the visitor makes in this tab. */
export function useBasketEvents(listener: (event: BasketEvent) => void) {
  const { store } = use(BasketContext)
  const onEvent = useEffectEvent(listener)
  useEffect(() => store.onEvent((event) => onEvent(event)), [store])
}
