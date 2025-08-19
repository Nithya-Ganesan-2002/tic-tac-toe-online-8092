import React, { useEffect, useMemo, useState } from 'react';
import './App.css';

/**
 * Minimal Tic Tac Toe implementation with:
 * - Two-player and optional simple AI
 * - Centered board, score above, controls below
 * - Session score tracking
 * - Restart functionality
 * - Responsive minimalistic light theme using provided colors
 */

// Helpers
const LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // cols
  [0, 4, 8], [2, 4, 6]             // diagonals
];

function calculateWinner(squares) {
  for (const [a, b, c] of LINES) {
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { player: squares[a], line: [a, b, c] };
    }
  }
  return null;
}

function getEmptySquares(squares) {
  const res = [];
  for (let i = 0; i < squares.length; i += 1) {
    if (!squares[i]) res.push(i);
  }
  return res;
}

// PUBLIC_INTERFACE
export default function App() {
  /** Light theme, minimalistic UI **/
  const [theme] = useState('light'); // locked to light per requirement
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Game state
  const [board, setBoard] = useState(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);
  const [mode, setMode] = useState('pvp'); // 'pvp' or 'ai'
  const [scores, setScores] = useState({ X: 0, O: 0, Draws: 0 });

  const winnerInfo = useMemo(() => calculateWinner(board), [board]);
  const isBoardFull = useMemo(() => getEmptySquares(board).length === 0, [board]);
  const statusText = useMemo(() => {
    if (winnerInfo) {
      return `Winner: ${winnerInfo.player}`;
    }
    if (isBoardFull) {
      return 'Draw';
    }
    return `Next player: ${xIsNext ? 'X' : 'O'}`;
  }, [winnerInfo, isBoardFull, xIsNext]);

  // PUBLIC_INTERFACE
  function handleSquareClick(i) {
    // Ignore if game over or square filled
    if (winnerInfo || board[i]) return;
    const nextBoard = board.slice();
    nextBoard[i] = xIsNext ? 'X' : 'O';
    setBoard(nextBoard);
    setXIsNext(!xIsNext);
  }

  // PUBLIC_INTERFACE
  function resetBoard() {
    setBoard(Array(9).fill(null));
    setXIsNext(true);
  }

  // PUBLIC_INTERFACE
  function resetScores() {
    setScores({ X: 0, O: 0, Draws: 0 });
    resetBoard();
  }

  // Update scores when game ends
  useEffect(() => {
    if (winnerInfo) {
      setScores(prev => ({
        ...prev,
        [winnerInfo.player]: prev[winnerInfo.player] + 1
      }));
    } else if (isBoardFull) {
      setScores(prev => ({ ...prev, Draws: prev.Draws + 1 }));
    }
    // Only trigger on game end states
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [winnerInfo, isBoardFull]);

  // Simple AI: tries to win, then block, otherwise pick center, corner, random
  useEffect(() => {
    if (mode !== 'ai') return;
    // AI plays 'O' by default when it's O's turn
    if (winnerInfo || isBoardFull) return;
    const aiTurn = !xIsNext; // O's turn
    if (!aiTurn) return;

    const makeMove = (idx) => {
      const next = board.slice();
      next[idx] = 'O';
      setBoard(next);
      setXIsNext(true);
    };

    const empty = getEmptySquares(board);

    // 1) Win if possible
    for (const idx of empty) {
      const attempt = board.slice();
      attempt[idx] = 'O';
      if (calculateWinner(attempt)?.player === 'O') {
        makeMove(idx);
        return;
      }
    }
    // 2) Block X if necessary
    for (const idx of empty) {
      const attempt = board.slice();
      attempt[idx] = 'X';
      if (calculateWinner(attempt)?.player === 'X') {
        makeMove(idx);
        return;
      }
    }
    // 3) Take center
    if (empty.includes(4)) {
      makeMove(4);
      return;
    }
    // 4) Take a corner
    const corners = empty.filter(i => [0, 2, 6, 8].includes(i));
    if (corners.length) {
      makeMove(corners[Math.floor(Math.random() * corners.length)]);
      return;
    }
    // 5) Random
    makeMove(empty[Math.floor(Math.random() * empty.length)]);
  }, [mode, xIsNext, board, winnerInfo, isBoardFull]);

  // PUBLIC_INTERFACE
  function changeMode(newMode) {
    setMode(newMode);
    resetBoard();
  }

  return (
    <div className="App">
      <header className="ttt-header">
        <h1 className="title">Tic Tac Toe</h1>
        <div className="scores">
          <div className="score chip chip-primary" aria-label="Score for X">X: {scores.X}</div>
          <div className="score chip chip-secondary" aria-label="Score for O">O: {scores.O}</div>
          <div className="score chip chip-accent" aria-label="Draws">Draws: {scores.Draws}</div>
        </div>
        <div className="mode-switch" role="group" aria-label="Game mode">
          <button
            className={`btn ${mode === 'pvp' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => changeMode('pvp')}
          >
            Two Players
          </button>
          <button
            className={`btn ${mode === 'ai' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => changeMode('ai')}
          >
            Play vs Computer
          </button>
        </div>
      </header>

      <main className="board-wrapper">
        <div className="status" role="status" aria-live="polite">{statusText}</div>
        <div className="board" role="grid" aria-label="Tic Tac Toe board">
          {board.map((value, idx) => {
            const highlight = winnerInfo?.line?.includes(idx);
            return (
              <button
                key={idx}
                role="gridcell"
                aria-label={`Cell ${idx + 1}${value ? `, ${value}` : ''}`}
                className={`cell ${highlight ? 'cell-win' : ''}`}
                onClick={() => handleSquareClick(idx)}
                disabled={!!winnerInfo || !!value}
              >
                {value}
              </button>
            );
          })}
        </div>
      </main>

      <footer className="controls">
        <button className="btn btn-primary" onClick={resetBoard}>Restart Round</button>
        <button className="btn btn-secondary" onClick={resetScores}>Reset Scores</button>
      </footer>
    </div>
  );
}
