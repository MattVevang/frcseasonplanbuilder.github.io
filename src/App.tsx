import { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { useThemeStore } from './stores/themeStore'
import { cleanupExpiredSessions } from './services/cleanupService'
import Layout from './components/layout/Layout'
import HomePage from './pages/HomePage'
import WorkspacePage from './pages/WorkspacePage'

function App() {
  const { isDark } = useThemeStore()

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [isDark])

  // Run cleanup of expired sessions on app load
  useEffect(() => {
    cleanupExpiredSessions()
  }, [])

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/session/:sessionCode" element={<WorkspacePage />} />
      </Routes>
    </Layout>
  )
}

export default App
