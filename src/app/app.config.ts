import type { ApplicationConfig } from "../kit/shared/config";
import { operation } from "../kit/shared/transport";
import { handlers } from "./host/handlers";
import { validators } from "./shared/validators";

/**
 * Brainflip as a Crumb application. The window embeds `ui/index.html`; the page
 * reaches the host only through the two declared score operations.
 *
 * The CSP here uses `'unsafe-inline'` because the release build inlines the
 * stylesheet and script into the document. `ui/index.html` keeps the matching
 * `'self'` form for `bun run dev`; change one and you must change the other.
 */
export const brainflip: ApplicationConfig = {
  name: "Brainflip",

  window: {
    title: "Brainflip",
    width: 900,
    height: 780,
    minWidth: 480,
    minHeight: 620,
    resizable: true,
  },

  csp: "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; img-src data:; connect-src 'none'; object-src 'none'; frame-src 'none'; form-action 'none'; base-uri 'none'",

  entries: {
    uiScript: "src/app/ui/app.ts",
    uiDocument: "src/app/ui/index.html",
    uiStyles: "src/app/ui/styles.css",
  },

  operations: {
    loadScores: operation(validators.loadScores, handlers.loadScores),
    saveScore: operation(validators.saveScore, handlers.saveScore),
  },
};
