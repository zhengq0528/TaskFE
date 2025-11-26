import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { TaskDashboard } from './components/TaskDashboard.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <div className="app-root">
      <TaskDashboard />
    </div>
  </StrictMode>,
)
