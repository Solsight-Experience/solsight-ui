# Wallet Layer Refactor Plan

## Goal

Collapse the four parallel wallet implementations into a single layered abstraction with
explicit boundaries between:

1. **Extension wallet** — a live browser wallet (Phantom / Solflare) with a connect/disconnect
   lifecycle and signing **capabilities**.
2. **Onchain / linked wallet** — a persisted address (balance, `is_default`, `is_connected`)
   that the backend owns and that has been ownership-verified for the signed-in user,
   independent of whether an extension is currently live.
3. **Auth** — proving ownership of an address via nonce message signing.

Downstream consumers keep the exact surface they use today; only the internals change.

---

## Current state (why it's fragmented)

Four implementations of "connect a wallet + get its public key", none sharing an abstraction:

| #   | File                                        | Built on                                                            | Role                                                                     |
| --- | ------------------------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| 1   | `features/wallets/hooks/useWallet.ts`       | adapter **+** raw `window.solana`                                   | connect, link-to-account, `signTransaction`, balance                     |
| 2   | `features/portfolio/hooks/useWalletAuth.ts` | adapter (Solflare) **+** raw provider (Phantom) **+** MetaMask Snap | connect **+ auth nonce signing**                                         |
| 3   | `components/auth/social-auth-buttons.tsx`   | duplicate of #2's Phantom/Solflare branches                         | login-with-wallet                                                        |
| 4   | `lib/wallet.ts`                             | own `window.solana` typing                                          | **dead** — only `useChat` reads `phantomWallet.publicKey`, always `null` |

Symptoms:

- Provider detection duplicated 3× (`useWallet.ts:20`, `useWalletAuth.ts:38`, `lib/wallet.ts:5`), each subtly different.
- `waitForWalletSelection` copy-pasted verbatim (`useWallet.ts:80`, `useWalletAuth.ts:77`), and a third inline copy at `social-auth-buttons.tsx:207`.
- Per-wallet logic as hardcoded string branches: `useWalletAuth.ts:232-360` (130-line if/else) and the copies in `social-auth-buttons.tsx:151-244`.
- Capabilities probed via `as unknown as { signMessage? }` casts (`useWalletAuth.ts:288`, `social-auth-buttons.tsx:220`), never typed.
- No boundary between extension wallet and onchain wallet: `useWallet` returns `publicKey` + `signTransaction` as one flat bag; `useActionableWallet.ts:23-29` manually joins the live pubkey against the persisted `useWallets()` list.
- Network validation leaked into staking (`build-sign-send.ts:5` imports `getNativeSolanaProvider`).

### The two-hook layering (`useWallet` vs `useActionableWallet`)

These are the _right_ two layers, but the names hide the intent:

- `useWallet` = **connection layer**: "is an extension connected, what's its pubkey, can it sign".
  Knows nothing about the signed-in user account.
- `useActionableWallet` = **authorization layer**: wraps `useWallet` and additionally checks the
  live pubkey is **linked/ownership-verified** to the signed-in user (cross-references the
  persisted `useWallets()` list at `useActionableWallet.ts:23-29`). Exposes `actionablePublicKey`
  (pubkey only if linked) and `ensureWalletReadyForUserAction()` (triggers the nonce-signing auth
  flow when not yet linked).

A wallet can be `connected: true` yet `isReadyForUserAction: false` — connected in the browser but
not proven to belong to the account. The refactor **keeps this split** (it maps onto layers 1/2/3
below) but makes it legible via naming (see Phase 3).

### Key insight that shrinks the work

`social-auth-buttons.tsx:220` and `useWalletAuth.ts:288` prove the **`@solana/wallet-adapter`
adapter already exposes `signMessage` and `signTransaction`** for both Phantom and Solflare. The
raw `window.solana` / `window.phantom.solana` paths are redundant — everything can run through the
adapter layer. Dropping MetaMask (per decision) removes the only case that genuinely needed a
non-adapter path.

---

## Target architecture

```
providers/wallet-provider.tsx              (unchanged — WalletProvider stays the source of truth)
        │
features/wallets/
  lib/
    wallet-registry.ts        SUPPORTED_WALLETS: name, icon, installUrl, walletIcon(DTO enum)
    extension-wallet.ts       adapter → ExtensionWallet { name, publicKey, capabilities, sign* }
  hooks/
    useConnectedWallet.ts     LAYER 1 (was useWallet core): live adapter state + connect/disconnect/select. No backend account concept.
    useWalletAuth.ts          LAYER 3: connect → signSolanaNonce → /auth/solana/{verify,login}. Registry-driven, no per-wallet if/else.
    useOnchainWallets.ts      LAYER 2: re-export of portfolio wallet queries (persisted addresses)
    useLinkedWallet.ts        (was useActionableWallet): composes 1+2+3, "authorized to act for user". Surface preserved.
    useWallet.ts              FACADE alias kept for existing imports (re-exports useConnectedWallet + balance/user-wallet queries), return shape unchanged.
  types/wallet.types.ts       ExtensionWallet, WalletCapabilities, SupportedWalletName
```

Naming note: `useActionableWallet` is renamed to `useLinkedWallet` with a back-compat re-export so
the 6 consumers can migrate in a follow-up without blocking this refactor. `useWallet` stays as the
public name for the connection layer (its 8 imports keep working).

### The capability model (the missing concept)

```ts
// features/wallets/types/wallet.types.ts
export type SupportedWalletName = "Phantom" | "Solflare";

export interface WalletCapabilities {
    canSignTransaction: boolean;
    canSignMessage: boolean;
}

export interface ExtensionWallet {
    name: string;
    publicKey: string | null; // base58, onchain identity of the live extension
    connected: boolean;
    capabilities: WalletCapabilities;
    signTransaction: (<T>(tx: T) => Promise<T>) | null;
    signMessage: ((msg: Uint8Array) => Promise<Uint8Array>) | null;
}
```

`capabilities` is computed **once** from the adapter (method presence) in `extension-wallet.ts`,
replacing every scattered `as unknown as` probe.

---

## Phasing

Each phase compiles and ships independently. Order matters: build the new layer, migrate
consumers, delete the old.

### Phase 0 — Fix the live bug (standalone, do first)

`useChat.ts:179` sends `phantomWallet.publicKey` which is always `null` (nothing calls
`phantomWallet.connect()`), so AI chat never gets a wallet address.

- Change `useChat` to read the connected pubkey from `useWallet()` (facade) — or, to unblock
  immediately, from `useSolanaWallet().publicKey?.toBase58()`.
- Independent of the rest; land it first.

**Verify:** connect wallet, open chat, confirm `walletAddress` is populated in the socket payload.

### Phase 1 — Introduce the abstraction (additive, no consumer changes)

1. `types/wallet.types.ts` — the types above.
2. `lib/wallet-registry.ts` — `SUPPORTED_WALLETS`: `{ name, walletIcon, installUrl }`. Folds in
   `PREFERRED_WALLET_NAMES` (`useWallet.ts:40`) and `normalizeWalletIcon` (`useWallet.ts:33`).
3. `lib/extension-wallet.ts` — pure functions:
    - `toExtensionWallet(adapterWallet): ExtensionWallet` (computes capabilities + binds sign fns)
    - `waitForWalletSelection(...)` (single home for the copy-pasted helper)
    - `getWalletNetwork(adapterWallet)` (for the staking network guard)
4. `hooks/useConnectedWallet.ts` — wraps `useSolanaWallet`, returns the current `ExtensionWallet`
   plus `select`, `connect`, `disconnect`. The **only** place that touches the adapter.

No existing file changes yet. New code is unreferenced → zero risk.

### Phase 2 — Rebuild `useWalletAuth` on the abstraction

- Replace the Phantom/Solflare/MetaMask if/else (`useWalletAuth.ts:232-360`) with one
  registry-driven flow: select wallet → connect via `useConnectedWallet` → guard
  `capabilities.canSignMessage` → `signSolanaNonce(pubkey, extWallet.signMessage)` →
  `POST /auth/solana/verify`.
- Drop the raw `window.solana` provider, the eager-connect effect, and the manual
  `accountChanged` listeners (the adapter already emits these).
- **MetaMask:** removed. Design leaves a clean seam (same `signMessage` interface) if it returns.
- Keep `handleWalletConnect(walletName, userId?)` signature identical so `WalletButtons.tsx`,
  `MockConnectWalletDialog.tsx`, and `useLinkedWallet` don't change.

**Verify:** connect + link Phantom and Solflare from the portfolio dialog; confirm
`/auth/solana/verify` still succeeds and portfolio refetches.

### Phase 3 — Rebuild connection facade + linked-wallet layer + collapse `social-auth-buttons`

- `useConnectedWallet` becomes the real connection layer; `useWallet.ts` re-exports it (+
  `connectWallet`/`disconnectWallet` mutations via WalletService + `useWalletBalance`/
  `useUserWallets`). **Return shape unchanged** (verified against the 8 consumers: they read
  `publicKey`, `signTransaction`, `connected`, `isConnecting`, `connectWallet`,
  `isWalletLinkedToUser`, `actionablePublicKey`, `ensureWalletReadyForUserAction`).
- Rename `useActionableWallet` → `useLinkedWallet`, built on the facade + `useOnchainWallets` +
  `useWalletAuth`. Keep `useActionableWallet` as a re-export alias so the 6 consumers don't change
  in this PR.
- Replace `social-auth-buttons.tsx` `handlePhantomLogin`/`handleSolflareLogin` (`:151-244`) with a
  shared `useWalletLogin` (login variant hitting `loginWithSolanaApi` / `/auth/solana/login`).
  Reuses registry + capability guard. Deletes the third `waitForWalletSelection` copy and inline
  `PhantomWindow` typing.
- `build-sign-send.ts:41` — replace `getNativeSolanaProvider()?.network` with `getWalletNetwork(...)`
  from `extension-wallet.ts`. Removes the cross-feature import of a hooks-file internal.

**Verify:** login-with-wallet from the login page (both wallets); run a staking build-sign-send and
confirm the network-mismatch guard still fires on the wrong cluster.

### Phase 4 — Delete dead code

- Remove `lib/wallet.ts` (`PhantomWalletAdapter`, `phantomWallet`, `isPhantomAvailable`) once
  Phase 0 removed its only consumer.
- Remove `getNativeSolanaProvider` from `useWallet.ts` once Phase 3 removed its last caller.
- Remove now-unused `NativeSolanaProvider`, `PhantomProvider`, `EthereumProvider`, `getProvider`,
  `getMetaMaskProvider`.

**Verify:** `grep -rn "lib/wallet\|getNativeSolanaProvider\|phantomWallet\|getMetaMaskProvider"`
returns nothing outside deleted files; typecheck + build clean.

---

## Consumer impact (surface preserved)

| Consumer                                                                                                            | Uses                                       | Change                                                             |
| ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ | ------------------------------------------------------------------ |
| `TradingPanel`, `QuickBuyReviewModal`, `TransferForm`, `StakingPanel`, `PurchaseCreditsModal`, `StakeHistoryClient` | `useActionableWallet`                      | none (alias preserved; rename to `useLinkedWallet` in a follow-up) |
| `ActiveLimitOrders`                                                                                                 | `useWallet`                                | none                                                               |
| `WalletButtons`, `MockConnectWalletDialog`                                                                          | `useWalletAuth().handleWalletConnect`      | none (signature preserved)                                         |
| `social-auth-buttons`                                                                                               | raw adapter                                | rewritten onto shared `useWalletLogin`                             |
| `useChat`                                                                                                           | `phantomWallet.publicKey`                  | Phase 0 bug fix                                                    |
| `build-sign-send`                                                                                                   | `getNativeSolanaProvider`                  | swap to `getWalletNetwork`                                         |
| `QuickBuyReviewModal.test`                                                                                          | mocks `@/features/wallets/hooks/useWallet` | update mock to facade shape                                        |

---

## Decisions folded in

- **MetaMask (Solflare Snap): dropped.** Removes the largest source of special-casing
  (`useWalletAuth.ts:186-230, 312-356`, `SOLANA_SNAP_ID`). Clean seam left if it returns.
- Adapter is the single source of truth; raw `window.solana` paths removed.
- Two-hook split (connection vs authorization) kept, but renamed for legibility.
- No new state library — extension state stays in the adapter, onchain state in React Query,
  cluster in the existing zustand store.

## Risks

- `autoConnect` + adapter `accountChanged` timing vs. the removed manual eager-connect — verify
  reconnect-on-account-switch still works (Phase 2 verify).
- Solflare `signMessage` currently reached via cast; confirm the adapter type exposes it
  (`MessageSignerWalletAdapter`) so the capability flag is accurate.
- Provider remounts on cluster change (`wallet-provider.tsx:23` `key={cluster}`) — new hooks hold
  no state outside the adapter, so they tolerate the remount.

## Out of scope

wallet-tracker (watchlist / watched portfolio / alerts) — _arbitrary observed addresses_, a
separate domain from the user's own connected wallets. Not touched.
