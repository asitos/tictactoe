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

    fieldElements.forEach((field) =>
        field.addEventListener("click", (e) => {
            if (gameController.getIsOver() || e.target.textContent !== "") return;
            const result = gameController.playRound(parseInt(e.target.dataset.index));
            updateGameboard();
            if (result.winner) {
                // update persistent scoreboard
                Score.add(result.winner);
                setResultMessage(result.winner);
                if (result.combo) highlightWinningFields(result.combo);
            } else {
                setMessageElement(`Player ${gameController.getCurrentPlayerSign()}'s turn`);
            }
        })
    );

    restartButton.addEventListener("click", (e) => {
        gameBoard.reset();
        gameController.reset();
        updateGameboard();
        setMessageElement("Player X's turn");
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

    return { setResultMessage, setMessageElement, highlightWinningFields };
})();

const gameController = (() => {
    const playerX = Player("X");
    const playerO = Player("O");
    let round = 1;
    let isOver = false;

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
    };

    return { playRound, getIsOver, reset, getCurrentPlayerSign };
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
