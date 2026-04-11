import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import LoadingScreen from '../../components/LoadingScreen'

const roleOptions = [
  { value: 'user', label: 'User', description: 'Use one account for both buying and renting.' },
  { value: 'owner', label: 'Owner', description: 'Post your own property for free.' },
  { value: 'agent', label: 'Agent', description: 'Manage multiple owner listings with subscription.' },
  { value: 'builder', label: 'Builder', description: 'Publish projects and inventory with subscription.' }
]

const COMMERCIAL_ROLES = ['owner', 'agent', 'builder', 'admin']

function canAccessPath(role, path) {
  if (!path) {
    return true
  }

  const normalizedRole = String(role || '').trim().toLowerCase()
  const normalizedPath = String(path).trim().toLowerCase()

  if (normalizedPath.startsWith('/admin')) {
    return normalizedRole === 'admin'
  }

  if (normalizedPath.startsWith('/post-property') || normalizedPath.startsWith('/dashboard')) {
    return COMMERCIAL_ROLES.includes(normalizedRole)
  }

  return true
}

const inputClassName = 'mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition duration-200 placeholder:text-slate-400 focus:border-(--color-primary) focus:ring-2 focus:ring-(--color-secondary-bg)'

const AuthPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { login, signup, isAuthenticated, isReady, user } = useAuth()
  const requestedRedirect = new URLSearchParams(location.search).get('redirect') || ''
  const [mode, setMode] = useState('login')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loginForm, setLoginForm] = useState({ email: '', password: '' })
  const [signupForm, setSignupForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role: 'user',
    businessName: '',
    licenseNumber: ''
  })

  useEffect(() => {
    if (isAuthenticated) {
      const fallbackPath = COMMERCIAL_ROLES.includes(user?.role) ? '/post-property' : '/'
      const safeRedirect = canAccessPath(user?.role, requestedRedirect) ? (requestedRedirect || fallbackPath) : '/'
      navigate(safeRedirect, { replace: true })
    }
  }, [isAuthenticated, navigate, requestedRedirect, user?.role])

  if (!isReady) {
    return <LoadingScreen fullScreen label="Loading Auth" sublabel="Preparing your sign in experience" />
  }

  const handleLoginSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const response = await login(loginForm)
      const role = response?.data?.role
      const fallbackPath = COMMERCIAL_ROLES.includes(role) ? '/post-property' : '/'
      const safeRedirect = canAccessPath(role, requestedRedirect) ? (requestedRedirect || fallbackPath) : '/'
      navigate(safeRedirect, { replace: true })
    } catch (submissionError) {
      setError(submissionError.message || 'Unable to sign in')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSignupSubmit = async (event) => {
    event.preventDefault()
    setError('')

    const selectedRole = signupForm.role

    if (signupForm.password !== signupForm.confirmPassword) {
      setError('Password and confirm password must match')
      return
    }

    if (selectedRole === 'agent' || selectedRole === 'builder') {
      if (!signupForm.businessName.trim()) {
        setError('Business name is required for agent and builder accounts')
        return
      }
    }

    setIsSubmitting(true)

    try {
      const response = await signup({
        firstName: signupForm.firstName,
        lastName: signupForm.lastName,
        email: signupForm.email,
        phone: signupForm.phone,
        password: signupForm.password,
        whatsappNumber: signupForm.phone,
        role: selectedRole,
        businessName: signupForm.businessName,
        organizationName: signupForm.businessName,
        licenseNumber: signupForm.licenseNumber
      })
      const role = response?.data?.role
      const fallbackPath = COMMERCIAL_ROLES.includes(role) ? '/post-property' : '/'
      const safeRedirect = canAccessPath(role, requestedRedirect) ? (requestedRedirect || fallbackPath) : '/'
      navigate(safeRedirect, { replace: true })
    } catch (submissionError) {
      setError(submissionError.message || 'Unable to create account')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div
      className="min-h-screen px-4 py-8 sm:px-6 lg:px-8"
      style={{
        background:
          'radial-gradient(circle_at_top_left, rgba(37, 99, 235, 0.16), transparent 32%), linear-gradient(180deg, #f8fbff 0%, #eef4ff 100%)'
      }}
    >
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl overflow-hidden border border-white/60 bg-white/70 shadow-[0_25px_80px_rgba(15,23,42,0.12)] backdrop-blur-sm lg:grid-cols-[1.1fr_0.9fr]" style={{ borderRadius: '2rem' }}>
        <div className="relative overflow-hidden bg-slate-950 px-6 py-10 text-white sm:px-10 lg:px-12">
          <div
            className="absolute inset-0"
            style={{
              background:
                'radial-gradient(circle_at_top_right, rgba(59, 130, 246, 0.32), transparent 32%), radial-gradient(circle_at_bottom_left, rgba(249, 115, 22, 0.28), transparent 24%)'
            }}
          />
          <div className="relative z-10 flex h-full flex-col justify-between">
            <div>
              <Link to="/" className="text-2xl font-bold tracking-tight text-white">
                CityPloter
              </Link>
              <h1 className="mt-10 max-w-lg text-4xl font-semibold leading-tight sm:text-5xl">
                Sign in and publish a complete listing in one flow.
              </h1>
              <p className="mt-4 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
                Users can sign in once and explore both buy and rent listings. Owners, agents, and builders can also manage listings and subscriptions.
              </p>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-3 lg:grid-cols-3">
              {roleOptions.map((option) => (
                <div key={option.value} className="rounded-2xl border border-white/10 bg-white/8 p-4 backdrop-blur-sm">
                  <p className="text-sm font-semibold text-white">{option.label}</p>
                  <p className="mt-2 text-xs leading-5 text-slate-300">{option.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="px-6 py-8 sm:px-10 lg:px-12">
          <div className="max-w-xl">
            <div className="rounded-full border border-slate-200 bg-slate-50 p-1 text-sm font-semibold text-slate-500">
              <div className="grid grid-cols-2 gap-1">
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className={`rounded-full px-4 py-2 transition ${mode === 'login' ? 'bg-white text-(--color-primary) shadow-sm' : ''}`}
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => setMode('signup')}
                  className={`rounded-full px-4 py-2 transition ${mode === 'signup' ? 'bg-white text-(--color-primary) shadow-sm' : ''}`}
                >
                  Signup
                </button>
              </div>
            </div>

              <p className="mt-4 text-sm text-slate-500">
                Choose your account type. One normal user account supports both buy and rent. Commercial roles can post and manage listings.
              </p>

            {error ? (
              <div className="mt-5 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            ) : null}

            {mode === 'login' ? (
              <form onSubmit={handleLoginSubmit} className="mt-8 space-y-5">
                <div>
                  <label className="text-sm font-medium text-slate-700">Email</label>
                  <input
                    type="email"
                    required
                    value={loginForm.email}
                    onChange={(event) => setLoginForm((current) => ({ ...current, email: event.target.value }))}
                    className={inputClassName}
                    placeholder="seller@example.com"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-700">Password</label>
                  <input
                    type="password"
                    required
                    value={loginForm.password}
                    onChange={(event) => setLoginForm((current) => ({ ...current, password: event.target.value }))}
                    className={inputClassName}
                    placeholder="Enter your password"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex w-full items-center justify-center rounded-2xl bg-(--color-primary) px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition duration-200 hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting ? 'Signing in...' : 'Continue to property listing'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleSignupSubmit} className="mt-8 space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium text-slate-700">First name</label>
                    <input
                      type="text"
                      required
                      value={signupForm.firstName}
                      onChange={(event) => setSignupForm((current) => ({ ...current, firstName: event.target.value }))}
                      className={inputClassName}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">Last name</label>
                    <input
                      type="text"
                      required
                      value={signupForm.lastName}
                      onChange={(event) => setSignupForm((current) => ({ ...current, lastName: event.target.value }))}
                      className={inputClassName}
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium text-slate-700">Email</label>
                    <input
                      type="email"
                      required
                      value={signupForm.email}
                      onChange={(event) => setSignupForm((current) => ({ ...current, email: event.target.value }))}
                      className={inputClassName}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">Phone</label>
                    <input
                      type="tel"
                      required
                      value={signupForm.phone}
                      onChange={(event) => setSignupForm((current) => ({ ...current, phone: event.target.value }))}
                      className={inputClassName}
                    />
                  </div>
                </div>

                {(signupForm.role === 'agent' || signupForm.role === 'builder') ? (
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="text-sm font-medium text-slate-700">Business / Organization name</label>
                      <input
                        type="text"
                        required
                        value={signupForm.businessName}
                        onChange={(event) => setSignupForm((current) => ({ ...current, businessName: event.target.value }))}
                        className={inputClassName}
                        placeholder={signupForm.role === 'agent' ? 'Your agency name' : 'Your builder company name'}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-slate-700">License / RERA number</label>
                      <input
                        type="text"
                        value={signupForm.licenseNumber}
                        onChange={(event) => setSignupForm((current) => ({ ...current, licenseNumber: event.target.value }))}
                        className={inputClassName}
                        placeholder="Optional, but recommended"
                      />
                    </div>
                  </div>
                ) : null}

                <div>
                  <label className="text-sm font-medium text-slate-700">Role</label>
                  <div className="mt-2 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {roleOptions.map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setSignupForm((current) => ({ ...current, role: option.value }))}
                        className={`rounded-2xl border px-4 py-3 text-left transition ${signupForm.role === option.value ? 'border-(--color-primary) bg-blue-50 text-(--color-primary)' : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'}`}
                      >
                        <p className="text-sm font-semibold">{option.label}</p>
                        <p className="mt-1 text-xs text-slate-500">{option.description}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium text-slate-700">Password</label>
                    <input
                      type="password"
                      required
                      value={signupForm.password}
                      onChange={(event) => setSignupForm((current) => ({ ...current, password: event.target.value }))}
                      className={inputClassName}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-700">Confirm password</label>
                    <input
                      type="password"
                      required
                      value={signupForm.confirmPassword}
                      onChange={(event) => setSignupForm((current) => ({ ...current, confirmPassword: event.target.value }))}
                      className={inputClassName}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex w-full items-center justify-center rounded-2xl bg-(--color-cta-orange) px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-500/20 transition duration-200 hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {isSubmitting ? 'Creating account...' : `Create ${signupForm.role} account`}
                </button>
              </form>
            )}

            <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-600">
              {user?.role
                ? 'You already have access to the property posting flow.'
                : 'Sign in to access property posting and listing management.'}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AuthPage