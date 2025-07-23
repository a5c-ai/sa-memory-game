'use client';

import { useCallback } from 'react';
import { Difficulty, DIFFICULTY_CONFIGS } from '../types/game';

interface DifficultySelectorProps {
  selectedDifficulty: Difficulty;
  onChange: (difficulty: Difficulty) => void;
  disabled?: boolean;
}

const DIFFICULTY_LABELS: Record<Difficulty, { 
  name: string; 
  description: string; 
  icon: string;
  color: string;
}> = {
  easy: {
    name: 'Easy',
    description: '4×4 grid',
    icon: '🟢',
    color: 'bg-green-100 border-green-300 text-green-800 hover:bg-green-200'
  },
  medium: {
    name: 'Medium',
    description: '6×4 grid',
    icon: '🟡',
    color: 'bg-yellow-100 border-yellow-300 text-yellow-800 hover:bg-yellow-200'
  },
  hard: {
    name: 'Hard',
    description: '6×6 grid',
    icon: '🟠',
    color: 'bg-orange-100 border-orange-300 text-orange-800 hover:bg-orange-200'
  },
  expert: {
    name: 'Expert',
    description: '8×6 grid',
    icon: '🔴',
    color: 'bg-red-100 border-red-300 text-red-800 hover:bg-red-200'
  }
};

export default function DifficultySelector({
  selectedDifficulty,
  onChange,
  disabled = false
}: DifficultySelectorProps) {
  const handleDifficultyChange = useCallback((difficulty: Difficulty) => {
    if (!disabled && difficulty !== selectedDifficulty) {
      onChange(difficulty);
    }
  }, [onChange, selectedDifficulty, disabled]);

  return (
    <div className="space-y-3">
      <div className="text-sm font-medium text-gray-700 text-center">
        Choose Difficulty
      </div>
      
      {/* Desktop: Horizontal layout */}
      <div className="hidden sm:flex gap-2 justify-center">
        {(Object.keys(DIFFICULTY_CONFIGS) as Difficulty[]).map((difficulty) => {
          const config = DIFFICULTY_CONFIGS[difficulty];
          const label = DIFFICULTY_LABELS[difficulty];
          const isSelected = selectedDifficulty === difficulty;
          
          return (
            <button
              key={difficulty}
              onClick={() => handleDifficultyChange(difficulty)}
              disabled={disabled}
              className={`
                flex flex-col items-center p-3 rounded-lg border-2 transition-all duration-200 min-w-[100px]
                ${isSelected 
                  ? `${label.color} border-opacity-100 shadow-md scale-105` 
                  : `bg-white border-gray-200 text-gray-600 hover:border-gray-300 ${!disabled ? 'hover:shadow-sm' : ''}`
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
              `}
              aria-label={`Select ${label.name} difficulty: ${config.rows}×${config.cols} grid with ${config.pairs} pairs`}
              aria-pressed={isSelected}
            >
              <div className="text-xl mb-1">{label.icon}</div>
              <div className="font-medium text-sm">{label.name}</div>
              <div className="text-xs opacity-75">{label.description}</div>
              <div className="text-xs opacity-75 mt-1">{config.pairs} pairs</div>
            </button>
          );
        })}
      </div>

      {/* Mobile: Vertical layout */}
      <div className="sm:hidden space-y-2">
        {(Object.keys(DIFFICULTY_CONFIGS) as Difficulty[]).map((difficulty) => {
          const config = DIFFICULTY_CONFIGS[difficulty];
          const label = DIFFICULTY_LABELS[difficulty];
          const isSelected = selectedDifficulty === difficulty;
          
          return (
            <button
              key={difficulty}
              onClick={() => handleDifficultyChange(difficulty)}
              disabled={disabled}
              className={`
                flex items-center justify-between w-full p-3 rounded-lg border-2 transition-all duration-200
                ${isSelected 
                  ? `${label.color} border-opacity-100 shadow-md` 
                  : `bg-white border-gray-200 text-gray-600 hover:border-gray-300 ${!disabled ? 'hover:shadow-sm' : ''}`
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
              `}
              aria-label={`Select ${label.name} difficulty: ${config.rows}×${config.cols} grid with ${config.pairs} pairs`}
              aria-pressed={isSelected}
            >
              <div className="flex items-center gap-3">
                <div className="text-xl">{label.icon}</div>
                <div>
                  <div className="font-medium text-sm text-left">{label.name}</div>
                  <div className="text-xs opacity-75 text-left">{label.description}</div>
                </div>
              </div>
              <div className="text-xs opacity-75">{config.pairs} pairs</div>
            </button>
          );
        })}
      </div>

      {/* Additional Info */}
      <div className="text-xs text-gray-500 text-center mt-2">
        {DIFFICULTY_CONFIGS[selectedDifficulty].pairs} emoji pairs to match
      </div>
    </div>
  );
}