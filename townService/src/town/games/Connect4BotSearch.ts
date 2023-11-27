import { Connect4GridPosition } from '../../types/CoveyTownSocket';

export type ScoreList = {
  [key: number]: number;
};

function isValidMove(brd: string[][], move: number) {
  return brd[0][move] === '';
}

function applyMove(brd: string[][], move: number, p: string): string[][] {
  const newBoard = brd.map(r => r.slice());
  for (let i = 5; i >= 0; i--) {
    if (newBoard[i][move] === '') {
      newBoard[i][move] = p;
      break;
    }
  }
  return newBoard;
}

function getWinner(board: string[][]): number {
  // A game ends when there are 4 in a row, column, or diagonal

  // lambda functions to check for each win condition
  const cH = (r: number, c: number) =>
    board[r][c] === board[r][c + 1] &&
    board[r][c] === board[r][c + 2] &&
    board[r][c] === board[r][c + 3];

  const cV = (r: number, c: number) =>
    board[r][c] === board[r + 1][c] &&
    board[r][c] === board[r + 2][c] &&
    board[r][c] === board[r + 3][c];

  const cDL = (r: number, c: number) =>
    board[r][c] === board[r + 1][c - 1] &&
    board[r][c] === board[r + 2][c - 2] &&
    board[r][c] === board[r + 3][c - 3];

  const cDR = (r: number, c: number) =>
    board[r][c] === board[r + 1][c + 1] &&
    board[r][c] === board[r + 2][c + 2] &&
    board[r][c] === board[r + 3][c + 3];

  // create a 'checking matrix' which defines functions to be applied to each spot of the board to check for winner
  // for example, spot (0,0) must be checked horizontally, vertically, and diagonally to the right
  const checkMat = [
    [
      [cH, cV, cDR],
      [cH, cV, cDR],
      [cH, cV, cDR],
      [cH, cV, cDR, cDL],
      [cV, cDL],
      [cV, cDL],
      [cV, cDL],
    ],
    [
      [cH, cV, cDR],
      [cH, cV, cDR],
      [cH, cV, cDR],
      [cH, cV, cDR, cDL],
      [cV, cDL],
      [cV, cDL],
      [cV, cDL],
    ],
    [
      [cH, cV, cDR],
      [cH, cV, cDR],
      [cH, cV, cDR],
      [cH, cV, cDR, cDL],
      [cV, cDL],
      [cV, cDL],
      [cV, cDL],
    ],
    [[cH], [cH], [cH], [cH], [], [], []],
    [[cH], [cH], [cH], [cH], [], [], []],
    [[cH], [cH], [cH], [cH], [], [], []],
  ];

  let tie = true;
  for (let i = 0; i < board.length; i++) {
    for (let j = 0; j < board[0].length; j++) {
      // get the calculations for each column
      // if at least one is true, update the winner and return
      let isWinner = false;
      checkMat[i][j].forEach(fun => {
        isWinner = isWinner || (fun(i, j) && board[i][j] !== '');
      });
      if (isWinner) {
        return board[i][j] === 'Red' ? 1 : -1;
      }
      if (board[i][j] === '') {
        tie = false;
      }
    }
  }

  // Check for tie;
  if (tie) {
    return 0;
  }
  return -2;
}

function minimax(
  board: string[][],
  depth: number,
  player: 'Yellow' | 'Red',
  isMaximizing: boolean,
  alpha: number,
  beta: number,
): number {
  // return a score of 10 if you win, -10 if you lose, or 0 if you tie
  const winner = getWinner(board);
  if (winner !== -2) {
    const multiplier = player === 'Red' ? 1 : -1;
    return winner * 10 * multiplier;
  }

  // if depth is 0, return 0
  if (depth === 0) {
    return 0;
  }

  if (isMaximizing) {
    let best = -Infinity;
    for (let i = 0; i < 7; i++) {
      if (isValidMove(board, i)) {
        const newBoard = applyMove(board, i, player === 'Red' ? 'Red' : 'Yellow');
        best = Math.max(best, minimax(newBoard, depth - 1, player, !isMaximizing, alpha, beta));
        alpha = Math.max(alpha, best);
        if (alpha >= beta) {
          break;
        }
      }
    }
    return best;
  }
  let worst = Infinity;
  for (let i = 0; i < 7; i++) {
    if (isValidMove(board, i)) {
      const newBoard = applyMove(board, i, player === 'Red' ? 'Yellow' : 'Red');
      worst = Math.min(worst, minimax(newBoard, depth - 1, player, !isMaximizing, alpha, beta));
      beta = Math.min(beta, worst);
      if (beta <= alpha) {
        break;
      }
    }
  }
  return worst;
}

/**
 * Return an object which contains each possible move for the player
 * and a score for how good the move is.
 * @param board Board of the connect 4 game, which each space represented as strings.
 */
export function getMoveScores(board: string[][], player: 'Yellow' | 'Red'): ScoreList {
  const scores: ScoreList = {};
  for (let i: Connect4GridPosition = 0; i < 7; i++) {
    if (isValidMove(board, i)) {
      const newBoard = applyMove(board, i, player);
      scores[i] = minimax(newBoard, 4, player, false, -Infinity, Infinity);
    }
  }
  return scores;
}
