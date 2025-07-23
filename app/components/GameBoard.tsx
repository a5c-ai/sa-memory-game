'use client';

import { useState, useEffect, useMemo } from 'react';
import Card from './Card';
import { Card as CardType, Difficulty, DIFFICULTY_CONFIGS, EmojiCategory } from '../types/game';

// Sample emoji categories for demo
const EMOJI_CATEGORIES: EmojiCategory[] = [
  {
    id: 'food',
    name: 'Food & Drink',
    emojis: ['🍎', '🍌', '🍇', '🍊', '🍋', '🍉', '🍓', '🥝', '🍑', '🍒', '🥭', '🍍', '🥥', '🥑', '🍆', '🥒', '🥕', '🌽', '🌶️', '🥔', '🍠', '🥐', '🍞', '🥖', '🥨', '🧀', '🥚', '🍳', '🧈', '🥞', '🧇', '🥓', '🥩', '🍗', '🍖', '🌭', '🍔', '🍟', '🍕'],
    description: 'Delicious foods and beverages'
  },
  {
    id: 'animals',
    name: 'Animals',
    emojis: ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', '🐤', '🐣', '🐥', '🦆', '🦉', '🦅', '🦋', '🐛', '🐝', '🐞', '🐌', '🦗', '🕷️', '🦂', '🐢', '🐍', '🦎', '🐙', '🦑', '🦐', '🦀', '🐡', '🐠', '🐟'],
    description: 'Cute animals and creatures'
  },
  {
    id: 'nature',
    name: 'Nature',
    emojis: ['🌸', '🌺', '🌻', '🌷', '🌹', '🥀', '🌿', '🍀', '🍃', '🌱', '🌳', '🌲', '🌴', '🌵', '🌾', '🌼', '💐', '🌙', '⭐', '🌟', '💫', '⚡', '🌈', '☀️', '⛅', '☁️', '🌤️', '⛈️', '🌦️', '🌧️', '❄️', '☃️', '⛄', '🌊', '💧', '🔥', '🌍', '🌎', '🌏', '🌋', '🏔️', '⛰️'],
    description: 'Beautiful nature and weather'
  }
];

interface GameBoardProps {
  difficulty?: Difficulty;
  category?: EmojiCategory;
}

export default function GameBoard({
  difficulty = 'easy',
  category = EMOJI_CATEGORIES[0]
}: GameBoardProps) {
  const [cards, setCards] = useState<CardType[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [matchedPairs, setMatchedPairs] = useState<Set<number>>(new Set());
  const [moves, setMoves] = useState(0);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [disabled, setDisabled] = useState(false);

  const config = DIFFICULTY_CONFIGS[difficulty];

  // Initialize the game board
  const initializeBoard = useMemo(() => {
    const { pairs } = config;
    const availableEmojis = category.emojis.slice(0, pairs);
    
    // Create pairs of cards
    const cardPairs: CardType[] = [];
    availableEmojis.forEach((emoji, index) => {
      // First card of the pair
      cardPairs.push({
        id: index * 2,
        emoji,
        isFlipped: false,
        isMatched: false,
        pairId: index
      });
      
      // Second card of the pair
      cardPairs.push({
        id: index * 2 + 1,
        emoji,
        isFlipped: false,
        isMatched: false,
        pairId: index
      });
    });

    // Shuffle the cards using Fisher-Yates algorithm
    const shuffledCards = [...cardPairs];
    for (let i = shuffledCards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledCards[i], shuffledCards[j]] = [shuffledCards[j], shuffledCards[i]];
    }

    // Update IDs to match positions after shuffle
    shuffledCards.forEach((card, index) => {
      card.id = index;
    });

    return shuffledCards;
  }, [category, config]);

  // Reset game when difficulty or category changes
  useEffect(() => {
    setCards(initializeBoard);
    setFlippedCards([]);
    setMatchedPairs(new Set());
    setMoves(0);
    setGameCompleted(false);
    setDisabled(false);
  }, [initializeBoard]);

  // Handle card click
  const handleCardClick = (cardId: number) => {
    if (disabled || flippedCards.length >= 2) return;

    const newFlippedCards = [...flippedCards, cardId];
    setFlippedCards(newFlippedCards);

    // Update card flip state
    setCards(prevCards =>
      prevCards.map(card =>
        card.id === cardId ? { ...card, isFlipped: true } : card
      )
    );

    // Check for match when two cards are flipped
    if (newFlippedCards.length === 2) {
      setDisabled(true);
      setMoves(prevMoves => prevMoves + 1);

      const [firstCardId, secondCardId] = newFlippedCards;
      const firstCard = cards.find(card => card.id === firstCardId);
      const secondCard = cards.find(card => card.id === secondCardId);

      if (firstCard && secondCard && firstCard.pairId === secondCard.pairId) {
        // Match found
        setTimeout(() => {
          setCards(prevCards =>
            prevCards.map(card =>
              card.id === firstCardId || card.id === secondCardId
                ? { ...card, isMatched: true }
                : card
            )
          );
          setMatchedPairs(prev => new Set([...prev, firstCard.pairId]));
          setFlippedCards([]);
          setDisabled(false);
        }, 500);
      } else {
        // No match - flip cards back
        setTimeout(() => {
          setCards(prevCards =>
            prevCards.map(card =>
              card.id === firstCardId || card.id === secondCardId
                ? { ...card, isFlipped: false }
                : card
            )
          );
          setFlippedCards([]);
          setDisabled(false);
        }, 1000);
      }
    }
  };

  // Check for game completion
  useEffect(() => {
    if (matchedPairs.size === config.pairs && matchedPairs.size > 0) {
      setGameCompleted(true);
    }
  }, [matchedPairs, config.pairs]);

  const gridCols = config.cols;
  const gridStyle = {
    gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      {/* Game Stats */}
      <div className="flex justify-between items-center mb-6 text-lg font-semibold">
        <div>Moves: {moves}</div>
        <div>Difficulty: <span className="capitalize">{difficulty}</span></div>
        <div>Matches: {matchedPairs.size}/{config.pairs}</div>
      </div>

      {/* Game Board */}
      <div
        className="grid gap-2 sm:gap-3 md:gap-4 w-full"
        style={gridStyle}
        role="grid"
        aria-label={`Memory game board with ${config.pairs} pairs of ${category.name} emojis`}
      >
        {cards.map((card) => (
          <Card
            key={card.id}
            card={card}
            onClick={handleCardClick}
            disabled={disabled}
          />
        ))}
      </div>

      {/* Game Completion Message */}
      {gameCompleted && (
        <div className="mt-6 text-center">
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg">
            <h3 className="text-xl font-bold mb-2">🎉 Congratulations!</h3>
            <p>You completed the game in {moves} moves!</p>
            <button
              onClick={() => {
                setCards(initializeBoard);
                setFlippedCards([]);
                setMatchedPairs(new Set());
                setMoves(0);
                setGameCompleted(false);
                setDisabled(false);
              }}
              className="mt-3 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition-colors"
            >
              Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}