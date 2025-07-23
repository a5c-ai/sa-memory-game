'use client';

import { useState, useEffect } from 'react';
import Card from './Card';
import GameControls from './GameControls';
import GameStats from './GameStats';
import DifficultySelector from './DifficultySelector';
import CategorySelector from './CategorySelector';
import GameOverModal from './GameOverModal';
import { useGameState } from '../hooks/useGameState';
import { useTimer } from '../hooks/useTimer';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { Difficulty, EmojiCategory, DIFFICULTY_CONFIGS } from '../types/game';
import { getDefaultCategory } from '../utils/emojiData';

export default function GameBoard() {
  // Game state management
  const {
    gameState,
    startGame,
    flipCard,
    pauseGame,
    resumeGame,
    resetGame,
    updateTime,
    canFlipCard,
    isGameActive,
    isGameCompleted,
    isGamePaused,
    isCardFlippingInProgress
  } = useGameState();

  // Timer management
  const {
    timeElapsed,
    start: startTimer,
    pause: pauseTimer,
    resume: resumeTimer,
    reset: resetTimer,
    isRunning: isTimerRunning
  } = useTimer();

  // Local storage management
  const { updateGameStats } = useLocalStorage();

  // Local state for game configuration
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('easy');
  const [selectedCategory, setSelectedCategory] = useState<EmojiCategory>(getDefaultCategory());
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Sync timer with game state
  useEffect(() => {
    if (isGameActive && !isTimerRunning) {
      startTimer();
    } else if (isGamePaused && isTimerRunning) {
      pauseTimer();
    } else if (!isGameActive && isTimerRunning) {
      pauseTimer();
    }
  }, [isGameActive, isGamePaused, isTimerRunning, startTimer, pauseTimer]);

  // Update game state with timer
  useEffect(() => {
    updateTime(timeElapsed);
  }, [timeElapsed, updateTime]);

  // Handle game completion
  useEffect(() => {
    if (isGameCompleted && !isModalOpen) {
      // Save game statistics to local storage
      updateGameStats(
        gameState.difficulty,
        gameState.moves,
        gameState.timeElapsed,
        true, // won
        gameState.score,
        gameState.category.id
      );
      // Show modal after a brief delay for celebration effect
      setTimeout(() => setIsModalOpen(true), 1000);
    }
  }, [isGameCompleted, isModalOpen, gameState, updateGameStats]);

  // Game control handlers
  const handleStartGame = (difficulty: Difficulty, category: EmojiCategory) => {
    startGame(difficulty, category);
    resetTimer();
    startTimer();
  };

  const handlePauseGame = () => {
    pauseGame();
    pauseTimer();
  };

  const handleResumeGame = () => {
    resumeGame();
    resumeTimer();
  };

  const handleResetGame = () => {
    resetGame();
    resetTimer();
  };

  // Card click handler
  const handleCardClick = (cardId: number) => {
    if (canFlipCard(cardId)) {
      flipCard(cardId);
    }
  };

  // Modal handlers
  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handlePlayAgain = () => {
    setIsModalOpen(false);
    handleStartGame(gameState.difficulty, gameState.category);
  };

  const handleChangeDifficulty = () => {
    setIsModalOpen(false);
    handleResetGame();
  };

  const config = DIFFICULTY_CONFIGS[gameState.difficulty];

  const gridCols = config.cols;
  const gridStyle = {
    gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
  };


  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Game Configuration - Only show during setup */}
      {gameState.gameStatus === 'setup' && (
        <div className="grid lg:grid-cols-2 gap-6 p-6 bg-white/70 rounded-xl backdrop-blur-sm shadow-lg">
          <DifficultySelector
            selectedDifficulty={selectedDifficulty}
            onChange={setSelectedDifficulty}
            disabled={isGameActive || isGamePaused}
          />
          <CategorySelector
            selectedCategory={selectedCategory}
            onChange={setSelectedCategory}
            disabled={isGameActive || isGamePaused}
          />
        </div>
      )}

      {/* Game Stats */}
      <GameStats
        timeElapsed={gameState.timeElapsed}
        moves={gameState.moves}
        score={gameState.score}
        matchedPairs={gameState.matchedPairs.length}
        difficulty={gameState.difficulty}
        gameStatus={gameState.gameStatus}
      />

      {/* Game Controls */}
      <GameControls
        gameStatus={gameState.gameStatus}
        onStart={() => handleStartGame(selectedDifficulty, selectedCategory)}
        onPause={handlePauseGame}
        onResume={handleResumeGame}
        onReset={handleResetGame}
        difficulty={gameState.difficulty}
        category={gameState.category}
        isCardFlippingInProgress={isCardFlippingInProgress}
      />

      {/* Game Board */}
      {gameState.gameStatus !== 'setup' && (
        <div className="p-4 bg-white/70 rounded-xl backdrop-blur-sm shadow-lg">
          <div
            className="grid gap-2 sm:gap-3 md:gap-4 w-full"
            style={gridStyle}
            role="grid"
            aria-label={`Memory game board with ${config.pairs} pairs of ${gameState.category.name} emojis`}
          >
            {gameState.board.map((card) => (
              <Card
                key={card.id}
                card={card}
                onClick={handleCardClick}
                disabled={!canFlipCard(card.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Game Over Modal */}
      <GameOverModal
        gameState={gameState}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onPlayAgain={handlePlayAgain}
        onChangeDifficulty={handleChangeDifficulty}
      />
    </div>
  );
}