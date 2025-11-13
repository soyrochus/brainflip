Open the Brainflip game in the browser and generate Playwright tests for the card-matching behaviour.

First, use the page inspection tools to discover which DOM elements represent cards and how you can tell these states apart from the DOM:
– face-down
– face-up (temporarily flipped)
– matched (two equal cards that stay visible)

Then create two Playwright tests:

mismatched_cards_flip_back: click two different face-down cards, wait until the comparison animation is finished, and assert that both cards return to the face-down state.

matching_cards_stay_face_up: systematically search for a pair of cards with the same image or identifier, click them in sequence, and assert that both cards stay in the “matched” state and are no longer treated as normal face-down cards.

Because the board is shuffled randomly, do not hard-code card positions. Instead, implement a loop that tries different card pairs until it finds a mismatch (for the first test) and a real match (for the second test). Base your assertions on DOM attributes or classes that you discovered (for example CSS classes, data-* attributes or img src values).