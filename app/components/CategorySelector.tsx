'use client';

import { useCallback } from 'react';
import { EmojiCategory } from '../types/game';
import { EMOJI_CATEGORIES } from '../utils/emojiData';

interface CategorySelectorProps {
  selectedCategory: EmojiCategory;
  onChange: (category: EmojiCategory) => void;
  disabled?: boolean;
}

const CATEGORY_ICONS: Record<string, string> = {
  food: '🍎',
  animals: '🐶',
  objects: '⚽',
  nature: '🌸',
  travel: '🚗',
  activities: '🎨'
};

export default function CategorySelector({
  selectedCategory,
  onChange,
  disabled = false
}: CategorySelectorProps) {
  const handleCategoryChange = useCallback((category: EmojiCategory) => {
    if (!disabled && category.id !== selectedCategory.id) {
      onChange(category);
    }
  }, [onChange, selectedCategory.id, disabled]);

  return (
    <div className="space-y-3">
      <div className="text-sm font-medium text-gray-700 text-center">
        Choose Emoji Theme
      </div>
      
      {/* Desktop: Grid layout */}
      <div className="hidden sm:grid grid-cols-3 gap-2">
        {EMOJI_CATEGORIES.map((category) => {
          const isSelected = selectedCategory.id === category.id;
          const icon = CATEGORY_ICONS[category.id] || '❓';
          
          return (
            <button
              key={category.id}
              onClick={() => handleCategoryChange(category)}
              disabled={disabled}
              className={`
                flex flex-col items-center p-3 rounded-lg border-2 transition-all duration-200 min-h-[80px]
                ${isSelected 
                  ? 'bg-blue-100 border-blue-300 text-blue-800 shadow-md scale-105' 
                  : `bg-white border-gray-200 text-gray-600 hover:border-gray-300 ${!disabled ? 'hover:shadow-sm hover:bg-gray-50' : ''}`
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
              `}
              aria-label={`Select ${category.name} category: ${category.description}`}
              aria-pressed={isSelected}
            >
              <div className="text-2xl mb-1">{icon}</div>
              <div className="font-medium text-xs text-center leading-tight">{category.name}</div>
            </button>
          );
        })}
      </div>

      {/* Mobile: Vertical list */}
      <div className="sm:hidden space-y-2">
        {EMOJI_CATEGORIES.map((category) => {
          const isSelected = selectedCategory.id === category.id;
          const icon = CATEGORY_ICONS[category.id] || '❓';
          
          return (
            <button
              key={category.id}
              onClick={() => handleCategoryChange(category)}
              disabled={disabled}
              className={`
                flex items-center justify-between w-full p-3 rounded-lg border-2 transition-all duration-200
                ${isSelected 
                  ? 'bg-blue-100 border-blue-300 text-blue-800 shadow-md' 
                  : `bg-white border-gray-200 text-gray-600 hover:border-gray-300 ${!disabled ? 'hover:shadow-sm hover:bg-gray-50' : ''}`
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50
              `}
              aria-label={`Select ${category.name} category: ${category.description}`}
              aria-pressed={isSelected}
            >
              <div className="flex items-center gap-3">
                <div className="text-2xl">{icon}</div>
                <div className="text-left">
                  <div className="font-medium text-sm">{category.name}</div>
                  <div className="text-xs opacity-75">{category.description}</div>
                </div>
              </div>
              <div className="text-xs opacity-75">
                {category.emojis.length} emojis
              </div>
            </button>
          );
        })}
      </div>

      {/* Preview of selected category emojis */}
      <div className="bg-gray-50 rounded-lg p-3">
        <div className="text-xs font-medium text-gray-700 mb-2 text-center">
          Preview: {selectedCategory.name}
        </div>
        <div className="flex flex-wrap justify-center gap-1 max-h-16 overflow-hidden">
          {selectedCategory.emojis.slice(0, 12).map((emoji, index) => (
            <span 
              key={index} 
              className="text-lg"
              role="img" 
              aria-label={`Preview emoji ${emoji}`}
            >
              {emoji}
            </span>
          ))}
          {selectedCategory.emojis.length > 12 && (
            <span className="text-sm text-gray-500 self-center ml-1">
              +{selectedCategory.emojis.length - 12}
            </span>
          )}
        </div>
        <div className="text-xs text-gray-500 text-center mt-1">
          {selectedCategory.emojis.length} emojis available
        </div>
      </div>
    </div>
  );
}