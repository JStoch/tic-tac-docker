import { useState } from 'react';
import './Game.css'
import NameForm from './NameForm';
import WaitingAnimation from './WaitingAnimation';
import './Board.css'
import Tile from './Tile';
import { fetchAuthSession } from 'aws-amplify/auth';

const signalR = require("@microsoft/signalr");


// React component that displays components dependent of game state
// It displays a status message on the top and a component that is one of:
// 1. User name submition form
// 2. Waiting for second player animation
// 3. Game board
// 4. Game result message
// Function to calculate the winner of the game
const calculateWinner = (board) => {
    const winningLines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
    ];

    for (let i = 0; i < winningLines.length; i++) {
        const [a, b, c] = winningLines[i];
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return board[a];
        }
    }

    return null;
};

const GameStatus = {
    INIT: 'init',
    WAITING: 'waiting',
    YOUR_TURN: 'your-turn',
    OPPONENT_TURN: 'opponent-turn',
    GAME_OVER: 'game-over'
};

const getGameStatusMessage = (gameStatus) => {
    switch (gameStatus) {
        case GameStatus.INIT:
            return 'Welcome to the best Tic Tac Toe game!';
        case GameStatus.WAITING:
            return 'Waiting for an opponent...';
        case GameStatus.YOUR_TURN:
            return "It's your turn";
        case GameStatus.OPPONENT_TURN:
            return "It's opponent's turn";
        case GameStatus.GAME_OVER:
            return 'The game is over';
        default:
            return '';
    }
};

const Game = (props) => {
    const [gameStatus, setGameStatus] = useState(GameStatus.INIT);
    const [board, setBoard] = useState(Array(9).fill(null));
    const [isPlayerTurn, setIsPlayerTurn] = useState(true)

    const uuidv4 = () => {
        return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c =>
          (+c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> +c / 4).toString(16)
        );
      }

    const ip = 'localhost'; // Replace with the actual IP address from the configuration file
    const port = 8080; // Replace with the actual port from the configuration file

    const storeJwtToken = async () => {
        // refresh token authomatically
        const session = await fetchAuthSession();
        const token = session.tokens.idToken;
        console.log(`store token: ${token}`)
        localStorage.setItem('access_token', token);
        return token;
    };

    const getJwtToken = () => {
        const token = localStorage.getItem('access_token');
        console.log(`get token: ${token}`)
        return token;
    }

    var connection = new signalR.HubConnectionBuilder().withUrl(`http://${ip}:${port}/game`, {
        skipNegotiation: true,
        transport: signalR.HttpTransportType.WebSockets,
        headers: {
            Authorization: `Bearer ${getJwtToken()}`
        },
        accessTokenFactory: () => getJwtToken()
    }).build();

    let guid = uuidv4().toString();
    let gameGuid = '';
    let oponnentName = '';

    connection.on("NewGame", (newGameGuid, opponent, isFirst) => {
        oponnentName = opponent;
        gameGuid = newGameGuid;
        startGame(isFirst);
     });

    const startGame = (isFirst) => {
        if (isFirst) {
            setGameStatus(GameStatus.YOUR_TURN);
            isPlayerTurn = true;
        } else {
            setGameStatus(GameStatus.OPPONENT_TURN);
            isPlayerTurn = false
        }
    };

    connection.on("Move", (move) => {
        move = Number(move);
        updateAndSendMove(move);
      });

    const sendMove = (move) => {
        connection.invoke('Move', gameGuid, guid, move.toString());
    }  

    const updateAndSendMove = (index) => {
        const newBoard = [...board];
        // Update the clicked tile with 'X' or 'O' based on the current player
        newBoard[index] = isPlayerTurn ? 'X' : 'O';

        // Update the board state and toggle the player
        setBoard(newBoard);
        if (isPlayerTurn) {
            sendMove(index);
        }
        setIsPlayerTurn(!isPlayerTurn);
    }

    const handleClick = (index) => {
        // Check if the tile is already filled or if the game is already won
        if (board[index] || calculateWinner(board) || !isPlayerTurn) {
            return;
        }

        // Create a copy of the board array
        updateAndSendMove(index);
    };

    const renderTile = (index, position) => {
        return (
            <Tile value={board[index]} onClick={() => handleClick(index)} className={position}/>
        );
    };

    const winner = calculateWinner(board);
    if (winner) {
        handleGameOver(winner);
    }

    const requestNewGame = (playerName) => {
        gameGuid = '';
        oponnentName = '';
        connection.invoke("RequestNewGame", guid, playerName);
      }      

    const handleNameSubmit = async () => {
        // Send the name to the game server, change game state
        setGameStatus(GameStatus.WAITING);
        await storeJwtToken();
        connection.start().then(() => {
            requestNewGame(props.user?.username);
        });
    };

    const handleGameOver = () => {
        setGameStatus(GameStatus.GAME_OVER);
        connection.invoke('EndGame', gameGuid);
    }

    let component;
    switch (gameStatus) {
        case GameStatus.INIT:
            component = <NameForm onSubmit={handleNameSubmit} logout={props.logout}/>;
            break;
        case GameStatus.WAITING:
            component = <WaitingAnimation />;
            break;
        case GameStatus.YOUR_TURN:
        case GameStatus.OPPONENT_TURN:
            component =
            <div className="board">
                <div className="row">
                    {renderTile(0, 'top-left')}
                    {renderTile(1, 'top-center')}
                    {renderTile(2, 'top-right')}
                </div>
                <div className="row">
                    {renderTile(3, 'middle-left')}
                    {renderTile(4, 'middle-center')}
                    {renderTile(5, 'middle-right')}
                </div>
                <div className="row">
                    {renderTile(6, 'bottom-left')}
                    {renderTile(7, 'bottom-center')}
                    {renderTile(8, 'bottom-right')}
                </div>
            </div>;
            break;
        case GameStatus.GAME_OVER:
            component = <div>Game Over</div>;
            break;
        default:
            component = null;
    }

    return (
        <div className="game">
            <div className="game-status">{getGameStatusMessage(gameStatus)}</div>
            <div className="game-component">
                {component}
            </div>
        </div>
    );
};

export default Game;
