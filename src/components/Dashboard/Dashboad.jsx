import { Navigate, Route, Routes } from 'react-router-dom'
import Incidents from "./Incidents"
import TopBar from "./TopBar"
import Grid from "./Grid"

const DashboardHome = () => (
  <div>
    <Grid />
  </div>
)

const PlaceholderPage = ({ title }) => (
  <div className='px-4'>
    {title}
  </div>
)

const Dashboad = () => {
  return (
    <div className='bg-white rounded-lg pb-4 shadow h-[200vh]'>
        <TopBar/>
        <Routes>
          <Route path='/' element={<DashboardHome />} />
          <Route path='/incidents' element={<Incidents />} />
          <Route path='/reports' element={<PlaceholderPage title='Pending Reports' />} />
          <Route path='/analysis' element={<PlaceholderPage title='Analysis' />} />
          <Route path='/heatmap' element={<PlaceholderPage title='Heatmap' />} />
          <Route path='/schedule' element={<PlaceholderPage title='Schedule' />} />
          <Route path='*' element={<Navigate to='/' replace />} />
        </Routes>
    </div>
  )
}

export default Dashboad
