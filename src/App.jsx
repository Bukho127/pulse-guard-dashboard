import Dashboard from './components/Dashboard/Dashboad'
import Sidebar from './components/Sidebar/Sidebar'
import './App.css'

function App() {
  return (
    <div className='grid min-h-screen gap-4 p-4 lg:grid-cols-[220px_1fr]'>
      <Sidebar />
      <Dashboard />
    </div>
  )
}

export default App
