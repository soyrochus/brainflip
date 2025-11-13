import { test, expect, Page } from '@playwright/test';

interface CardState {
  index: number;
  dataImage: string;
  hasFlipClass: boolean;
  hasMatchedClass: boolean;
}

/**
 * Helper function to get all cards from the game board
 */
async function getAllCards(page: Page): Promise<CardState[]> {
  return await page.evaluate(() => {
    const cards = Array.from(document.querySelectorAll('.card'));
    return cards.map((card, index) => ({
      index,
      dataImage: (card as HTMLElement).dataset.image || '',
      hasFlipClass: card.classList.contains('flip'),
      hasMatchedClass: card.classList.contains('matched')
    }));
  });
}

/**
 * Helper function to get the state of a specific card
 */
async function getCardState(page: Page, index: number) {
  return await page.evaluate((idx: number) => {
    const card = document.querySelectorAll('.card')[idx];
    if (!card) return null;
    return {
      dataImage: (card as HTMLElement).dataset.image || '',
      hasFlipClass: card.classList.contains('flip'),
      hasMatchedClass: card.classList.contains('matched')
    };
  }, index);
}

/**
 * Helper function to click a card by index
 */
async function clickCard(page: Page, index: number) {
  await page.evaluate((idx: number) => {
    const card = document.querySelectorAll('.card')[idx];
    if (card) (card as HTMLElement).click();
  }, index);
}

/**
 * Helper function to find two cards that don't match
 */
async function findMismatchedPair(page: Page) {
  const cards = await getAllCards(page);
  
  // Filter out already matched cards
  const availableCards = cards.filter((c: CardState) => !c.hasMatchedClass);
  
  // Find two cards with different images
  for (let i = 0; i < availableCards.length - 1; i++) {
    for (let j = i + 1; j < availableCards.length; j++) {
      if (availableCards[i].dataImage !== availableCards[j].dataImage) {
        return {
          first: availableCards[i].index,
          second: availableCards[j].index
        };
      }
    }
  }
  
  return null;
}

/**
 * Helper function to find two cards that match
 */
async function findMatchingPair(page: Page) {
  const cards = await getAllCards(page);
  
  // Filter out already matched cards
  const availableCards = cards.filter((c: CardState) => !c.hasMatchedClass);
  
  // Find two cards with the same image
  for (let i = 0; i < availableCards.length - 1; i++) {
    for (let j = i + 1; j < availableCards.length; j++) {
      if (availableCards[i].dataImage === availableCards[j].dataImage) {
        return {
          first: availableCards[i].index,
          second: availableCards[j].index,
          image: availableCards[i].dataImage
        };
      }
    }
  }
  
  return null;
}

test.describe('BrainFlip Card Matching', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:8000');
    // Wait for the game to be fully loaded
    await page.waitForSelector('.card');
  });

  test('mismatched_cards_flip_back', async ({ page }) => {
    // Find two cards that don't match
    const mismatchedPair = await findMismatchedPair(page);
    expect(mismatchedPair).not.toBeNull();
    
    const { first, second } = mismatchedPair!;
    
    // Verify both cards are face-down initially
    let firstCardState = await getCardState(page, first);
    let secondCardState = await getCardState(page, second);
    
    expect(firstCardState?.hasFlipClass).toBe(false);
    expect(firstCardState?.hasMatchedClass).toBe(false);
    expect(secondCardState?.hasFlipClass).toBe(false);
    expect(secondCardState?.hasMatchedClass).toBe(false);
    
    // Click the first card
    await clickCard(page, first);
    
    // Wait a bit for the flip animation
    await page.waitForTimeout(100);
    
    // Verify first card is now face-up
    firstCardState = await getCardState(page, first);
    expect(firstCardState?.hasFlipClass).toBe(true);
    expect(firstCardState?.hasMatchedClass).toBe(false);
    
    // Click the second card
    await clickCard(page, second);
    
    // Wait a bit for the flip animation
    await page.waitForTimeout(100);
    
    // Verify second card is now face-up
    secondCardState = await getCardState(page, second);
    expect(secondCardState?.hasFlipClass).toBe(true);
    expect(secondCardState?.hasMatchedClass).toBe(false);
    
    // Wait for the comparison animation to finish (1000ms according to the code)
    await page.waitForTimeout(1200);
    
    // Verify both cards have flipped back to face-down
    firstCardState = await getCardState(page, first);
    secondCardState = await getCardState(page, second);
    
    expect(firstCardState?.hasFlipClass).toBe(false);
    expect(firstCardState?.hasMatchedClass).toBe(false);
    expect(secondCardState?.hasFlipClass).toBe(false);
    expect(secondCardState?.hasMatchedClass).toBe(false);
  });

  test('matching_cards_stay_face_up', async ({ page }) => {
    // Find two cards that match
    const matchingPair = await findMatchingPair(page);
    expect(matchingPair).not.toBeNull();
    
    const { first, second, image } = matchingPair!;
    
    // Verify both cards are face-down initially
    let firstCardState = await getCardState(page, first);
    let secondCardState = await getCardState(page, second);
    
    expect(firstCardState?.hasFlipClass).toBe(false);
    expect(firstCardState?.hasMatchedClass).toBe(false);
    expect(secondCardState?.hasFlipClass).toBe(false);
    expect(secondCardState?.hasMatchedClass).toBe(false);
    
    // Verify they have the same image
    expect(firstCardState?.dataImage).toBe(image);
    expect(secondCardState?.dataImage).toBe(image);
    
    // Click the first card
    await clickCard(page, first);
    
    // Wait a bit for the flip animation
    await page.waitForTimeout(100);
    
    // Verify first card is now face-up
    firstCardState = await getCardState(page, first);
    expect(firstCardState?.hasFlipClass).toBe(true);
    expect(firstCardState?.hasMatchedClass).toBe(false);
    
    // Click the second card
    await clickCard(page, second);
    
    // Wait a bit for the flip animation
    await page.waitForTimeout(100);
    
    // Verify second card is now face-up
    secondCardState = await getCardState(page, second);
    expect(secondCardState?.hasFlipClass).toBe(true);
    expect(secondCardState?.hasMatchedClass).toBe(false);
    
    // Wait for the comparison animation to finish (300ms according to the code for matches)
    await page.waitForTimeout(500);
    
    // Verify both cards are now in the "matched" state and stay face-up
    firstCardState = await getCardState(page, first);
    secondCardState = await getCardState(page, second);
    
    expect(firstCardState?.hasFlipClass).toBe(true);
    expect(firstCardState?.hasMatchedClass).toBe(true);
    expect(secondCardState?.hasFlipClass).toBe(true);
    expect(secondCardState?.hasMatchedClass).toBe(true);
    
    // Wait a bit longer to ensure they don't flip back
    await page.waitForTimeout(1000);
    
    // Verify they're still matched
    firstCardState = await getCardState(page, first);
    secondCardState = await getCardState(page, second);
    
    expect(firstCardState?.hasFlipClass).toBe(true);
    expect(firstCardState?.hasMatchedClass).toBe(true);
    expect(secondCardState?.hasFlipClass).toBe(true);
    expect(secondCardState?.hasMatchedClass).toBe(true);
    
    // Verify score increased (should be greater than 0)
    const scoreText = await page.textContent('#score');
    const score = parseInt(scoreText || '0');
    expect(score).toBeGreaterThan(0);
  });

  test('matched_cards_cannot_be_clicked_again', async ({ page }) => {
    // Find and match a pair
    const matchingPair = await findMatchingPair(page);
    expect(matchingPair).not.toBeNull();
    
    const { first, second } = matchingPair!;
    
    // Click both cards to match them
    await clickCard(page, first);
    await page.waitForTimeout(100);
    await clickCard(page, second);
    await page.waitForTimeout(500);
    
    // Verify they're matched
    let firstCardState = await getCardState(page, first);
    expect(firstCardState?.hasMatchedClass).toBe(true);
    
    // Try clicking the matched card again
    await clickCard(page, first);
    await page.waitForTimeout(100);
    
    // Verify the card state hasn't changed
    firstCardState = await getCardState(page, first);
    expect(firstCardState?.hasMatchedClass).toBe(true);
    expect(firstCardState?.hasFlipClass).toBe(true);
  });

  test('cannot_click_same_card_twice', async ({ page }) => {
    const cards = await getAllCards(page);
    const firstCard = cards.find((c: CardState) => !c.hasMatchedClass);
    expect(firstCard).toBeDefined();
    
    const index = firstCard!.index;
    
    // Click the card once
    await clickCard(page, index);
    await page.waitForTimeout(100);
    
    // Verify it's flipped
    let cardState = await getCardState(page, index);
    expect(cardState?.hasFlipClass).toBe(true);
    
    // Try clicking the same card again
    await clickCard(page, index);
    await page.waitForTimeout(100);
    
    // The card should still be flipped (and only once)
    cardState = await getCardState(page, index);
    expect(cardState?.hasFlipClass).toBe(true);
    expect(cardState?.hasMatchedClass).toBe(false);
    
    // Wait for timeout to reset
    await page.waitForTimeout(1200);
    
    // Card should be back to face-down
    cardState = await getCardState(page, index);
    expect(cardState?.hasFlipClass).toBe(false);
  });

  test('score_increases_only_on_match', async ({ page }) => {
    // Get initial score
    let scoreText = await page.textContent('#score');
    let initialScore = parseInt(scoreText || '0');
    expect(initialScore).toBe(0);
    
    // Find mismatched pair
    const mismatchedPair = await findMismatchedPair(page);
    expect(mismatchedPair).not.toBeNull();
    
    // Click mismatched pair
    await clickCard(page, mismatchedPair!.first);
    await page.waitForTimeout(100);
    await clickCard(page, mismatchedPair!.second);
    await page.waitForTimeout(1200);
    
    // Score should be 0 or decreased (there's a penalty in the code)
    scoreText = await page.textContent('#score');
    const scoreAfterMismatch = parseInt(scoreText || '0');
    expect(scoreAfterMismatch).toBeLessThanOrEqual(initialScore);
    
    // Find matching pair
    const matchingPair = await findMatchingPair(page);
    expect(matchingPair).not.toBeNull();
    
    // Click matching pair
    await clickCard(page, matchingPair!.first);
    await page.waitForTimeout(100);
    await clickCard(page, matchingPair!.second);
    await page.waitForTimeout(500);
    
    // Score should have increased
    scoreText = await page.textContent('#score');
    const finalScore = parseInt(scoreText || '0');
    expect(finalScore).toBeGreaterThan(scoreAfterMismatch);
  });
});
