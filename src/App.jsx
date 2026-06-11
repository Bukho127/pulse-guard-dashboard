import { useEffect, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import Dashboard from './components/Dashboard/Dashboad'
import Sidebar from './components/Sidebar/Sidebar'
import SignIn from './components/Auth/SignIn'
import './App.css'

function App() {
  const [officer, setOfficer] = useState(() => {
    const stored = sessionStorage.getItem('pulse-guard-user')

    if (!stored) {
      return null
    }

    try {
      return JSON.parse(stored)
    } catch {
      return null
    }
  })
  const [token, setToken] = useState(() => sessionStorage.getItem('pulse-guard-token'))

  const handleSignOut = () => {
    setOfficer(null)
    setToken(null)
    sessionStorage.removeItem('pulse-guard-user')
    sessionStorage.removeItem('pulse-guard-token')
  }

  useEffect(() => {
    if (officer && token) {
      sessionStorage.setItem('pulse-guard-user', JSON.stringify(officer))
      sessionStorage.setItem('pulse-guard-token', token)
    }
  }, [officer, token])

  return (
    <Routes>
      <Route path='/sign-in' element={<SignIn officer={officer} onSignIn={(auth) => {
        setOfficer(auth)
        setToken(auth.token)
      }} />} />
      <Route
        path='/dashboard/*'
        element={
          <ProtectedDashboard officer={officer} token={token} onSignOut={handleSignOut} />
        }
      />
      <Route path='/' element={<Navigate to={officer ? '/dashboard' : '/sign-in'} replace />} />
      <Route path='*' element={<Navigate to={officer ? '/dashboard' : '/sign-in'} replace />} />
    </Routes>
  )
}

const ProtectedDashboard = ({ officer, token, onSignOut }) => {
  if (!officer) {
    return <Navigate to='/sign-in' replace />
  }

  return (
    <div className='grid min-h-screen gap-4 p-4 lg:grid-cols-[220px_1fr]'>
      <Sidebar officer={officer} onSignOut={onSignOut} />
      <Dashboard officer={officer} token={token} />
    </div>
  )
}

export default App
