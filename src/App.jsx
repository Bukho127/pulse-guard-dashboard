import Dashboad from './components/Dashboard/Dashboad'
import Sidebar from './components/Sidebar/Sidebar'
import './App.css'

function App() {

  return (
    <div className='grid gap-4 p-4 grid-cols-[220px_1fr]'>
      <Sidebar />
      <Dashboad />
    </div>
  )
}

export default App
