import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Tic Tac Toe title and controls', () => {
  render(<App />);
  expect(screen.getByText(/Tic Tac Toe/i)).toBeInTheDocument();
  // Mode buttons removed; ensure core controls exist
  expect(screen.getByRole('button', { name: /Restart Round/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /Reset Scores/i })).toBeInTheDocument();
});
