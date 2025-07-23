'use client';

import { Card as CardType } from '../types/game';

interface CardProps {
  card: CardType;
  onClick: (cardId: number) => void;
  disabled?: boolean;
}

export default function Card({ card, onClick, disabled = false }: CardProps) {
  const handleClick = () => {
    if (!disabled && !card.isFlipped && !card.isMatched) {
      onClick(card.id);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ' ') && !disabled && !card.isFlipped && !card.isMatched) {
      e.preventDefault();
      onClick(card.id);
    }
  };

  return (
    <div
      className={`
        relative w-full aspect-square cursor-pointer select-none
        transition-transform duration-300 ease-in-out
        transform-style-preserve-3d
        ${card.isFlipped || card.isMatched ? 'rotate-y-180' : ''}
        ${disabled ? 'cursor-not-allowed opacity-75' : 'hover:scale-105'}
        ${card.isMatched ? 'animate-pulse-once' : ''}
      `}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={disabled || card.isFlipped || card.isMatched ? -1 : 0}
      role="button"
      aria-label={
        card.isMatched 
          ? `Matched card: ${card.emoji}`
          : card.isFlipped 
            ? `Flipped card: ${card.emoji}`
            : `Memory card ${card.id + 1}, click to flip`
      }
      aria-pressed={card.isFlipped || card.isMatched}
    >
      {/* Card Back */}
      <div
        className={`
          absolute inset-0 w-full h-full rounded-lg
          bg-gradient-to-br from-blue-500 to-purple-600
          border-2 border-white/20 shadow-lg
          flex items-center justify-center
          backface-hidden
          ${card.isFlipped || card.isMatched ? 'rotate-y-180' : ''}
        `}
      >
        <div className="text-white text-2xl font-bold">?</div>
      </div>

      {/* Card Front */}
      <div
        className={`
          absolute inset-0 w-full h-full rounded-lg
          bg-white border-2 border-gray-200 shadow-lg
          flex items-center justify-center
          backface-hidden rotate-y-180
          ${card.isMatched ? 'bg-green-100 border-green-300' : ''}
          ${card.isFlipped || card.isMatched ? '' : 'rotate-y-180'}
        `}
      >
        <div className="text-4xl" role="img" aria-label={`Emoji ${card.emoji}`}>
          {card.emoji}
        </div>
      </div>
    </div>
  );
}