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

    // Gérer la création de session
    hostButton.addEventListener("click", () => {
        sessionCode = generateCode();
        codeDisplay.textContent = sessionCode;
        menu.classList.add("hidden");
        game.classList.remove("hidden");
        updateURL();
    });

    // Rejoindre une session via un code
    joinButton.addEventListener("click", () => {
        const userCode = prompt("Entrez le code de session:");
        if (userCode) {
            const params = new URLSearchParams(window.location.search);
            const sessionExists = params.get("code") === userCode;
            const stateFromURL = getStateFromURL();

            if (sessionExists && stateFromURL) {
                boardState = stateFromURL.board;
                currentPlayer = stateFromURL.currentPlayer;
                updateBoard();
                status.textContent = `C'est au tour de ${currentPlayer}`;
                menu.classList.add("hidden");
                game.classList.remove("hidden");
            } else {
                alert("Aucune session trouvée avec ce code.");
            }
        }
    });

    // Gestion des clics sur le plateau
    board.addEventListener("click", (e) => {
        const cell = e.target;
        const index = cell.dataset.index;

        if (!cell.textContent && !isGameOver(boardState)) {
            cell.textContent = currentPlayer;
            boardState[index] = currentPlayer;
            if (checkWin(boardState, currentPlayer)) {
                status.textContent = `${currentPlayer} a gagné !`;
            } else if (boardState.every((cell) => cell !== null)) {
                status.textContent = "Match nul !";
            } else {
                currentPlayer = currentPlayer === "X" ? "O" : "X";
                status.textContent = `C'est au tour de ${currentPlayer}`;
            }
            updateURL();
        }
    });

    // Générer un code de session
    function generateCode() {
        return Math.random().toString(36).substring(2, 8).toUpperCase();
    }

    // Mettre à jour l'URL pour inclure l'état du jeu
    function updateURL() {
        const state = {
            board: boardState,
            currentPlayer,
        };
        const encodedState = encodeURIComponent(JSON.stringify(state));
        history.replaceState({}, "", `?code=${sessionCode}&state=${encodedState}`);
    }

    // Obtenir l'état du jeu depuis l'URL
    function getStateFromURL() {
        const params = new URLSearchParams(window.location.search);
        const state = params.get("state");
        if (state) {
            return JSON.parse(decodeURIComponent(state));
        }
        return null;
    }

    // Vérifier si un joueur a gagné
    function checkWin(board, player) {
        const winPatterns = [
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8],
            [0, 3, 6],
            [1, 4, 7],
            [2, 5, 8],
            [0, 4, 8],
            [2, 4, 6],
        ];
        return winPatterns.some((pattern) =>
            pattern.every((index) => board[index] === player)
        );
    }

    // Vérifier si la partie est terminée
    function isGameOver(board) {
        return board.every((cell) => cell !== null) || checkWin(board, "X") || checkWin(board, "O");
    }

    // Mettre à jour le plateau depuis l'état
    function updateBoard() {
        board.querySelectorAll(".cell").forEach((cell, index) => {
            cell.textContent = boardState[index];
        });
    }
});
