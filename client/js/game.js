"use strict";

const tiles = document.querySelectorAll(".tile");

//TODO change const/let and names
const PLAYER_SYMBOL = "X";
const OPONNENT_SYMBOL = "O";
const guid = crypto.randomUUID().toString();
let isPlayerTurn = false;
let playerName = 'Stefan';
let oponnentName = '';
let gameGuid = '';

var connection = new signalR.HubConnectionBuilder().withUrl("http://localhost:5269/game", {
  skipNegotiation: true,
  transport: signalR.HttpTransportType.WebSockets
}).build();

connection.on("NewGame", function (newGameGuid, opponent, isFirst) {
  oponnentName = opponent;
  gameGuid = newGameGuid;
  isPlayerTurn = isFirst;
  indicateTurn();
})

connection.on("Move", function (move) {
  move = Number(move);
  makeMove(move, OPONNENT_SYMBOL);
});

connection.start().then(function() {
  turnIndicator.innerText =`Waiting for an oponnent...`;
  connection.invoke("RequestConnection", guid, playerName);
});

function sendMove(move) {
  connection.invoke('Move', gameGuid, guid, move.toString());
}

const boardState = Array(tiles.length);
boardState.fill(null);

//Elements
const strike = document.getElementById("strike");
const gameOverArea = document.getElementById("game-over-area");
const gameOverText = document.getElementById("game-over-text");
const playAgain = document.getElementById("play-again");
const turnIndicator = document.getElementById("turn-indicator");
playAgain.addEventListener("click", startNewGame);

tiles.forEach((tile) => tile.addEventListener("click", tileClick));

function setHoverText() {
  tiles.forEach((tile) => {
    if (tile.innerText == "") {
      tile.classList.add(`shadow-move`);
    }
  });
}

function removeHoverText(tile) {
  tile.classList.remove(`shadow-move`);
}

function makeMove(tileNumber, symbol) {
  const tile = tiles[tileNumber];
  tile.innerText = symbol;
  boardState[tileNumber] = symbol;
  removeHoverText(tile);
  isPlayerTurn = !isPlayerTurn;
  indicateTurn();
  checkWinner();
}

function tileClick(event) {
  if (gameOverArea.classList.contains("visible") || !isPlayerTurn) {
    return;
  }

  const tile = event.target;
  const tileNumber = tile.dataset.index;
  if (tile.innerText != "") {
    return;
  }

  makeMove(tileNumber, PLAYER_SYMBOL);
  sendMove(tile.dataset.index);
}

function indicateTurn() {
  let currentPlayer = '';
  if (isPlayerTurn) {
    currentPlayer = playerName;
  } else {
    currentPlayer = oponnentName;
  }

  turnIndicator.innerText =`It's ${currentPlayer}'s turn`;
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
  //TODO change
  isPlayerTurn = true;
  indicateTurn();
  setHoverText();
}

const winningCombinations = [
  //rows
  { combo: [0, 1, 2], strikeClass: "strike-row-1" },
  { combo: [3, 4, 5], strikeClass: "strike-row-2" },
  { combo: [6, 7, 8], strikeClass: "strike-row-3" },
  //columns
  { combo: [0, 3, 6], strikeClass: "strike-column-1" },
  { combo: [1, 4, 7], strikeClass: "strike-column-2" },
  { combo: [2, 5, 8], strikeClass: "strike-column-3" },
  //diagonals
  { combo: [0, 4, 8], strikeClass: "strike-diagonal-1" },
  { combo: [2, 4, 6], strikeClass: "strike-diagonal-2" },
];

startNewGame();