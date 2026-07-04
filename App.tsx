import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Dimensions } from 'react-native';
import { checkWinner, getAIMove, Board, Player, Difficulty } from './src/ai/minimax';

const { width } = Dimensions.get('window');
const boardSize = Math.min(width * 0.9, 400);
const cellSize = (boardSize - 48) / 3;

export default function App() {
  const [board, setBoard] = useState<Board>(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState<Player>('X');
  const [gameActive, setGameActive] = useState(true);
  const [scores, setScores] = useState({ X: 0, O: 0 });
  const [difficulty, setDifficulty] = useState<Difficulty>('Medium');

  const aiPlayer = 'O';
  const humanPlayer = 'X';

  useEffect(() => {
    // If it's the AI's turn, calculate move
    if (currentPlayer === aiPlayer && gameActive) {
      // Add slight delay for realistic feel
      const timer = setTimeout(() => {
        makeAiMove();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [currentPlayer, gameActive]);

  const makeAiMove = () => {
    const aiMove = getAIMove(board, aiPlayer, humanPlayer, difficulty);
    if (aiMove !== -1) {
      handleMove(aiMove, aiPlayer);
    }
  };

  const handleCellClick = (index: number) => {
    if (board[index] !== null || !gameActive || currentPlayer !== humanPlayer) return;
    handleMove(index, humanPlayer);
  };

  const handleMove = (index: number, player: Player) => {
    const newBoard = [...board];
    newBoard[index] = player;
    setBoard(newBoard);

    const winner = checkWinner(newBoard);
    if (winner) {
      setGameActive(false);
      if (winner !== 'Tie') {
        setScores((prev) => ({ ...prev, [winner]: prev[winner as keyof typeof prev] + 1 }));
      }
    } else {
      setCurrentPlayer(player === 'X' ? 'O' : 'X');
    }
  };

  const resetGame = () => {
    setBoard(Array(9).fill(null));
    setCurrentPlayer('X');
    setGameActive(true);
  };

  const renderCell = (index: number) => {
    const value = board[index];
    return (
      <TouchableOpacity
        key={index}
        style={styles.cell}
        onPress={() => handleCellClick(index)}
        activeOpacity={0.7}
      >
        <Text style={[styles.cellText, value === 'X' ? styles.neonX : styles.neonO]}>
          {value}
        </Text>
      </TouchableOpacity>
    );
  };

  const winner = checkWinner(board);
  let statusMessage = `${currentPlayer}'s Turn`;
  if (!gameActive) {
    if (winner === 'Tie') statusMessage = "It's a Draw!";
    else statusMessage = `${winner} Wins!`;
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      <View style={styles.header}>
        <Text style={styles.headerTitle}>NEON TIC-TAC-TOE</Text>
      </View>

      <View style={styles.scoreBoard}>
        <View style={[styles.scoreCard, currentPlayer === 'X' && styles.scoreCardActive]}>
          <Text style={styles.scoreLabel}>PLAYER X (YOU)</Text>
          <Text style={[styles.scoreValue, styles.neonX]}>{scores.X}</Text>
        </View>
        <View style={[styles.scoreCard, currentPlayer === 'O' && styles.scoreCardActive]}>
          <Text style={styles.scoreLabel}>PLAYER O (AI)</Text>
          <Text style={[styles.scoreValue, styles.neonO]}>{scores.O}</Text>
        </View>
      </View>

      <View style={styles.statusBanner}>
        <Text style={[styles.statusText, winner === 'X' ? styles.neonX : (winner === 'O' ? styles.neonO : null)]}>
          {statusMessage}
        </Text>
      </View>

      <View style={styles.board}>
        {board.map((_, index) => renderCell(index))}
      </View>

      <View style={styles.actionArea}>
        <View style={styles.difficultyContainer}>
          {(['Easy', 'Medium', 'Hard'] as Difficulty[]).map((level) => (
            <TouchableOpacity 
              key={level} 
              style={[styles.difficultyButton, difficulty === level && styles.difficultyButtonActive]}
              onPress={() => {
                setDifficulty(level);
                resetGame();
                setScores({ X: 0, O: 0 });
              }}
              activeOpacity={0.7}
            >
              <Text style={[styles.difficultyText, difficulty === level && styles.difficultyTextActive]}>{level}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.resetButton} onPress={resetGame} activeOpacity={0.8}>
          <Text style={styles.resetButtonText}>RESET GAME</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#131313',
    alignItems: 'center',
    paddingTop: 60,
  },
  header: {
    marginBottom: 30,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#e1fdff',
    letterSpacing: -0.5,
  },
  scoreBoard: {
    flexDirection: 'row',
    width: boardSize,
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  scoreCard: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginHorizontal: 8,
    opacity: 0.4,
  },
  scoreCardActive: {
    opacity: 1,
    borderLeftWidth: 4,
    borderLeftColor: '#00dbe7',
  },
  scoreLabel: {
    color: '#b9cacb',
    fontSize: 12,
    fontWeight: '600',
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  scoreValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  neonX: {
    color: '#00dbe7',
    textShadowColor: 'rgba(0, 219, 231, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  neonO: {
    color: '#fface8',
    textShadowColor: 'rgba(255, 172, 232, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  statusBanner: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 24,
    marginBottom: 30,
  },
  statusText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#e1fdff',
  },
  board: {
    width: boardSize,
    height: boardSize,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
    padding: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  cell: {
    width: cellSize,
    height: cellSize,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cellText: {
    fontSize: 48,
    fontWeight: '800',
  },
  actionArea: {
    marginTop: 40,
    width: boardSize,
  },
  resetButton: {
    backgroundColor: '#00f2ff',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#00dbe7',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 15,
  },
  resetButtonText: {
    color: '#00363a',
    fontSize: 18,
    fontWeight: '700',
  },
  difficultyContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
    gap: 10,
  },
  difficultyButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    backgroundColor: 'transparent',
  },
  difficultyButtonActive: {
    backgroundColor: 'rgba(0, 219, 231, 0.2)',
    borderColor: '#00dbe7',
  },
  difficultyText: {
    color: '#b9cacb',
    fontSize: 14,
    fontWeight: '600',
  },
  difficultyTextActive: {
    color: '#00dbe7',
    textShadowColor: 'rgba(0, 219, 231, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 5,
  }
});
