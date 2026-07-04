export type Player = 'X' | 'O' | null;
export type Board = Player[];

export function checkWinner(board: Board): Player | 'Tie' | null {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ];

  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }

  if (!board.includes(null)) {
    return 'Tie';
  }

  return null;
}

export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export function getAIMove(board: Board, aiPlayer: Player, humanPlayer: Player, difficulty: Difficulty): number {
  const emptyIndices = [];
  for (let i = 0; i < board.length; i++) {
    if (board[i] === null) emptyIndices.push(i);
  }
  if (emptyIndices.length === 0) return -1;

  if (difficulty === 'Easy') {
    return emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
  }

  if (difficulty === 'Medium') {
    // 50% chance to make a random move, 50% chance to make best move
    if (Math.random() < 0.5) {
      return emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
    }
  }

  return findBestMove(board, aiPlayer, humanPlayer);
}

export function findBestMove(board: Board, aiPlayer: Player, humanPlayer: Player): number {
  let bestScore = -Infinity;
  let move = -1;

  for (let i = 0; i < board.length; i++) {
    if (board[i] === null) {
      board[i] = aiPlayer;
      let score = minimax(board, 0, false, -Infinity, Infinity, aiPlayer, humanPlayer);
      board[i] = null;
      if (score > bestScore) {
        bestScore = score;
        move = i;
      }
    }
  }
  return move;
}

function minimax(
  board: Board,
  depth: number,
  isMaximizing: boolean,
  alpha: number,
  beta: number,
  aiPlayer: Player,
  humanPlayer: Player
): number {
  const result = checkWinner(board);
  if (result === aiPlayer) return 10 - depth;
  if (result === humanPlayer) return depth - 10;
  if (result === 'Tie') return 0;

  if (isMaximizing) {
    let bestScore = -Infinity;
    for (let i = 0; i < board.length; i++) {
      if (board[i] === null) {
        board[i] = aiPlayer;
        let score = minimax(board, depth + 1, false, alpha, beta, aiPlayer, humanPlayer);
        board[i] = null;
        bestScore = Math.max(score, bestScore);
        alpha = Math.max(alpha, score);
        if (beta <= alpha) break; // Alpha-beta pruning
      }
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    for (let i = 0; i < board.length; i++) {
      if (board[i] === null) {
        board[i] = humanPlayer;
        let score = minimax(board, depth + 1, true, alpha, beta, aiPlayer, humanPlayer);
        board[i] = null;
        bestScore = Math.min(score, bestScore);
        beta = Math.min(beta, score);
        if (beta <= alpha) break; // Alpha-beta pruning
      }
    }
    return bestScore;
  }
}
