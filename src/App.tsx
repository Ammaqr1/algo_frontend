import { Navigate, Route, Routes } from 'react-router-dom'

import { AnimatedChartBackground } from '@/components/AnimatedChartBackground'
import { RequireAuth } from '@/components/RequireAuth'

import { DashboardPage } from './pages/DashboardPage'
import { HomePage } from './pages/HomePage'
import { SignInPage } from './pages/SignInPage'
import { SignUpPage } from './pages/SignUpPage'
import { ActivityPage } from './pages/ActivityPage'
import { ApiTokensPage } from './pages/ApiTokensPage'
import { SchedulePage } from './pages/SchedulePage'
import { StrategiesPage } from './pages/StrategiesPage'
import { StrategyDetailPage } from './pages/StrategyDetailPage'
import { StrategyTypeDetailPage } from './pages/StrategyTypeDetailPage'

function App() {
  return (
    <>
      <AnimatedChartBackground />
      <div className="relative z-10 flex min-h-svh flex-col">
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
          path="/dashboard/tokens"
          element={
            <RequireAuth>
              <ApiTokensPage />
            </RequireAuth>
          }
        />
        <Route
          path="/dashboard/schedule"
          element={
            <RequireAuth>
              <SchedulePage />
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
          path="/dashboard/strategies/:typeName/:typeId/:sessionName/:sessionId"
          element={
            <RequireAuth>
              <StrategyDetailPage />
            </RequireAuth>
          }
        />
        <Route
          path="/dashboard/strategies/:name/:id"
          element={
            <RequireAuth>
              <StrategyTypeDetailPage />
            </RequireAuth>
          }
        />
        <Route path="/sign-in" element={<SignInPage />} />
        <Route path="/sign-up" element={<SignUpPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </>
  )
}

export default App
