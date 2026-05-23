import { Navigate, Route, Routes } from 'react-router-dom'

import { RequireAuth } from '@/components/RequireAuth'

import { DashboardPage } from './pages/DashboardPage'
import { HomePage } from './pages/HomePage'
import { SignInPage } from './pages/SignInPage'
import { SignUpPage } from './pages/SignUpPage'
import { ActivityPage } from './pages/ActivityPage'
import { StrategiesPage } from './pages/StrategiesPage'
import { StrategyDetailPage } from './pages/StrategyDetailPage'

function App() {
  return (
    <div className="flex min-h-svh flex-col">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <DashboardPage />
            </RequireAuth>
          }
        />
        <Route
          path="/dashboard/activity"
          element={
            <RequireAuth>
              <ActivityPage />
            </RequireAuth>
          }
        />
        <Route
          path="/dashboard/strategies"
          element={
            <RequireAuth>
              <StrategiesPage />
            </RequireAuth>
          }
        />
        <Route
          path="/dashboard/strategies/:id"
          element={
            <RequireAuth>
              <StrategyDetailPage />
            </RequireAuth>
          }
        />
        <Route path="/sign-in" element={<SignInPage />} />
        <Route path="/sign-up" element={<SignUpPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  )
}

export default App
