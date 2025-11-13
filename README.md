# Brainflip

Brainflip is a classic Concentration-style memory game with both Node.js (Express) and Python (Flask) backend implementations. Players flip cards on a 4×4 grid to find matching pairs, testing their memory and concentration skills. The game features a clean, responsive interface built with Tailwind CSS that works on desktop and mobile devices.

## Architecture

The project provides **two backend implementations** that share the same frontend and score persistence:

- **Node.js/Express** (recommended): Modern JavaScript runtime with Express framework serving static files and REST APIs
- **Python/Flask** (legacy): Alternative Python-based server implementation

Both servers:
- Serve the same frontend assets from the `public/` directory
- Use the same score storage file (`server/storage/scores.txt`)
- Provide identical REST API endpoints for score management
- Run on port 8000 by default

This dual-implementation approach makes the project ideal for demonstrating multi-language backend development and for developers comfortable with either ecosystem.

<img src="brainflip.png" width="500" height="500" />

## How to Play

1. **Start the Game**: Open the application in your browser after running the Flask server
2. **Flip Cards**: Click or tap on any face-down card to reveal its image
3. **Find Matches**: Click a second card to try to find a matching pair
4. **Score Points**: When you find a matching pair, both cards stay face-up and your score increases
5. **Win the Game**: Match all 8 pairs to complete the game
6. **Play Again**: Click "Play Again" to start a new game with shuffled cards

## Features

- **Responsive Design**: Works on desktop, tablet, and mobile devices
- **Smooth Animations**: Card flipping animations with CSS transitions
- **Accessibility**: Keyboard navigation support (Tab to navigate, Enter/Space to flip cards)
- **Debug Mode**: Add `?debug=true` to the URL for ordered card layout (useful for testing)
- **Sneak Peek Helper**: Optional feature to briefly reveal all cards (see configuration below)

## Sneak Peek Feature

The game includes an optional "Sneak Peek" helper that adds a button next to the score. When clicked, it briefly reveals all face-down cards for 0.8 seconds, then hides them again. This feature can help players who want a hint or are just starting to learn the game.

### Enabling Sneak Peek

To enable the Sneak Peek feature:

1. Open the file `public/index.html`
2. Find the line near the top of the `<script>` section:
   ```javascript
   const ENABLE_HELPERS = false;
   ```
3. Change `false` to `true`:
   ```javascript
   const ENABLE_HELPERS = true;
   ```
4. Save the file and refresh your browser

### Sneak Peek Behavior

- **Button Appearance**: A "Sneak Peek" button appears next to the score when enabled
- **Reveal Duration**: Cards are shown for 0.8 seconds (configurable via `PEEK_DURATION_MS`)
- **Cooldown Period**: After using sneak peek, the button is disabled for 2 seconds (configurable via `PEEK_COOLDOWN_MS`)
- **Game State**: Using sneak peek doesn't affect your score, matched pairs, or current turn
- **Accessibility**: The button supports keyboard navigation and screen readers
- **Smart Disabling**: The button is automatically disabled when:
  - All cards are already matched
  - A peek is currently in progress
  - The cooldown period is active
  - Cards are being compared for a match

### Customizing Sneak Peek Timing

You can adjust the timing by modifying these constants in `public/index.html`:

```javascript
const PEEK_DURATION_MS = 800;    // How long cards stay revealed (milliseconds)
const PEEK_COOLDOWN_MS = 2000;   // Cooldown between uses (milliseconds)
```

## Local Development

### Node.js server (default)

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Start the server**

   ```bash
   npm run dev      # reloads on change
   # or
   npm run start    # production-style server
   ```

3. **Play the game**

   Open <http://localhost:8000>. Express serves everything under `/public`, and the JSON APIs live under `/api/scores`.

### Legacy Flask server (optional)

If you still need the historical Python server, you can run it with the shared assets:

```bash
uv sync
source .venv/bin/activate   # or the Windows equivalent
python -m main.py
```

Both runtimes persist scores to the same file (`server/storage/scores.txt`), so you can bounce between them without losing data.

## Testing with Playwright

The project includes comprehensive end-to-end tests using Playwright, a modern browser automation framework. The tests validate the core card-matching gameplay mechanics across multiple browsers (Chromium, Firefox, and WebKit).

### Running Tests

```bash
# Run all tests
npx playwright test

# Run tests in UI mode (interactive)
npx playwright test --ui

# Run tests in a specific browser
npx playwright test --project=chromium

# View last test report
npx playwright show-report
```

### Test Coverage

The test suite (`tests/card-matching.spec.ts`) includes:

- **Mismatch Test**: Verifies that two different cards flip back to face-down after the comparison animation
- **Match Test**: Confirms that two identical cards stay face-up in the "matched" state once found
- **Dynamic Card Discovery**: Tests intelligently loop through random card positions to find mismatches and matches, rather than hard-coding positions

The tests use DOM inspection to identify card states based on CSS classes (`.flip`, `.matched`) and data attributes (`data-image`).

### Playwright Configuration

The project is configured to:
- Automatically start the Node.js server before running tests
- Run tests in parallel across multiple browsers
- Capture traces on first retry for debugging
- Generate HTML reports with screenshots and videos

See `playwright.config.ts` for full configuration details.

## Model Context Protocol (MCP) Integration

This project leverages three MCP servers to enhance the development workflow in VS Code with GitHub Copilot:

### Configured MCP Servers

1. **GitHub MCP** (`github`)
   - Provides access to GitHub repositories, issues, pull requests, and code search
   - Enables AI-assisted code reviews and repository exploration
   - URL: `https://api.githubcopilot.com/mcp/`

2. **Atlassian MCP** (`atlassian-mcp`)
   - Integrates with Atlassian services (Jira, Confluence, etc.)
   - Allows querying project management and documentation
   - URL: `https://mcp.atlassian.com/v1/sse`

3. **Playwright MCP** (`playwright`)
   - Enables browser automation and testing capabilities directly from the AI assistant
   - Used for generating and running end-to-end tests
   - Command: `npx @playwright/mcp@latest`

### Using MCP

The MCP configuration (`.vscode/mcp.json`) enables GitHub Copilot to:
- Inspect web pages and DOM elements using Playwright
- Generate test code based on actual browser interactions
- Access repository context and documentation
- Integrate with project management tools

This allows for AI-assisted test generation, browser debugging, and comprehensive project understanding without leaving the IDE.

## Principles of Participation

Everyone is invited and welcome to contribute: open issues, propose pull requests, share ideas, or help improve documentation. Participation is open to all, regardless of background or viewpoint.

This project follows the [FOSS Pluralism Manifesto](./FOSS_PLURALISM_MANIFESTO.md), which affirms respect for people, freedom to critique ideas, and space for diverse perspectives.


## License and Copyright

Copyright © 2025, Iwan van der Kleijn

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
