import { Navigate, Route, Routes } from 'react-router-dom'
import Incidents from "./Incidents"
import TopBar from "./TopBar"
import Grid from "./Grid"
import Heatmap from "./Heatmap"

const DashboardHome = ({ token }) => (
  <Grid token={token} />
)

const PlaceholderPage = ({ title }) => (
  <div className='px-4'>
    <div className='rounded border border-stone-300 bg-white p-6'>
      <h2 className='text-lg font-semibold text-stone-950'>{title}</h2>
      <p className='mt-2 max-w-xl text-sm text-stone-500'>
        This workspace is ready for the next dashboard module.
      </p>
    </div>
  </div>
)

const Dashboard = ({ officer, token }) => {
  return (
    <main className='min-w-0 rounded-lg bg-white pb-4 shadow'>
      <TopBar officer={officer} token={token} />
      <Routes>
        <Route index element={<DashboardHome token={token} />} />
        <Route path='incidents' element={<Incidents token={token} />} />
        <Route path='reports' element={<PlaceholderPage title='Pending Reports' />} />
        <Route path='analysis' element={<PlaceholderPage title='Analysis' />} />
        <Route path='heatmap' element={<Heatmap token={token} month="2026-06" />} />
        <Route path='schedule' element={<PlaceholderPage title='Schedule' />} />
        <Route path='settings' element={<PlaceholderPage title='Settings' />} />
        <Route path='*' element={<Navigate to='/dashboard' replace />} />
      </Routes>
    </main>
  )
}

export default Dashboard
