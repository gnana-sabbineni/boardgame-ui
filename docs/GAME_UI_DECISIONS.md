# Game screens: design decisions (branch `feat/game-screens`)

Each decision lists the options, why this one was picked, and when to change it.
The server rules live in `boardwalk-api/docs/GAME_API.md` and `docs/DESIGN_DECISIONS.md`.

## 1. The client never re-implements rules
**Choice:** buttons are shown or hidden from `availableActions`; every action is a `POST`, and a rule
violation (HTTP 400) is shown as a message.
**Why:** the server is authoritative. If the UI also decided "can this player buy?", the two copies
would drift and a cheater could simply edit the UI. Example: the Buy button is enabled when
`cash >= price` only to avoid a pointless request; the server still checks.
**Options not taken:** compute legality in the client (fast, but duplicated and untrustworthy).
**Change when:** you want instant, optimistic feedback (then add client checks *in addition*).

## 2. "Re-fetch on `GameUpdated`", not "apply a patch"
**Choice:** SignalR sends `GameUpdated` with no payload; the client calls `GET /games/current`.
**Why:** one code path for the full state. A missed message cannot corrupt local state because the
next fetch replaces everything. `onreconnected` re-fetches too, covering messages missed while offline.
**Trade-off:** one extra HTTP request per change. Fine for 2-6 players.
**Change when:** state gets large or updates are very frequent; send diffs keyed by event sequence
(the event log already has `sequence`, so `GET /games/{id}/events?afterSequence=` is the building block).
**Guard:** `requestRef` ignores a slow response that arrives after a newer one (out-of-order replies).

## 2b. Popups come from the event log
New events (`sequence` greater than the last one seen) in `recentEvents` become the 4-second popups
(design screen 6). The first load records the latest sequence without popping, so joining mid-game
does not replay history. Fortune cards use `CardDrawn` (only the drawer sees the modal).

## 3. Turn timer uses the server's clock
**Choice:** `remaining = turnDeadlineAt - (now + (serverTime - clientNowAtFetch))`.
**Why:** a player's laptop clock can be minutes off. Using the difference captured at fetch time
cancels that. The server still enforces the deadline (auto-play); the ring is only a display.
The ring is sized against 60 s (`TURN_SECONDS`), a display constant, not a rule.

## 4. One hub connection
The game reuses the lobby hub (`/hubs/lobby`) already started by `LobbyProvider`; `useGame` only adds
and removes its own handlers. A second connection would double the sockets per player for no gain.

## 5. Static board fetched once
`GET /games/board` never changes, so it is loaded once and kept; only `/games/current` is live.

## 6. Colours and pieces
- The server's eight colour-group keys are mapped to the design's eight swatches by board order
  (`lib/board.ts`). Names do not match the design art (e.g. `rose` is blue); swap the table if you
  prefer name-faithful colours.
- Pieces come from the seat number (`lib/pieces.ts`). The design's "Choose your piece" screen needs an API
  endpoint that does not exist yet, so it is not built.
- Icons: the design uses Phosphor; the app already uses lucide-react, so equivalents are used
  instead of adding a second icon library.

## 7. Differences from the design
- Properties panel shows "Houses / hotels" instead of "Net worth": the live endpoint does not return
  net worth, and computing it client-side would be a second copy of a server rule.
- Tile names and card names come from the server (`Fortune Card`, `Departure Gate`), not the
  design's sample text (`Tide card`, `Cast Off`).
- Trade proposal uses clickable property chips for selection; cash is a number field.
- No auctions, no seat reclaim, no idempotency keys (see the API handoff's known gaps).

## 8. Known risks / not yet verified
- Not run against the live API yet: needs `npm install` then a full bot game (see handoff).
- Double clicks: every action disables buttons while `busy`, but the server has no idempotency keys yet.
