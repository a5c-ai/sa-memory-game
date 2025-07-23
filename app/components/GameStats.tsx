'use client';

import { useMemo } from 'react';
import { Difficulty, DIFFICULTY_CONFIGS } from '../types/game';

interface GameStatsProps {
  timeElapsed: number;
  moves: number;
  score: number;
  matchedPairs: number;
  difficulty: Difficulty;
  gameStatus: 'setup' | 'playing' | 'paused' | 'completed';
}

export default function GameStats({
  timeElapsed,
  moves,
  score,
  matchedPairs,
  difficulty,
  gameStatus
}: GameStatsProps) {
  // Format time as MM:SS
  const formattedTime = useMemo(() => {
    const minutes = Math.floor(timeElapsed / 60);
    const seconds = timeElapsed % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }, [timeElapsed]);

  // Calculate progress percentage
  const progress = useMemo(() => {
    const totalPairs = DIFFICULTY_CONFIGS[difficulty].pairs;
    return totalPairs > 0 ? (matchedPairs / totalPairs) * 100 : 0;
  }, [matchedPairs, difficulty]);

  const totalPairs = DIFFICULTY_CONFIGS[difficulty].pairs;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-white/60 rounded-lg backdrop-blur-sm shadow-sm">
      {/* Timer */}
      <div className="text-center">
        <div className="text-2xl font-mono font-bold text-gray-800 mb-1">
          {formattedTime}
        </div>
        <div className="text-xs text-gray-600 uppercase tracking-wide font-medium">
          Time
        </div>
      </div>

      {/* Moves Counter */}
      <div className="text-center">
        <div className="text-2xl font-bold text-gray-800 mb-1">
          {moves}
        </div>
        <div className="text-xs text-gray-600 uppercase tracking-wide font-medium">
          Moves
        </div>
      </div>

      {/* Progress/Pairs */}
      <div className="text-center">
        <div className="text-2xl font-bold text-gray-800 mb-1">
          {matchedPairs}/{totalPairs}
        </div>
        <div className="text-xs text-gray-600 uppercase tracking-wide font-medium">
          Pairs
        </div>
        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-1.5 mt-2">
          <div 
            className="bg-green-500 h-1.5 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
            role="progressbar"
            aria-valuenow={progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Game progress: ${matchedPairs} of ${totalPairs} pairs matched`}
          />
        </div>
      </div>

      {/* Score */}
      <div className="text-center">
        <div className="text-2xl font-bold text-gray-800 mb-1">
          {score.toLocaleString()}
        </div>
        <div className="text-xs text-gray-600 uppercase tracking-wide font-medium">
          Score
        </div>
      </div>

      {/* Mobile: Additional Status Row */}
      <div className="col-span-2 lg:hidden flex items-center justify-center gap-4 pt-2 border-t border-gray-200">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <div className={`w-2 h-2 rounded-full ${
            gameStatus === 'playing' ? 'bg-green-500 animate-pulse' :
            gameStatus === 'paused' ? 'bg-yellow-500' :
            gameStatus === 'completed' ? 'bg-blue-500' :
            'bg-gray-400'
          }`} />
          <span className="font-medium capitalize">
            {gameStatus === 'setup' ? 'Ready' : gameStatus}
          </span>
        </div>
        <div className="text-sm text-gray-600">
          <span className="font-medium capitalize">{difficulty}</span> Mode
        </div>
      </div>
    </div>
  );
}