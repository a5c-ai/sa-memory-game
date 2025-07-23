'use client';

import { useCallback } from 'react';
import { Difficulty, EmojiCategory } from '../types/game';

interface GameControlsProps {
  gameStatus: 'setup' | 'playing' | 'paused' | 'completed';
  onStart: (difficulty: Difficulty, category: EmojiCategory) => void;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
  difficulty: Difficulty;
  category: EmojiCategory;
  isCardFlippingInProgress?: boolean;
}

export default function GameControls({
  gameStatus,
  onStart,
  onPause,
  onResume,
  onReset,
  difficulty,
  category,
  isCardFlippingInProgress = false
}: GameControlsProps) {
  const handleStart = useCallback(() => {
    onStart(difficulty, category);
  }, [onStart, difficulty, category]);

  const handlePause = useCallback(() => {
    onPause();
  }, [onPause]);

  const handleResume = useCallback(() => {
    onResume();
  }, [onResume]);

  const handleReset = useCallback(() => {
    if (window.confirm('Are you sure you want to reset the game? Your progress will be lost.')) {
      onReset();
    }
  }, [onReset]);

  const isGameInProgress = gameStatus === 'playing' || gameStatus === 'paused';
  const canPause = gameStatus === 'playing' && !isCardFlippingInProgress;
  const canResume = gameStatus === 'paused';

  return (
    <div className="flex flex-col sm:flex-row gap-3 justify-center items-center p-4 bg-white/50 rounded-lg backdrop-blur-sm shadow-sm">
      {/* Primary Action Button */}
      <div className="flex gap-2">
        {gameStatus === 'setup' || gameStatus === 'completed' ? (
          <button
            onClick={handleStart}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
            aria-label={gameStatus === 'setup' ? 'Start new game' : 'Start another game'}
          >
            {gameStatus === 'setup' ? 'Start Game' : 'Play Again'}
          </button>
        ) : canResume ? (
          <button
            onClick={handleResume}
            className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
            aria-label="Resume game"
          >
            Resume
          </button>
        ) : (
          <button
            onClick={handlePause}
            disabled={!canPause}
            className={`px-6 py-2 font-medium rounded-lg transition-colors duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-opacity-50 ${
              canPause
                ? 'bg-yellow-600 hover:bg-yellow-700 text-white hover:shadow-md focus:ring-yellow-500'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
            aria-label="Pause game"
          >
            Pause
          </button>
        )}
      </div>

      {/* Reset Button */}
      {isGameInProgress && (
        <button
          onClick={handleReset}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors duration-200 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
          aria-label="Reset game and start over"
        >
          Reset
        </button>
      )}

      {/* Game Status Indicator */}
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <div className={`w-2 h-2 rounded-full ${
          gameStatus === 'playing' ? 'bg-green-500' :
          gameStatus === 'paused' ? 'bg-yellow-500' :
          gameStatus === 'completed' ? 'bg-blue-500' :
          'bg-gray-400'
        }`} />
        <span className="capitalize font-medium">
          {gameStatus === 'setup' ? 'Ready to start' : 
           gameStatus === 'playing' ? 'Playing' :
           gameStatus === 'paused' ? 'Paused' : 'Completed'}
        </span>
      </div>
    </div>
  );
}