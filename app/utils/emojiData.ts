import { EmojiCategory } from '../types/game';

/**
 * Complete emoji collections by category for the memory game.
 * Each category contains 24+ unique emojis to support Expert difficulty.
 */

export const EMOJI_CATEGORIES: EmojiCategory[] = [
  {
    id: 'food',
    name: 'Food & Drink',
    emojis: [
      '🍎', '🍌', '🍇', '🍊', '🍋', '🍉', '🍓', '🥝',
      '🍒', '🥭', '🍑', '🍍', '🥥', '🥑', '🍅', '🥕',
      '🌽', '🥒', '🥬', '🥦', '🧄', '🧅', '🥔', '🍠',
      '🍞', '🥖', '🥨', '🧀', '🥚', '🍳', '🥓', '🍗'
    ],
    description: 'Delicious foods, fruits, vegetables, and beverages'
  },
  {
    id: 'animals',
    name: 'Animals',
    emojis: [
      '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼',
      '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔',
      '🐧', '🐦', '🐤', '🐣', '🐥', '🦆', '🦅', '🦉',
      '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🐛', '🦋'
    ],
    description: 'Cute animals and creatures from around the world'
  },
  {
    id: 'objects',
    name: 'Objects & Tools',
    emojis: [
      '⚽', '🏀', '🏈', '⚾', '🎾', '🏐', '🏉', '🎱',
      '🏓', '🏸', '🥅', '🎯', '⛳', '🪁', '🏹', '🎣',
      '🤿', '🥊', '🥅', '⛷️', '🏂', '🏄', '🚣', '🏊',
      '⛹️', '🏋️', '🚴', '🤸', '🤽', '🤾', '🧗', '🤺'
    ],
    description: 'Sports equipment, tools, and everyday objects'
  },
  {
    id: 'nature',
    name: 'Nature & Weather',
    emojis: [
      '🌸', '🌺', '🌻', '🌷', '🌹', '🥀', '🌾', '🌿',
      '🍀', '🌱', '🌲', '🌳', '🌴', '🌵', '🌶️', '🍄',
      '☀️', '🌤️', '⛅', '🌦️', '🌧️', '⛈️', '🌩️', '🌨️',
      '❄️', '☃️', '⛄', '🌬️', '💨', '🌪️', '🌈', '⭐'
    ],
    description: 'Beautiful flowers, plants, weather, and natural phenomena'
  },
  {
    id: 'travel',
    name: 'Travel & Places',
    emojis: [
      '🚗', '🚕', '🚙', '🚐', '🏎️', '🚓', '🚑', '🚒',
      '🚚', '🚛', '🚜', '🏍️', '🛵', '🚲', '🛴', '🛹',
      '🚁', '✈️', '🛩️', '🚀', '🛸', '🚂', '🚃', '🚄',
      '🚅', '🚆', '🚇', '🚈', '🚉', '🚊', '🚝', '🚞'
    ],
    description: 'Vehicles, transportation, and travel destinations'
  },
  {
    id: 'activities',
    name: 'Activities & Hobbies',
    emojis: [
      '🎨', '🖌️', '🖍️', '📝', '✏️', '🖊️', '🖋️', '✒️',
      '📚', '📖', '📓', '📔', '📒', '📕', '📗', '📘',
      '🎵', '🎶', '🎼', '🎹', '🥁', '🎷', '🎺', '🎸',
      '🪕', '🎻', '🪈', '🎤', '🎧', '📻', '🎮', '🕹️'
    ],
    description: 'Creative activities, music, art, and entertainment'
  }
];

/**
 * Get emoji category by ID
 */
export function getEmojiCategory(id: string): EmojiCategory | undefined {
  return EMOJI_CATEGORIES.find(category => category.id === id);
}

/**
 * Get all available category IDs
 */
export function getCategoryIds(): string[] {
  return EMOJI_CATEGORIES.map(category => category.id);
}

/**
 * Validate if a category has enough emojis for a given difficulty
 */
export function validateCategoryForDifficulty(category: EmojiCategory, requiredPairs: number): boolean {
  return category.emojis.length >= requiredPairs;
}

/**
 * Get random emojis from a category
 */
export function getRandomEmojis(category: EmojiCategory, count: number): string[] {
  if (count > category.emojis.length) {
    throw new Error(`Not enough emojis in category ${category.name}. Requested: ${count}, Available: ${category.emojis.length}`);
  }

  const shuffled = [...category.emojis];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled.slice(0, count);
}

/**
 * Get the default category (food)
 */
export function getDefaultCategory(): EmojiCategory {
  return EMOJI_CATEGORIES[0]; // food category
}