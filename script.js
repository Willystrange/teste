// Import Firebase modules
import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, get, onValue } from "firebase/database";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAFLxiyzG2ygmQ9-_A7510_VIsGfd6EvdU",
    authDomain: "test-tic-tac-toe-31c30.firebaseapp.com",
    databaseURL: "https://test-tic-tac-toe-31c30-default-rtdb.firebaseio.com",
    projectId: "test-tic-tac-toe-31c30",
    storageBucket: "test-tic-tac-toe-31c30.firebaseapp.com",
    messagingSenderId: "60736887108",
    appId: "1:60736887108:web:2e9740d2becb0234b91f11",
    measurementId: "G-VKHH33G1H9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

document.addEventListener("DOMContentLoaded", () => {
    const hostButton = document.getElementById("hostButton");
    const joinButton = document.getElementById("joinButton");
    const game = document.getElementById("game");
    const menu = document.getElementById("menu");
    const codeDisplay = document.getElementById("codeDisplay");
    const board = document.getElementById("board");
    const status = document.getElementById("status");

    let currentPlayer = "X";
    let boardState = Array(9).fill(null);
    let sessionCode = "";

    // Generate a unique session code
    function generateCode() {
        return Math.random().toString(36).substring(2, 8).toUpperCase();
    }

    // Check if a player has won
    function checkWin(board, player) {
        const winPatterns = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];
        return winPatterns.some(pattern =>
            pattern.every(index => board[index] === player)
        );
    }

    // Check if the game is over
    function isGameOver(board) {
        return board.every(cell => cell !== null) || checkWin(board, "X") || checkWin(board, "O");
    }

    // Update the board UI
    function updateBoard() {
        board.querySelectorAll(".cell").forEach((cell, index) => {
            cell.textContent = boardState[index];
        });
    }

    // Host a new session
    hostButton.addEventListener("click", () => {
        sessionCode = generateCode();
        set(ref(database, `sessions/${sessionCode}`), {
            board: boardState,
            currentPlayer: "X"
        });
        codeDisplay.textContent = `Code de session : ${sessionCode}`;
        menu.classList.add("hidden");
        game.classList.remove("hidden");
    });

    // Join an existing session
    joinButton.addEventListener("click", () => {
        const userCode = prompt("Entrez le code de session:");
        if (userCode) {
            get(ref(database, `sessions/${userCode}`)).then((snapshot) => {
                if (snapshot.exists()) {
                    const sessionData = snapshot.val();
                    sessionCode = userCode;
                    boardState = sessionData.board;
                    currentPlayer = sessionData.currentPlayer;
                    updateBoard();
                    status.textContent = `C'est au tour de ${currentPlayer}`;
                    menu.classList.add("hidden");
                    game.classList.remove("hidden");

                    // Listen for updates in real-time
                    onValue(ref(database, `sessions/${sessionCode}`), (snapshot) => {
                        const data = snapshot.val();
                        boardState = data.board;
                        currentPlayer = data.currentPlayer;
                        updateBoard();
                        if (!isGameOver(boardState)) {
                            status.textContent = `C'est au tour de ${currentPlayer}`;
                        }
                    });
                } else {
                    alert("Aucune session trouvée avec ce code.");
                }
            });
        }
    });

    // Handle board clicks
    board.addEventListener("click", (e) => {
        const cell = e.target;
        const index = cell.dataset.index;

        if (!cell.textContent && !isGameOver(boardState)) {
            boardState[index] = currentPlayer;
            set(ref(database, `sessions/${sessionCode}`), {
                board: boardState,
                currentPlayer: currentPlayer === "X" ? "O" : "X"
            });

            if (checkWin(boardState, currentPlayer)) {
                status.textContent = `${currentPlayer} a gagné !`;
            } else if (boardState.every(cell => cell !== null)) {
                status.textContent = "Match nul !";
            }

            currentPlayer = currentPlayer === "X" ? "O" : "X";
        }
    });
});
