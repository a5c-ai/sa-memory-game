import GameBoard from './components/GameBoard';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900 dark:to-blue-900">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-800 dark:text-white mb-4">
            🧠 Emoji Memory Game
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Test your memory by matching pairs of emojis! Click on cards to flip them and find all matching pairs.
          </p>
        </header>

        <main className="flex justify-center">
          <GameBoard />
        </main>

        <footer className="text-center mt-12 text-gray-500 dark:text-gray-400">
          <p>Built with Next.js 15, React 19, and Tailwind CSS</p>
        </footer>
      </div>
    </div>
  );
}
