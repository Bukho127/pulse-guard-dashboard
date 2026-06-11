import { useState } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { FiLock } from 'react-icons/fi'
import { loginPersonnel } from '../../api'
import logo from '../../assets/images/logo/logo-pulse-guard.svg'

const formatForceNumber = (value) => {
  const digits = value.replace(/\D/g, '').slice(0, 8)

  if (digits.length <= 7) {
    return digits
  }

  return `${digits.slice(0, 7)}-${digits.slice(7)}`
}

const isValidForceNumber = (value) => /^\d{7}-\d$/.test(value)

const AuthField = ({
  autoComplete,
  inputMode,
  label,
  maxLength,
  onChange,
  placeholder,
  type = 'text',
  value,
}) => {
  return (
    <label className='block'>
      <span className='mb-1 block text-sm font-medium text-stone-700'>{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        autoComplete={autoComplete}
        inputMode={inputMode}
        maxLength={maxLength}
        placeholder={placeholder}
        className='w-full rounded border border-stone-300 bg-white px-3 py-2 text-sm text-stone-950 outline-none transition-colors duration-200 placeholder:text-stone-400 hover:border-green-600 focus:border-green-600'
      />
    </label>
  )
}

const SignIn = ({ officer, onSignIn }) => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    forceNumber: '',
    password: '',
  })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const updateField = (field, value) => {
    const nextValue = field === 'forceNumber' ? formatForceNumber(value) : value

    setFormData((currentData) => ({
      ...currentData,
      [field]: nextValue,
    }))
    setError('')
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const name = formData.name.trim()
    const surname = formData.surname.trim()
    const forceNumber = formatForceNumber(formData.forceNumber)

    if (!name || !surname || !forceNumber || !formData.password) {
      setError('All fields are required.')
      return
    }

    if (!isValidForceNumber(forceNumber)) {
      setError('Force number must use the SAPS format XXXXXXX-X.')
      return
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    setIsSubmitting(true)

    try {
      const authResponse = await loginPersonnel({
        force_number: forceNumber,
        password: formData.password,
      })

      const token = authResponse?.token || authResponse?.data?.token
      const user = authResponse?.user || authResponse?.data?.user || {
        name,
        surname,
        forceNumber,
      }

      if (!token) {
        throw new Error('Login response did not include a token.')
      }

      onSignIn({ ...user, token })
      navigate('/dashboard', { replace: true })
    } catch (error) {
      setError(error?.message || 'Unable to sign in. Check your credentials and try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (officer) {
    return <Navigate to='/dashboard' replace />
  }

  return (
    <main className='flex min-h-screen items-center justify-center bg-stone-100 px-4 py-8'>
      <section className='w-full max-w-5xl overflow-hidden rounded-lg border border-stone-300 bg-white shadow-xl'>
        <div className='grid min-h-[550px] gap-0 sm:grid-cols-2'>
          <aside className='flex flex-col justify-center bg-gradient-to-br from-green-600 to-green-900 px-8 py-10 text-white text-center sm:px-12'>
            <div className='max-w-xs mx-auto'>
              <p className='mb-4 inline-flex rounded-full bg-green-500/15 px-3 py-1 text-xs uppercase tracking-[0.2em] text-stone-100 border border-stone-300'>Secure access</p>
              <h1 className='text-3xl font-semibold tracking-tight text-white'>Welcome back, Officer</h1>
              <p className='mt-5 text-sm leading-7 text-stone-100'>
                Sign in with your verified SAPS force number and password to access the incident response dashboard.
              </p>

          
            </div>
          </aside>

          <div className='p-6 sm:p-10'>
            <div className='mb-8 flex flex-col items-center gap-4'>
              <img
                src={logo}
                alt='Pulse Guard'
                className='h-16 w-auto my-2'
              />
              <div>
                <h2 className='text-xl font-semibold text-stone-950 text-center'>Pulse Guard sign in</h2>
                <p className='text-sm text-stone-500 text-center'>Authorized police personnel only.</p>
              </div>
            </div>

            <form className='space-y-4' onSubmit={handleSubmit}>
              <div className='grid gap-3 sm:grid-cols-2'>
                <AuthField
                  label='Name'
                  value={formData.name}
                  onChange={(value) => updateField('name', value)}
                  autoComplete='given-name'
                />
                <AuthField
                  label='Surname'
                  value={formData.surname}
                  onChange={(value) => updateField('surname', value)}
                  autoComplete='family-name'
                />
              </div>

              <AuthField
                label='Force number'
                value={formData.forceNumber}
                onChange={(value) => updateField('forceNumber', value)}
                autoComplete='username'
                inputMode='numeric'
                maxLength={9}
                placeholder='1234567-8'
              />

              <AuthField
                label='Password'
                type='password'
                value={formData.password}
                onChange={(value) => updateField('password', value)}
                autoComplete='current-password'
              />

              {error ? (
                <p className='rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700'>
                  {error}
                </p>
              ) : null}

              <button
                type='submit'
                disabled={isSubmitting}
               className='flex w-full items-center justify-center gap-2 rounded bg-gradient-to-b from-gray-900 to-black px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:from-gray-800 hover:to-gray-900 disabled:cursor-not-allowed disabled:bg-stone-300'>
                <FiLock />
                {isSubmitting ? 'Signing in…' : 'Sign in securely'}
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  )
}

export default SignIn
