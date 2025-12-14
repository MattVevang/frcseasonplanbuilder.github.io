import { Link, useParams } from 'react-router-dom'
import { Bot, Moon, Sun, ExternalLink } from 'lucide-react'
import { useThemeStore } from '../../stores/themeStore'

export default function Header() {
  const { sessionCode } = useParams<{ sessionCode: string }>()
  const { isDark, toggleTheme } = useThemeStore()

  return (
    <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 text-primary-600 dark:text-primary-400">
            <Bot className="w-8 h-8" />
            <span className="font-bold text-lg hidden sm:block">FRC Plan Builder</span>
          </Link>

          <div className="flex items-center gap-4">
            {sessionCode && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-primary-100 dark:bg-primary-900/30 rounded-lg">
                <span className="text-sm font-medium text-primary-700 dark:text-primary-300">
                  Session: {sessionCode}
                </span>
              </div>
            )}

            <a
              href="https://github.com/MattVevang/frcseasonplanbuilder.github.io"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="View on GitHub"
              title="View on GitHub - Report issues or give feedback"
            >
              <ExternalLink className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </a>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? (
                <Sun className="w-5 h-5 text-yellow-500" />
              ) : (
                <Moon className="w-5 h-5 text-gray-600" />
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}
