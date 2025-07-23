'use client';

import { useReducer, useCallback, useEffect } from 'react';
import { 
  GameState, 
  GameAction, 
  Difficulty, 
  EmojiCategory, 
  DIFFICULTY_CONFIGS
} from '../types/game';
import { createGameBoard, canFlipCard as canFlipCardUtil } from '../utils/gameLogic';
import { calculateGameScore } from '../utils/scoring';
import { getDefaultCategory } from '../utils/emojiData';

const initialGameState: GameState = {
  board: [],
  flippedCards: [],
  matchedPairs: [],
  moves: 0,
  timeElapsed: 0,
  gameStatus: 'setup',
  difficulty: 'easy',
  category: getDefaultCategory(),
  score: 0
};

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START_GAME': {
      const { difficulty, category } = action.payload || {};
      if (!difficulty || !category) return state;
      const board = createGameBoard(difficulty, category);
      return {
        ...state,
        board,
        flippedCards: [],
        matchedPairs: [],
        moves: 0,
        timeElapsed: 0,
        gameStatus: 'playing',
        difficulty,
        category,
        score: 0
      };
    }

    case 'FLIP_CARD': {
      const { cardId } = action.payload || {};
      if (cardId === undefined) return state;
      
      // Prevent flipping if game is not playing or card is already flipped/matched
      if (state.gameStatus !== 'playing') return state;
      
      const card = state.board.find(c => c.id === cardId);
      if (!card || card.isFlipped || card.isMatched) return state;
      
      // Prevent flipping more than 2 cards
      if (state.flippedCards.length >= 2) return state;

      const newFlippedCards = [...state.flippedCards, cardId];
      const newBoard = state.board.map(c =>
        c.id === cardId ? { ...c, isFlipped: true } : c
      );

      return {
        ...state,
        board: newBoard,
        flippedCards: newFlippedCards
      };
    }

    case 'MATCH_CARDS': {
      const { cardIds } = action.payload || {};
      if (!cardIds || cardIds.length !== 2) return state;
      const [firstCardId, secondCardId] = cardIds;
      
      const newBoard = state.board.map(card => {
        if (card.id === firstCardId || card.id === secondCardId) {
          return { ...card, isMatched: true, isFlipped: true };
        }
        return card;
      });

      const firstCard = state.board.find(c => c.id === firstCardId);
      const newMatchedPairs = firstCard ? [...state.matchedPairs, firstCard.pairId] : state.matchedPairs;
      const newMoves = state.moves + 1;
      
      // Check if game is completed
      const totalPairs = DIFFICULTY_CONFIGS[state.difficulty].pairs;
      const gameCompleted = newMatchedPairs.length === totalPairs;
      
      // Calculate score using the new scoring system
      const newScore = calculateGameScore(
        state.difficulty,
        state.timeElapsed,
        newMoves,
        newMatchedPairs.length,
        gameCompleted
      );

      return {
        ...state,
        board: newBoard,
        flippedCards: [],
        matchedPairs: newMatchedPairs,
        moves: newMoves,
        score: newScore,
        gameStatus: gameCompleted ? 'completed' : 'playing'
      };
    }

    case 'UNMATCH_CARDS': {
      const { cardIds } = action.payload || {};
      if (!cardIds || cardIds.length !== 2) return state;
      const [firstCardId, secondCardId] = cardIds;
      
      const newBoard = state.board.map(card => {
        if (card.id === firstCardId || card.id === secondCardId) {
          return { ...card, isFlipped: false };
        }
        return card;
      });

      return {
        ...state,
        board: newBoard,
        flippedCards: [],
        moves: state.moves + 1
      };
    }

    case 'PAUSE_GAME': {
      return {
        ...state,
        gameStatus: 'paused'
      };
    }

    case 'RESUME_GAME': {
      return {
        ...state,
        gameStatus: 'playing'
      };
    }

    case 'UPDATE_TIME': {
      const { timeElapsed } = action.payload || {};
      if (timeElapsed === undefined) return state;
      return {
        ...state,
        timeElapsed
      };
    }

    case 'RESET_GAME': {
      return {
        ...initialGameState,
        difficulty: state.difficulty,
        category: state.category
      };
    }

    case 'COMPLETE_GAME': {
      return {
        ...state,
        gameStatus: 'completed'
      };
    }

    default:
      return state;
  }
}


export function useGameState() {
  const [state, dispatch] = useReducer(gameReducer, initialGameState);

  const startGame = useCallback((difficulty: Difficulty, category: EmojiCategory) => {
    dispatch({
      type: 'START_GAME',
      payload: { difficulty, category }
    });
  }, []);

  const flipCard = useCallback((cardId: number) => {
    dispatch({
      type: 'FLIP_CARD',
      payload: { cardId }
    });
  }, []);

  const handleCardMatch = useCallback((cardIds: number[]) => {
    dispatch({
      type: 'MATCH_CARDS',
      payload: { cardIds }
    });
  }, []);

  const handleCardUnmatch = useCallback((cardIds: number[]) => {
    dispatch({
      type: 'UNMATCH_CARDS',
      payload: { cardIds }
    });
  }, []);

  const pauseGame = useCallback(() => {
    dispatch({ type: 'PAUSE_GAME' });
  }, []);

  const resumeGame = useCallback(() => {
    dispatch({ type: 'RESUME_GAME' });
  }, []);

  const resetGame = useCallback(() => {
    dispatch({ type: 'RESET_GAME' });
  }, []);

  const updateTime = useCallback((timeElapsed: number) => {
    dispatch({
      type: 'UPDATE_TIME',
      payload: { timeElapsed }
    });
  }, []);

  // Auto-handle card matching logic
  useEffect(() => {
    if (state.flippedCards.length === 2) {
      const [firstCardId, secondCardId] = state.flippedCards;
      const firstCard = state.board.find(c => c.id === firstCardId);
      const secondCard = state.board.find(c => c.id === secondCardId);

      if (firstCard && secondCard) {
        const isMatch = firstCard.pairId === secondCard.pairId;
        
        const timer = setTimeout(() => {
          if (isMatch) {
            handleCardMatch([firstCardId, secondCardId]);
          } else {
            handleCardUnmatch([firstCardId, secondCardId]);
          }
        }, isMatch ? 500 : 1500); // Shorter delay for matches, longer for non-matches

        return () => clearTimeout(timer);
      }
    }
  }, [state.flippedCards, state.board, handleCardMatch, handleCardUnmatch]);

  const canFlipCard = useCallback((cardId: number) => {
    const card = state.board.find(c => c.id === cardId);
    return canFlipCardUtil(card, state.flippedCards.length, state.gameStatus);
  }, [state.gameStatus, state.flippedCards.length, state.board]);

  const getGameProgress = useCallback(() => {
    const totalPairs = DIFFICULTY_CONFIGS[state.difficulty].pairs;
    const matchedPairs = state.matchedPairs.length;
    return {
      matchedPairs,
      totalPairs,
      percentage: totalPairs > 0 ? (matchedPairs / totalPairs) * 100 : 0
    };
  }, [state.matchedPairs.length, state.difficulty]);

  return {
    // State
    gameState: state,
    
    // Actions
    startGame,
    flipCard,
    pauseGame,
    resumeGame,
    resetGame,
    updateTime,
    
    // Computed values
    canFlipCard,
    getGameProgress,
    
    // Getters
    isGameActive: state.gameStatus === 'playing',
    isGameCompleted: state.gameStatus === 'completed',
    isGamePaused: state.gameStatus === 'paused',
    isCardFlippingInProgress: state.flippedCards.length === 2
  };
}