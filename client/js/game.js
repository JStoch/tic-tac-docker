const tiles = document.querySelectorAll(".tile");
//TODO remove
const PLAYER_X = "X";
const PLAYER_O = "O";
let turn = PLAYER_X;

const PLAYER_SYMBOL = "X";
const OPONNENT_SYMBOL = "O";

const GAME_STATE_WON = 1;
const GAME_STATE_LOST = 2;

let isPlayerTurn = true;
let playerName = 'Stefan';

const boardState = Array(tiles.length);
boardState.fill(null);

//Elements
const strike = document.getElementById("strike");
const gameOverArea = document.getElementById("game-over-area");
const gameOverText = document.getElementById("game-over-text");
const playAgain = document.getElementById("play-again");
playAgain.addEventListener("click", startNewGame);

tiles.forEach((tile) => tile.addEventListener("click", tileClick));

function setHoverText() {
  //remove all hover text
  const hoverClass = `${PLAYER_SYMBOL.toLowerCase()}-hover`;
  tiles.forEach((tile) => {
    if (tile.innerText == "") {
      tile.classList.add(hoverClass);
    }
  });
}

function removeHoverText(tile) {
  tile.classList.remove(`${PLAYER_SYMBOL.toLowerCase()}-hover`);
}

setHoverText();

function tileClick(event) {
  if (gameOverArea.classList.contains("visible")) {
    return;
  }

  const tile = event.target;
  const tileNumber = tile.dataset.index;
  if (tile.innerText != "") {
    return;
  }

  //TODO remove else - make early return from isPlayerTurn
  if (isPlayerTurn) {
    tile.innerText = PLAYER_SYMBOL;
    boardState[tileNumber] = PLAYER_SYMBOL;
    isPlayerTurn = false;
  } else {
    tile.innerText = OPONNENT_SYMBOL;
    boardState[tileNumber] = OPONNENT_SYMBOL;
    isPlayerTurn = true;
  }

  removeHoverText(tile);
  checkWinner();
}

function indicateTurn() {
  
  if (isPlayerTurn) {
    
  }
}

function checkWinner() {
  //Check for a winner
  for (const winningCombination of winningCombinations) {
    //Object Destructuring
    const { combo, strikeClass } = winningCombination;
    const tileValue1 = boardState[combo[0]];
    const tileValue2 = boardState[combo[1]];
    const tileValue3 = boardState[combo[2]];

    if (
      tileValue1 != null &&
      tileValue1 === tileValue2 &&
      tileValue1 === tileValue3
    ) {
      strike.classList.add(strikeClass);
      gameOverScreen(tileValue1);
      return;
    }
  }

  //Check for a draw
  const allTileFilledIn = boardState.every((tile) => tile !== null);
  if (allTileFilledIn) {
    gameOverScreen(null);
  }
}

function gameOverScreen(winningSymbol) {
  let text = "Draw!";
  if (winningSymbol == PLAYER_SYMBOL) {
    text = `You won!`;
  } else if (winningSymbol == OPONNENT_SYMBOL) {
    text = 'You lost.'
  } else {
    text = "It's a draw!"
  }
  gameOverArea.className = "visible";
  gameOverText.innerText = text;
}

function startNewGame() {
  strike.className = "strike";
  gameOverArea.className = "hidden";
  boardState.fill(null);
  tiles.forEach((tile) => (tile.innerText = ""));
  isPlayerTurn = true;
  setHoverText();
}

const winningCombinations = [
  //rows
  { combo: [0, 1, 2], strikeClass: "strike-row-1" },
  { combo: [3, 4, 5], strikeClass: "strike-row-2" },
  { combo: [6, 7, 8], strikeClass: "strike-row-3" },
  //columns
  { combo: [0, 3, 6], strikeClass: "strike-column-1" },
  { combo: [1, 6, 7], strikeClass: "strike-column-2" },
  { combo: [2, 5, 8], strikeClass: "strike-column-3" },
  //diagonals
  { combo: [0, 4, 8], strikeClass: "strike-diagonal-1" },
  { combo: [2, 4, 6], strikeClass: "strike-diagonal-2" },
];
