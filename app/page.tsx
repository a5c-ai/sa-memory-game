'use client';

import { Suspense } from 'react';
import GameBoard from './components/GameBoard';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingSpinner from './components/LoadingSpinner';

function GameBoardWrapper() {
  return (
    <ErrorBoundary
      fallback={
        <div className="w-full max-w-6xl mx-auto p-6 bg-white/70 rounded-xl backdrop-blur-sm shadow-lg text-center">
          <div className="text-4xl mb-4">🎮</div>
          <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-2">
            Game Error
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Something went wrong with the game. Please refresh the page to try again.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors font-medium"
          >
            Refresh Game
          </button>
        </div>
      }
    >
      <GameBoard />
    </ErrorBoundary>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900 dark:to-blue-900">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-800 dark:text-white mb-4 animate-fade-in">
            🧠 <a href='https://github.com/shaialon' target="_blank">Shai's</a> Emoji Memory Game
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Test your memory by matching pairs of emojis! Choose your difficulty level, 
            select your favorite emoji category, and click on cards to flip them and find all matching pairs.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <span className="px-3 py-1 bg-white/50 dark:bg-gray-800/50 rounded-full feature-tag cursor-default">🎯 Multiple Difficulties</span>
            <span className="px-3 py-1 bg-white/50 dark:bg-gray-800/50 rounded-full feature-tag cursor-default">🎨 Various Categories</span>
            <span className="px-3 py-1 bg-white/50 dark:bg-gray-800/50 rounded-full feature-tag cursor-default">📊 Score Tracking</span>
            <span className="px-3 py-1 bg-white/50 dark:bg-gray-800/50 rounded-full feature-tag cursor-default">⏱️ Timer</span>
          </div>
        </header>

        <main className="flex justify-center">
          <Suspense 
            fallback={
              <div className="w-full max-w-6xl mx-auto">
                <LoadingSpinner 
                  size="large" 
                  message="Loading game..." 
                  className="py-12"
                />
              </div>
            }
          >
            <GameBoardWrapper />
          </Suspense>
        </main>

        <footer className="text-center mt-12 text-gray-500 dark:text-gray-400">
          <div className="space-y-2">
            <p>Powered by a5c.ai</p>
            <p className="text-sm">
              🚀 Optimized for all devices
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
