
## *Brainflip: 6x6 Memory Game (HTML + Tailwind + JS)**


**Write a single-file HTML implementation of the Memory game (“Concentration”) with the following requirements:**

### 1. **Layout and Structure**

* The game field must be a **6x6 grid** (36 cards, 18 unique pairs).
* Each card is face-down initially, with a shared back-face image (URL provided in an array).
* Card images (front faces) and the back image URL are **defined at the top of the `<script>`** section as an array of URLs. Example:

  ```js
  const cardImages = [
    "front1.png", "front2.png", ..., "front18.png"
  ];
  const backImage = "back.png";
  ```
* The game should randomly shuffle the cards each time.

### 2. **Game Mechanics**

* On clicking a card, animate a “flip” transition (CSS transform, e.g., rotateY or scaleX) to reveal the front image.
* Only **two cards** can be flipped at a time:

  * If the two flipped cards are a **match** (same image), keep them face up.
  * If they do **not match**, wait **one second**, then animate them both flipping back to the back image.
* After a successful match, increment the player’s **score** by 1 point.

### 3. **User Interface**

* **Score Counter:**
  Show the current points (number of matched pairs) in a visually appealing badge **above the grid**.
* **Grid:**
  Use Tailwind CSS for a clean, modern look.

  * Cards should be rounded, with a slight shadow and hover effect.
  * The design should be **friendly, light bluish** (use `bg-blue-50`, `bg-blue-100`, etc. as appropriate).
* **Winning State:**
  When all pairs are found, show a message (“You win!”) and display a **‘Play Again’** button **below the grid**.
  Clicking “Play Again” should reset and reshuffle the game.

### 4. **Other Requirements**

* **No external frameworks** other than Tailwind (linked via CDN is fine).
* No images are hardcoded except through the arrays at the top.
* All JS and CSS should be in the single HTML file (no external files).
* The implementation should be robust:

  * Ignore clicks on already-revealed or matched cards.
  * Prevent more than 2 cards from being flipped simultaneously.

### 5. **Implementation Notes**

* Use semantic HTML as much as possible.
* Use idiomatic, modern JavaScript (ES6+).
* Ensure the design is responsive (looks good on both desktop and mobile).
* Add subtle, tasteful transitions for card flipping.
* The solution should be complete and ready to use.

---

**Output only the HTML file with embedded JavaScript and Tailwind via CDN, ready to use.**

** The game will be started by a Flask application started from main.puy (existing)

** The folder lay-out is

brainflip/
├── main.py
├── static/
│   ├── images/
│   │   ├── front1.png
│   │   ├── front2.png
│   │   └── ...
└── templates/
    └── index.html

Leave the image folderstructure as is. Only modify:

index.html
README.md

In the Readme leave the existing text but add a description of the game on top, conforming typical README style guides.