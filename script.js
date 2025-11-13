"use strict";

const Player = (sign) => {

    const getSign = () => {
        return sign;
    };

    return { getSign };
};

const gameBoard = (() => {
    const board = ["", "", "", "", "", "", "", "", ""];
    
    const setField = (index,sign) => {
        if (index < 0 || index >= board.length) return;
        board[index] = sign;
    };

    const getField = (index) => {
        if (index < 0 || index >= board.length) return;
        return board[index];
    };

    const reset = () => {
        for (let i = 0; i < board.length; i++) {
            board[i] = "";
        }
    };

    return { setField, getField, reset };
})();

const displayController = (() => {
    const fieldElements = document.querySelectorAll(".field");
    const messageElement = document.getElementById("message");
    const restartButton = document.getElementById("restart-button");
    const modeInputs = document.querySelectorAll('input[name="opponent"]');
    const sideInputs = document.querySelectorAll('input[name="side"]');
    const engineInputs = document.querySelectorAll('input[name="ai-engine"]');
    const aiIndicator = document.getElementById("ai-thinking");

    // mode selector -> set gameController mode
    modeInputs.forEach((input) =>
        input.addEventListener("change", (e) => {
            gameController.setMode(e.target.value);
            // if switching to AI and it's AI's turn, trigger AI move
            if (gameController.getMode() === "ai" && gameController.isAITurn() && !gameController.getIsOver()) {
                showAIThinking(true);
                setTimeout(() => {
                    const aiResult = gameController.makeAIMove();
                    updateGameboard();
                    showAIThinking(false);
                    if (aiResult.winner) {
                        Score.add(aiResult.winner);
                        setResultMessage(aiResult.winner);
                        if (aiResult.combo) highlightWinningFields(aiResult.combo);
                    } else {
                        setMessageElement(`Player ${gameController.getCurrentPlayerSign()}'s turn`);
                    }
                }, 300);
            }
        })
    );

    // side selector -> set player's side
    sideInputs.forEach((input) =>
        input.addEventListener("change", (e) => {
            gameController.setHumanSign(e.target.value);
            // if switching midgame and it's AI's turn, let AI move
            if (gameController.getMode() === "ai" && gameController.isAITurn() && !gameController.getIsOver()) {
                showAIThinking(true);
                setTimeout(() => {
                    const aiResult = gameController.makeAIMove();
                    updateGameboard();
                    showAIThinking(false);
                    if (aiResult.winner) {
                        Score.add(aiResult.winner);
                        setResultMessage(aiResult.winner);
                        if (aiResult.combo) highlightWinningFields(aiResult.combo);
                    } else {
                        setMessageElement(`Player ${gameController.getCurrentPlayerSign()}'s turn`);
                    }
                }, 300);
            }
        })
    );

    // engine selector -> set AI engine
    engineInputs.forEach((input) =>
        input.addEventListener("change", (e) => {
            gameController.setAIEngine(e.target.value);
            // if it's AI's turn, let AI act with new engine
            if (gameController.getMode() === "ai" && gameController.isAITurn() && !gameController.getIsOver()) {
                showAIThinking(true);
                setTimeout(() => {
                    const aiResult = gameController.makeAIMove();
                    updateGameboard();
                    showAIThinking(false);
                    if (aiResult.winner) {
                        Score.add(aiResult.winner);
                        setResultMessage(aiResult.winner);
                        if (aiResult.combo) highlightWinningFields(aiResult.combo);
                    } else {
                        setMessageElement(`Player ${gameController.getCurrentPlayerSign()}'s turn`);
                    }
                }, 300);
            }
        })
    );

    // (controller initialization is done after gameController is created)

    fieldElements.forEach((field) =>
        field.addEventListener("click", (e) => {
            if (gameController.getIsOver() || e.target.textContent !== "") return;
            // prevent clicking when it's AI's turn
            if (gameController.getMode && gameController.getMode() === "ai" && gameController.isAITurn && gameController.isAITurn()) return;
            const result = gameController.playRound(parseInt(e.target.dataset.index));
            updateGameboard();
            if (result.winner) {
                // update persistent scoreboard
                Score.add(result.winner);
                setResultMessage(result.winner);
                if (result.combo) highlightWinningFields(result.combo);
            } else {
                setMessageElement(`Player ${gameController.getCurrentPlayerSign()}'s turn`);
                // if AI mode and it's AI's turn now, make AI move
                if (gameController.getMode && gameController.getMode() === "ai" && gameController.isAITurn && gameController.isAITurn()) {
                    showAIThinking(true);
                    setTimeout(() => {
                        const aiResult = gameController.makeAIMove();
                        updateGameboard();
                        showAIThinking(false);
                        if (aiResult.winner) {
                            Score.add(aiResult.winner);
                            setResultMessage(aiResult.winner);
                            if (aiResult.combo) highlightWinningFields(aiResult.combo);
                        } else {
                            setMessageElement(`Player ${gameController.getCurrentPlayerSign()}'s turn`);
                        }
                    }, 300);
                }
            }
        })
    );

    restartButton.addEventListener("click", (e) => {
        gameBoard.reset();
        gameController.reset();
    updateGameboard();
    setMessageElement(`Player ${gameController.getCurrentPlayerSign()}'s turn`);
        // preserve UI mode/side selection; if AI should play first, trigger it
        const mode = gameController.getMode();
        if (mode === "ai" && gameController.isAITurn() && !gameController.getIsOver()) {
            showAIThinking(true);
            setTimeout(() => {
                const aiResult = gameController.makeAIMove();
                updateGameboard();
                showAIThinking(false);
                if (aiResult.winner) {
                    Score.add(aiResult.winner);
                    setResultMessage(aiResult.winner);
                    if (aiResult.combo) highlightWinningFields(aiResult.combo);
                } else {
                    setMessageElement(`Player ${gameController.getCurrentPlayerSign()}'s turn`);
                }
            }, 300);
        }
    });

    const updateGameboard = () => {
        for (let i = 0; i < fieldElements.length; i++) {
            fieldElements[i].textContent = gameBoard.getField(i);
            fieldElements[i].classList.remove("win");
        }
    };

    const highlightWinningFields = (combo) => {
        combo.forEach((i) => {
            fieldElements[i].classList.add("win");
        });
    };

    const setResultMessage = (winner) => {
        if (winner === "Draw") {
            setMessageElement("It's a draw!");
        } else {
            setMessageElement(`Player ${winner} has won!`);
        }
    };

    const setMessageElement = (message) => {
        messageElement.textContent = message;
    };

    const showAIThinking = (show) => {
        if (!aiIndicator) return;
        aiIndicator.style.display = show ? "block" : "none";
    };

    return { setResultMessage, setMessageElement, highlightWinningFields, showAIThinking };
})();

const gameController = (() => {
    const playerX = Player("X");
    const playerO = Player("O");
    let round = 1;
    let isOver = false;
    let mode = "human"; // 'human' or 'ai'
    let humanSign = "X"; // player preference: 'X' or 'O'
    let aiEngine = "minimax"; // 'minimax' or 'random'

    const playRound = (fieldIndex) => {
        const currentSign = getCurrentPlayerSign();
        gameBoard.setField(fieldIndex, currentSign);
        const winningCombo = checkWinner(fieldIndex);
        if (winningCombo) {
            isOver = true;
            return { winner: currentSign, combo: winningCombo };
        }
        if (round === 9) {
            isOver = true;
            return { winner: "Draw", combo: null };
        }
        round++;
        return { winner: null, combo: null };
    };

    const setMode = (m) => {
        if (m === "ai" || m === "human") mode = m;
    };

    const getMode = () => mode;

    const setHumanSign = (s) => {
        if (s === "X" || s === "O") humanSign = s;
    };

    const setAIEngine = (e) => {
        if (e === "minimax" || e === "random") aiEngine = e;
    };

    const getAIEngine = () => aiEngine;

    const getHumanSign = () => humanSign;

    const isAITurn = () => {
        if (mode !== "ai") return false;
        const aiSign = humanSign === "X" ? "O" : "X";
        return getCurrentPlayerSign() === aiSign;
    };

    // helper: return array of available indices
    const getAvailableFields = () => {
        const arr = [];
        for (let i = 0; i < 9; i++) {
            if (gameBoard.getField(i) === "") arr.push(i);
        }
        return arr;
    };

    // check if 'sign' has any winning combination currently on the board
    const checkWinForSign = (sign) => {
        const winConditions = [
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8],
            [0, 3, 6],
            [1, 4, 7],
            [2, 5, 8],
            [0, 4, 8],
            [2, 4, 6],
        ];
        for (const combo of winConditions) {
            if (combo.every((i) => gameBoard.getField(i) === sign)) return combo;
        }
        return null;
    };

    // helper: would placing 'sign' at index create a win for that sign?
    const wouldWin = (sign, index) => {
        const winConditions = [
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8],
            [0, 3, 6],
            [1, 4, 7],
            [2, 5, 8],
            [0, 4, 8],
            [2, 4, 6],
        ];
        for (const combo of winConditions) {
            if (combo.includes(index)) {
                const others = combo.filter((i) => i !== index);
                if (others.every((i) => gameBoard.getField(i) === sign)) return true;
            }
        }
        return false;
    };

    // simple AI that: (1) wins if possible, (2) blocks opponent win, (3) takes center, (4) picks random corner/side
    // Minimax-based AI with fallback
    const chooseAIMove = () => {
        const engine = aiEngine || "minimax";
        const aiSign = humanSign === "X" ? "O" : "X";
        const available = getAvailableFields();
        if (available.length === 0) return null;

        if (engine === "random") {
            // choose uniformly random from available
            return available[Math.floor(Math.random() * available.length)];
        }

        // minimax engine
        const human = humanSign;
        const boardArr = [];
        for (let i = 0; i < 9; i++) boardArr[i] = gameBoard.getField(i) || "";

        const winnerOnBoard = (board) => {
            const winConditions = [
                [0, 1, 2],
                [3, 4, 5],
                [6, 7, 8],
                [0, 3, 6],
                [1, 4, 7],
                [2, 5, 8],
                [0, 4, 8],
                [2, 4, 6],
            ];
            for (const combo of winConditions) {
                const [a, b, c] = combo;
                if (board[a] && board[a] === board[b] && board[a] === board[c]) return board[a];
            }
            if (board.every((v) => v !== "")) return "Draw";
            return null;
        };

        const minimax = (board, depth, isMaximizing) => {
            const winner = winnerOnBoard(board);
            if (winner === aiSign) return 10 - depth;
            if (winner === human) return depth - 10;
            if (winner === "Draw") return 0;

            const avail = [];
            for (let i = 0; i < 9; i++) if (board[i] === "") avail.push(i);

            if (isMaximizing) {
                let bestScore = -Infinity;
                for (const idx of avail) {
                    board[idx] = aiSign;
                    const score = minimax(board, depth + 1, false);
                    board[idx] = "";
                    bestScore = Math.max(bestScore, score);
                }
                return bestScore;
            } else {
                let bestScore = Infinity;
                for (const idx of avail) {
                    board[idx] = human;
                    const score = minimax(board, depth + 1, true);
                    board[idx] = "";
                    bestScore = Math.min(bestScore, score);
                }
                return bestScore;
            }
        };

        let bestScore = -Infinity;
        let bestMove = available[0];
        for (const idx of available) {
            boardArr[idx] = aiSign;
            const score = minimax(boardArr, 0, false);
            boardArr[idx] = "";
            if (score > bestScore) {
                bestScore = score;
                bestMove = idx;
            }
        }

        return bestMove;
    };

    const makeAIMove = () => {
        if (isOver) return { winner: null, combo: null };
        const index = chooseAIMove();
        if (index === null || index === undefined) return { winner: null, combo: null };
        return playRound(index);
    };

    const getCurrentPlayerSign = () => {
        return round % 2 === 1 ? playerX.getSign() : playerO.getSign();
    };

    const checkWinner = (fieldIndex) => {
        const winConditions = [
            [0, 1, 2],
            [3, 4, 5],
            [6, 7, 8],
            [0, 3, 6],
            [1, 4, 7],
            [2, 5, 8],
            [0, 4, 8],
            [2, 4, 6],
        ];

        const currentSign = getCurrentPlayerSign();
        for (const combo of winConditions) {
            if (combo.includes(fieldIndex)) {
                if (combo.every((i) => gameBoard.getField(i) === currentSign)) {
                    return combo;
                }
            }
        }
        return null;
    };

    const getIsOver = () => {
        return isOver;
    };

    const reset = () => {
        round = 1;
        isOver = false;
        // preserve mode and humanSign so UI selection remains effective on restart
    };

    return { playRound, getIsOver, reset, getCurrentPlayerSign, setMode, getMode, setHumanSign, getHumanSign, isAITurn, makeAIMove, setAIEngine, getAIEngine };
})();

// initialize controller with current UI selections after controller exists
(() => {
    const checkedMode = document.querySelector('input[name="opponent"]:checked');
    if (checkedMode) gameController.setMode(checkedMode.value);
    const checkedSide = document.querySelector('input[name="side"]:checked');
    if (checkedSide) gameController.setHumanSign(checkedSide.value);
    const checkedEngine = document.querySelector('input[name="ai-engine"]:checked');
    if (checkedEngine) gameController.setAIEngine(checkedEngine.value);
    // if AI mode and AI should play first, trigger an initial AI move
    if (gameController.getMode() === "ai" && gameController.isAITurn() && !gameController.getIsOver()) {
        // find displayController's showAIThinking and update functions via existing globals
        // show thinking, make move, update UI
        const aiIndicator = document.getElementById("ai-thinking");
        if (aiIndicator) aiIndicator.style.display = "block";
        setTimeout(() => {
            const aiResult = gameController.makeAIMove();
            // update DOM fields
            const fieldElements = document.querySelectorAll('.field');
            for (let i = 0; i < fieldElements.length; i++) {
                fieldElements[i].textContent = gameBoard.getField(i);
                fieldElements[i].classList.remove('win');
            }
            if (aiIndicator) aiIndicator.style.display = "none";
            if (aiResult && aiResult.winner) {
                Score.add(aiResult.winner);
                // show message
                const msg = document.getElementById('message');
                if (msg) {
                    if (aiResult.winner === 'Draw') msg.textContent = "It's a draw!";
                    else msg.textContent = `Player ${aiResult.winner} has won!`;
                }
                if (aiResult.combo) {
                    aiResult.combo.forEach(i => document.querySelectorAll('.field')[i].classList.add('win'));
                }
            } else {
                const msg = document.getElementById('message');
                if (msg) msg.textContent = `Player ${gameController.getCurrentPlayerSign()}'s turn`;
            }
        }, 300);
    }
})();

const Score = (() => {
  const key = "tic-tac-toe-scores";
  const defaultScores = { X: 0, O: 0, Draw: 0 };
  const load = () => JSON.parse(localStorage.getItem(key)) || defaultScores;
  const save = (s) => localStorage.setItem(key, JSON.stringify(s));
  let scores = load();

  const add = (result) => {
    if (result === "Draw") scores.Draw++;
    else if (result === "X") scores.X++;
    else if (result === "O") scores.O++;
    save(scores);
    render();
  };

  const render = () => {
    document.getElementById("score-x").textContent = `X: ${scores.X}`;
    document.getElementById("score-draw").textContent = `Draws: ${scores.Draw}`;
    document.getElementById("score-o").textContent = `O: ${scores.O}`;
  };

  // initialize UI
  document.addEventListener("DOMContentLoaded", render);

  return { add, render };
})();
