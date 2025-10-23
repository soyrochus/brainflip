### BrainFlip – Sneak Peek Feature Request

**Goal:**
Add an optional “Sneak Peek” helper to the BrainFlip Memory Game (HTML + JS only).
When enabled, a button appears next to the “Score” label; clicking it reveals all cards briefly, then hides them again.

**Constraints:**

* Controlled by a single flag in JS:

  ```js
  const ENABLE_HELPERS = false;
  ```

  When `false`, nothing changes; when `true`, the helper button and logic appear.
* Client-side only.
* Must not affect score, matched state, or current turn.
* Disable the button while peeking and during cooldown.
* Keep style consistent with the UI in the provided screenshot.

**Behavior:**

1. Add “Sneak Peek” button near “Score” (visible only if `ENABLE_HELPERS`).
2. On click → reveal all face-down cards for ~0.8 s → hide again.
3. Prevent interaction during peek.
4. Matched cards stay visible.
5. Include basic keyboard and accessibility support.
6. No layout shift, no console errors.

**Timing constants:**

```js
const PEEK_DURATION_MS = 800;
const PEEK_COOLDOWN_MS = 2000;
```

**Deliverable:**
Modify the HTML + JS files accordingly, keeping all other functionality unchanged.
