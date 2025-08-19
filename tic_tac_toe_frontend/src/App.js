import React, { useEffect, useMemo, useState } from 'react';
import './App.css';

/**
 * Minimal Tic Tac Toe implementation (Two-player only).
 * - Human vs Human play only
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

  // Game state (two-player only)
  const [board, setBoard] = useState(Array(9).fill(null));
  const [xIsNext, setXIsNext] = useState(true);
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

  return (
    <div className="App">
      <header className="ttt-header">
        <h1 className="title">Tic Tac Toe</h1>
        <div className="scores">
          <div className="score chip chip-primary" aria-label="Score for X">X: {scores.X}</div>
          <div className="score chip chip-secondary" aria-label="Score for O">O: {scores.O}</div>
          <div className="score chip chip-accent" aria-label="Draws">Draws: {scores.Draws}</div>
        </div>
        {/* Mode switch removed: only two-player mode remains */}
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
                style={value === 'O' ? { color: '#000000' } : undefined}
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
