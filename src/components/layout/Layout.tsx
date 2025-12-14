import { ReactNode } from 'react'
import Header from './Header'

const APP_VERSION = '1.9.0'

interface LayoutProps {
  children: ReactNode
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-6 max-w-6xl">
        {children}
      </main>
      <footer className="py-4 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>FRC Season Plan Builder - Built for FIRST Robotics Teams</p>
        <p className="text-xs mt-1">v{APP_VERSION}</p>
      </footer>
    </div>
  )
}
