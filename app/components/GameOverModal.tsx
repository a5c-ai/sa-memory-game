'use client';

import { useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { GameState } from '../types/game';
import { calculateScoreBreakdown, formatTime, formatScore, getScoreGrade, calculateEfficiencyRating } from '../utils/scoring';
import { useLocalStorage } from '../hooks/useLocalStorage';

interface GameOverModalProps {
  gameState: GameState;
  isOpen: boolean;
  onClose: () => void;
  onPlayAgain: () => void;
  onChangeDifficulty: () => void;
}

export default function GameOverModal({
  gameState,
  isOpen,
  onClose,
  onPlayAgain,
  onChangeDifficulty
}: GameOverModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const { isPersonalBest, getDifficultyStats } = useLocalStorage();

  // Calculate score breakdown and statistics
  const scoreBreakdown = calculateScoreBreakdown(
    gameState.difficulty,
    gameState.timeElapsed,
    gameState.moves,
    gameState.matchedPairs.length,
    gameState.gameStatus === 'completed'
  );

  const efficiencyRating = calculateEfficiencyRating(
    gameState.difficulty,
    gameState.timeElapsed,
    gameState.moves
  );

  const grade = getScoreGrade(efficiencyRating);
  const personalBests = isPersonalBest(gameState.difficulty, gameState.moves, gameState.timeElapsed);
  const difficultyStats = getDifficultyStats(gameState.difficulty);

  // Focus management
  useEffect(() => {
    if (isOpen && closeButtonRef.current) {
      closeButtonRef.current.focus();
    }
  }, [isOpen]);

  // Keyboard event handler
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!isOpen) return;

    if (event.key === 'Escape') {
      event.preventDefault();
      onClose();
    }

    // Tab trapping
    if (event.key === 'Tab') {
      const modal = modalRef.current;
      if (!modal) return;

      const focusableElements = modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstFocusable = focusableElements[0] as HTMLElement;
      const lastFocusable = focusableElements[focusableElements.length - 1] as HTMLElement;

      if (event.shiftKey) {
        if (document.activeElement === firstFocusable) {
          event.preventDefault();
          lastFocusable.focus();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          event.preventDefault();
          firstFocusable.focus();
        }
      }
    }
  }, [isOpen, onClose]);

  // Add/remove event listeners
  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
      
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.body.style.overflow = '';
      };
    }
  }, [isOpen, handleKeyDown]);

  // Handle backdrop click
  const handleBackdropClick = useCallback((event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  }, [onClose]);

  if (!isOpen) return null;

  const modal = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-300"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      <div
        ref={modalRef}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-300"
      >
        {/* Header */}
        <div className="text-center mb-6">
          <h2 id="modal-title" className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            🎉 Game Complete!
          </h2>
          <p id="modal-description" className="text-gray-600 dark:text-gray-300">
            Well done! Here are your results:
          </p>
        </div>

        {/* Score and Grade Display */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full text-white text-3xl font-bold mb-3">
            {grade}
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
            {formatScore(scoreBreakdown.totalScore)} pts
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Efficiency: {efficiencyRating}%
          </div>
        </div>

        {/* Game Statistics */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 mb-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Game Summary</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-gray-600 dark:text-gray-400">Time</div>
              <div className="font-semibold text-gray-900 dark:text-white flex items-center">
                {formatTime(gameState.timeElapsed)}
                {personalBests.time && <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">PB!</span>}
              </div>
            </div>
            <div>
              <div className="text-gray-600 dark:text-gray-400">Moves</div>
              <div className="font-semibold text-gray-900 dark:text-white flex items-center">
                {gameState.moves}
                {personalBests.moves && <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">PB!</span>}
              </div>
            </div>
            <div>
              <div className="text-gray-600 dark:text-gray-400">Difficulty</div>
              <div className="font-semibold text-gray-900 dark:text-white capitalize">
                {gameState.difficulty}
              </div>
            </div>
            <div>
              <div className="text-gray-600 dark:text-gray-400">Category</div>
              <div className="font-semibold text-gray-900 dark:text-white">
                {gameState.category.name}
              </div>
            </div>
          </div>
        </div>

        {/* Score Breakdown */}
        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 mb-6">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Score Breakdown</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Base Score</span>
              <span className="font-semibold text-gray-900 dark:text-white">{formatScore(scoreBreakdown.baseScore)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Difficulty Bonus</span>
              <span className="font-semibold text-gray-900 dark:text-white">+{formatScore(scoreBreakdown.difficultyBonus)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Time Bonus</span>
              <span className="font-semibold text-gray-900 dark:text-white">+{formatScore(scoreBreakdown.timeBonus)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Move Efficiency</span>
              <span className={`font-semibold ${scoreBreakdown.moveEfficiency >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {scoreBreakdown.moveEfficiency >= 0 ? '+' : ''}{formatScore(scoreBreakdown.moveEfficiency)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600 dark:text-gray-400">Completion Bonus</span>
              <span className="font-semibold text-gray-900 dark:text-white">+{formatScore(scoreBreakdown.completionBonus)}</span>
            </div>
            {scoreBreakdown.perfectBonus > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Perfect Game!</span>
                <span className="font-semibold text-yellow-600">+{formatScore(scoreBreakdown.perfectBonus)}</span>
              </div>
            )}
            <div className="border-t border-gray-200 dark:border-gray-600 pt-2 mt-2">
              <div className="flex justify-between font-bold">
                <span className="text-gray-900 dark:text-white">Total Score</span>
                <span className="text-gray-900 dark:text-white">{formatScore(scoreBreakdown.totalScore)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Personal Bests Comparison */}
        {difficultyStats.gamesPlayed > 0 && (
          <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 mb-6">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Your Records ({gameState.difficulty})</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-gray-600 dark:text-gray-400">Best Time</div>
                <div className="font-semibold text-gray-900 dark:text-white">
                  {formatTime(difficultyStats.bestTime)}
                </div>
              </div>
              <div>
                <div className="text-gray-600 dark:text-gray-400">Best Moves</div>
                <div className="font-semibold text-gray-900 dark:text-white">
                  {difficultyStats.bestMoves}
                </div>
              </div>
              <div>
                <div className="text-gray-600 dark:text-gray-400">Games Played</div>
                <div className="font-semibold text-gray-900 dark:text-white">
                  {difficultyStats.gamesPlayed}
                </div>
              </div>
              <div>
                <div className="text-gray-600 dark:text-gray-400">High Score</div>
                <div className="font-semibold text-gray-900 dark:text-white">
                  {formatScore(difficultyStats.highestScore)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <button
            ref={closeButtonRef}
            onClick={onPlayAgain}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-xl transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            aria-label="Play again with same settings"
          >
            🎮 Play Again
          </button>
          <button
            onClick={onChangeDifficulty}
            className="w-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-900 dark:text-white font-semibold py-3 px-4 rounded-xl transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            aria-label="Change difficulty and start new game"
          >
            ⚙️ Change Settings
          </button>
          <button
            onClick={onClose}
            className="w-full text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-semibold py-2 px-4 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 rounded-xl"
            aria-label="Close modal"
          >
            ❌ Close
          </button>
        </div>
      </div>
    </div>
  );

  // Use portal to render modal at document body level
  return createPortal(modal, document.body);
}