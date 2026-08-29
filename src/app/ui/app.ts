import { invoke } from "../../kit/ui/bridge";
import type { AppOperations } from "../shared/contracts";
import { backImage, cardImages } from "./assets";

/** Toggle the optional "Sneak Peek" helper without touching the rest of the UI. */
const ENABLE_HELPERS = true;
const PEEK_DURATION_MS = 800;
const PEEK_COOLDOWN_MS = 2000;

type TimeoutId = ReturnType<typeof setTimeout>;

const grid = document.getElementById("grid") as HTMLDivElement;
const scoreEl = document.getElementById("score") as HTMLSpanElement;
const scoreWrapper = document.getElementById("score-wrapper") as HTMLDivElement;
const winEl = document.getElementById("win") as HTMLDivElement;
const playBtn = document.getElementById("play-again") as HTMLButtonElement;
const topScoresContainer = document.getElementById("top-scores-container") as HTMLElement;
const topScoresList = document.getElementById("top-scores-list") as HTMLOListElement;

const fullCardImages = cardImages.slice(0, 8);

let first: HTMLElement | null = null;
let second: HTMLElement | null = null;
let lock = false;
let score = 0;
let interactionsFrozen = false;

let peekButton: HTMLButtonElement | null = null;
let peekRevealTimeoutId: TimeoutId | null = null;
let peekCooldownTimeoutId: TimeoutId | null = null;

// Scoring state
let gameStartTime: number | null = null;
let lastMatchTime: number | null = null;
let consecutiveMatches = 0;
let totalAttempts = 0;

const debugMode = new URLSearchParams(window.location.search).get("debug") === "true";

function shuffle<T>(arr: T[]): void {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const a = arr[i]!;
    arr[i] = arr[j]!;
    arr[j] = a;
  }
}

function getDeck(): string[] {
  if (debugMode) {
    const ordered: string[] = [];
    for (const img of fullCardImages) ordered.push(img, img);
    return ordered;
  }
  const deck = [...fullCardImages, ...fullCardImages];
  shuffle(deck);
  return deck;
}

function createCard(src: string): HTMLDivElement {
  const card = document.createElement("div");
  card.className = "card";
  card.innerHTML = `<div class="card-inner">
      <img src="${src}" alt="card front" class="card-face card-front"/>
      <img src="${backImage}" alt="card back" class="card-face card-back"/>
    </div>`;
  card.dataset.image = src;
  card.tabIndex = 0;
  card.addEventListener("click", () => onCardClick(card));
  card.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onCardClick(card);
    }
  });
  return card;
}

function setupHelpers(): void {
  if (!ENABLE_HELPERS || peekButton) return;
  peekButton = document.createElement("button");
  peekButton.id = "sneak-peek";
  peekButton.type = "button";
  peekButton.className = "button button-peek";
  peekButton.textContent = "Sneak Peek";
  peekButton.title = "Reveal all cards briefly";
  peekButton.setAttribute("aria-controls", "grid");
  peekButton.addEventListener("click", onSneakPeek);
  scoreWrapper.appendChild(peekButton);
  updatePeekButtonState();
}

function setupNewGameButton(): void {
  const newGameButton = document.createElement("button");
  newGameButton.id = "new-game";
  newGameButton.type = "button";
  newGameButton.className = "button button-new-game";
  newGameButton.textContent = "New Game";
  newGameButton.title = "Start a new game";
  newGameButton.addEventListener("click", () => init());
  scoreWrapper.appendChild(newGameButton);
}

function clearPeekTimers(): void {
  if (peekRevealTimeoutId !== null) {
    clearTimeout(peekRevealTimeoutId);
    peekRevealTimeoutId = null;
  }
  if (peekCooldownTimeoutId !== null) {
    clearTimeout(peekCooldownTimeoutId);
    peekCooldownTimeoutId = null;
  }
  for (const card of grid.querySelectorAll<HTMLElement>(".card.peek-preview")) {
    card.classList.remove("peek-preview", "flip");
  }
  interactionsFrozen = false;
}

function getFaceDownCards(): HTMLElement[] {
  return Array.from(grid.querySelectorAll<HTMLElement>(".card")).filter(
    (card) => !card.classList.contains("matched") && !card.classList.contains("flip"),
  );
}

function startPeekCooldown(): void {
  if (!peekButton) return;
  if (peekCooldownTimeoutId !== null) clearTimeout(peekCooldownTimeoutId);
  peekCooldownTimeoutId = setTimeout(() => {
    peekCooldownTimeoutId = null;
    updatePeekButtonState();
  }, PEEK_COOLDOWN_MS);
  updatePeekButtonState();
}

function updatePeekButtonState(): void {
  if (!peekButton) return;
  const hasFaceDownCards = getFaceDownCards().length > 0;
  const peekInProgress = interactionsFrozen || peekRevealTimeoutId !== null;
  const cooldownActive = peekCooldownTimeoutId !== null;
  const shouldDisable = !hasFaceDownCards || peekInProgress || cooldownActive || lock;
  peekButton.disabled = shouldDisable;
  peekButton.setAttribute("aria-disabled", shouldDisable ? "true" : "false");
}

function onSneakPeek(): void {
  if (!peekButton || peekButton.disabled) return;
  const cardsToRehide = getFaceDownCards();
  if (cardsToRehide.length === 0) {
    updatePeekButtonState();
    return;
  }
  const restoreFocus = document.activeElement === peekButton;
  interactionsFrozen = true;
  updatePeekButtonState();
  for (const card of cardsToRehide) card.classList.add("flip", "peek-preview");
  peekRevealTimeoutId = setTimeout(() => {
    for (const card of cardsToRehide) card.classList.remove("flip", "peek-preview");
    interactionsFrozen = false;
    peekRevealTimeoutId = null;
    startPeekCooldown();
    if (restoreFocus && peekButton) peekButton.focus({ preventScroll: true });
  }, PEEK_DURATION_MS);
}

function calculateMatchScore(timeSinceLastMatch: number): number {
  let matchScore = 100;
  if (timeSinceLastMatch < 2000) matchScore += 50;
  else if (timeSinceLastMatch < 4000) matchScore += 25;
  else if (timeSinceLastMatch > 10000) matchScore -= 20;

  if (consecutiveMatches > 0) matchScore += consecutiveMatches * 10;

  const efficiency = 8 / totalAttempts;
  if (efficiency > 0.8) matchScore += 30;
  else if (efficiency > 0.6) matchScore += 15;

  return Math.floor(matchScore);
}

function calculateTimeBonus(totalTime: number): number {
  if (totalTime < 30000) return 200;
  if (totalTime < 60000) return 100;
  if (totalTime < 120000) return 50;
  if (totalTime < 180000) return 25;
  return 0;
}

function removeFlopWhenDone(card: HTMLElement): void {
  const inner = card.querySelector(".card-inner");
  if (!inner) return;
  const onEnd = (): void => {
    card.classList.remove("flop");
    inner.removeEventListener("animationend", onEnd);
  };
  inner.addEventListener("animationend", onEnd);
}

function applyBackflip(card: HTMLElement): Promise<void> {
  return new Promise((resolve) => {
    card.classList.add("backflip");
    const inner = card.querySelector(".card-inner");
    if (!inner) {
      card.classList.remove("flip", "backflip");
      resolve();
      return;
    }
    const onEnd = (): void => {
      card.classList.remove("flip", "backflip");
      inner.removeEventListener("animationend", onEnd);
      resolve();
    };
    inner.addEventListener("animationend", onEnd);
  });
}

function onCardClick(card: HTMLElement): void {
  if (lock || interactionsFrozen || card.classList.contains("flip") || card.classList.contains("matched")) return;

  if (gameStartTime === null) {
    gameStartTime = Date.now();
    lastMatchTime = gameStartTime;
  }

  card.classList.add("flip");
  if (!first) {
    first = card;
    return;
  }
  if (card === first) return;

  second = card;
  lock = true;
  totalAttempts++;
  updatePeekButtonState();

  const a = first;
  const b = second;

  if (a.dataset.image === b.dataset.image) {
    setTimeout(() => {
      a.classList.add("matched", "flop");
      b.classList.add("matched", "flop");
      removeFlopWhenDone(a);
      removeFlopWhenDone(b);

      const now = Date.now();
      const matchScore = calculateMatchScore(now - (lastMatchTime ?? now));
      score += matchScore;
      consecutiveMatches++;
      lastMatchTime = now;

      scoreEl.textContent = String(score);
      reset();
      if (grid.querySelectorAll(".card.matched").length === 16) showWin();
    }, 300);
  } else {
    setTimeout(() => {
      void Promise.all([applyBackflip(a), applyBackflip(b)]).then(() => {
        const penalty = Math.max(5, Math.floor(score * 0.05));
        score = Math.max(0, score - penalty);
        consecutiveMatches = 0;
        scoreEl.textContent = String(score);
        reset();
      });
    }, 1000);
  }
}

function reset(): void {
  first = null;
  second = null;
  lock = false;
  updatePeekButtonState();
}

function showWin(): void {
  winEl.hidden = false;
  updatePeekButtonState();

  const totalGameTime = Date.now() - (gameStartTime ?? Date.now());
  score += calculateTimeBonus(totalGameTime);
  scoreEl.textContent = String(score);

  const winMessage = winEl.querySelector(".win-message");
  if (winMessage) {
    const minutes = Math.floor(totalGameTime / 60000);
    const seconds = Math.floor((totalGameTime % 60000) / 1000);
    const accuracy = Math.round((8 / totalAttempts) * 100);
    winMessage.textContent = "🎉 You win! 🎉";
    const detail = document.createElement("span");
    detail.className = "win-detail";
    detail.textContent = `Time: ${minutes}:${seconds.toString().padStart(2, "0")} | Accuracy: ${accuracy}% | Final Score: ${score}`;
    winMessage.appendChild(detail);
  }

  void submitScore(score);
}

async function submitScore(finalScore: number): Promise<void> {
  try {
    const { scores } = await invoke<AppOperations, "saveScore">("saveScore", { score: finalScore });
    displayTopScores(scores);
  } catch (error) {
    console.error("Failed to submit score:", error);
  }
}

async function loadTopScores(): Promise<void> {
  try {
    const { scores } = await invoke<AppOperations, "loadScores">("loadScores", {});
    displayTopScores(scores);
  } catch (error) {
    console.error("Failed to load top scores:", error);
  }
}

function displayTopScores(scores: number[]): void {
  if (scores.length === 0) {
    topScoresList.innerHTML = '<li class="top-scores-empty">No scores yet</li>';
    return;
  }
  topScoresList.innerHTML = scores
    .map(
      (value, index) =>
        `<li><span>${index + 1}.</span><span>${value}</span></li>`,
    )
    .join("");
  topScoresContainer.hidden = false;
}

function init(): void {
  clearPeekTimers();
  const deck = getDeck();
  grid.innerHTML = "";
  score = 0;
  scoreEl.textContent = "0";
  gameStartTime = null;
  lastMatchTime = null;
  consecutiveMatches = 0;
  totalAttempts = 0;
  winEl.hidden = true;
  for (const src of deck) grid.appendChild(createCard(src));
  updatePeekButtonState();
}

if (ENABLE_HELPERS) setupHelpers();
setupNewGameButton();
playBtn.addEventListener("click", () => init());

init();
void loadTopScores();
