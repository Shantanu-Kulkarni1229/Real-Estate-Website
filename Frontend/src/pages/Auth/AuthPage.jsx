import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import LoadingScreen from '../../components/LoadingScreen'

const roleOptions = [
  {
    value: 'user',
    label: 'User',
    description: 'Use one account for both buying and renting.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
        <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
      </svg>
    ),
    tag: 'Free'
  },
  {
    value: 'owner',
    label: 'Owner',
    description: 'Post your own property for free.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
        <path d="M3 10.5L12 3l9 7.5V21H3z" /><rect x="9" y="14" width="6" height="7" />
      </svg>
    ),
    tag: 'Free'
  },
  {
    value: 'agent',
    label: 'Agent',
    description: 'Manage multiple owner listings with subscription.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    tag: 'Pro'
  },
  {
    value: 'builder',
    label: 'Builder',
    description: 'Publish projects and inventory with subscription.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5">
        <rect x="2" y="3" width="20" height="14" rx="2" /><path d="M8 21h8M12 17v4" />
        <path d="M7 8h2m2 0h2m2 0h2" />
      </svg>
    ),
    tag: 'Pro'
  }
]

const COMMERCIAL_ROLES = ['owner', 'agent', 'builder', 'admin']

function canAccessPath(role, path) {
  if (!path) return true
  const normalizedRole = String(role || '').trim().toLowerCase()
  const normalizedPath = String(path).trim().toLowerCase()
  if (normalizedPath.startsWith('/admin')) return normalizedRole === 'admin'
  if (normalizedPath.startsWith('/post-property') || normalizedPath.startsWith('/dashboard') || normalizedPath.startsWith('/crm'))
    return COMMERCIAL_ROLES.includes(normalizedRole)
  return true
}

/* ─── Floating orbs background ─── */
const Orb = ({ style }) => (
  <div
    className="orb"
    style={{
      position: 'absolute',
      borderRadius: '50%',
      filter: 'blur(80px)',
      opacity: 0.35,
      pointerEvents: 'none',
      ...style
    }}
  />
)

/* ─── Animated input ─── */
const FloatingInput = ({ label, type = 'text', value, onChange, required, autoComplete }) => {
  const [focused, setFocused] = useState(false)
  const filled = value && value.length > 0
  return (
    <div className="fi-wrap" style={{ position: 'relative', marginTop: '0.25rem' }}>
      <input
        type={type}
        required={required}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        autoComplete={autoComplete}
        placeholder=" "
        style={{
          width: '100%',
          padding: '1.05rem 1rem 0.45rem',
          borderRadius: '0.875rem',
          border: focused
            ? '1.5px solid var(--color-primary)'
            : '1.5px solid rgba(148,163,184,0.45)',
          background: focused ? 'rgba(255,255,255,0.95)' : 'rgba(248,250,255,0.8)',
          color: '#0f172a',
          fontSize: '0.875rem',
          outline: 'none',
          boxShadow: focused ? '0 0 0 4px rgba(37,99,235,0.08), 0 2px 12px rgba(37,99,235,0.06)' : 'none',
          transition: 'all 0.22s cubic-bezier(.4,0,.2,1)',
          backdropFilter: 'blur(4px)',
        }}
      />
      <label
        style={{
          position: 'absolute',
          left: '1rem',
          top: focused || filled ? '0.38rem' : '50%',
          transform: focused || filled ? 'translateY(0) scale(0.78)' : 'translateY(-50%) scale(1)',
          transformOrigin: 'left center',
          fontSize: '0.875rem',
          color: focused ? 'var(--color-primary)' : '#64748b',
          pointerEvents: 'none',
          transition: 'all 0.2s cubic-bezier(.4,0,.2,1)',
          fontWeight: focused || filled ? 600 : 400,
          letterSpacing: focused || filled ? '0.01em' : 0,
        }}
      >
        {label}
      </label>
    </div>
  )
}

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
    firstName: '', lastName: '', email: '', phone: '',
    password: '', confirmPassword: '', role: 'user',
    businessName: '', licenseNumber: ''
  })

  useEffect(() => {
    if (isAuthenticated) {
      const fallbackPath = COMMERCIAL_ROLES.includes(user?.role) ? '/crm' : '/'
      const safeRedirect = canAccessPath(user?.role, requestedRedirect) ? (requestedRedirect || fallbackPath) : '/'
      navigate(safeRedirect, { replace: true })
    }
  }, [isAuthenticated, navigate, requestedRedirect, user?.role])

  if (!isReady) return <LoadingScreen fullScreen label="Loading Auth" sublabel="Preparing your sign in experience" />

  const handleLoginSubmit = async (event) => {
    event.preventDefault(); setError(''); setIsSubmitting(true)
    try {
      const response = await login(loginForm)
      const role = response?.data?.role
      const fallbackPath = COMMERCIAL_ROLES.includes(role) ? '/crm' : '/'
      navigate(canAccessPath(role, requestedRedirect) ? (requestedRedirect || fallbackPath) : '/', { replace: true })
    } catch (err) { setError(err.message || 'Unable to sign in') }
    finally { setIsSubmitting(false) }
  }

  const handleSignupSubmit = async (event) => {
    event.preventDefault(); setError('')
    const selectedRole = signupForm.role
    if (signupForm.password !== signupForm.confirmPassword) { setError('Password and confirm password must match'); return }
    if ((selectedRole === 'agent' || selectedRole === 'builder') && !signupForm.businessName.trim()) {
      setError('Business name is required for agent and builder accounts'); return
    }
    setIsSubmitting(true)
    try {
      const response = await signup({
        firstName: signupForm.firstName, lastName: signupForm.lastName,
        email: signupForm.email, phone: signupForm.phone,
        password: signupForm.password, whatsappNumber: signupForm.phone,
        role: selectedRole, businessName: signupForm.businessName,
        organizationName: signupForm.businessName, licenseNumber: signupForm.licenseNumber
      })
      const role = response?.data?.role
      const fallbackPath = COMMERCIAL_ROLES.includes(role) ? '/crm' : '/'
      navigate(canAccessPath(role, requestedRedirect) ? (requestedRedirect || fallbackPath) : '/', { replace: true })
    } catch (err) { setError(err.message || 'Unable to create account') }
    finally { setIsSubmitting(false) }
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=Inter:wght@400;500;600&display=swap');

        * { box-sizing: border-box; }

        .auth-root {
          min-height: 100vh;
          background: radial-gradient(ellipse 80% 60% at 10% 0%, rgba(37,99,235,0.13) 0%, transparent 55%),
                      radial-gradient(ellipse 60% 50% at 90% 100%, rgba(249,115,22,0.09) 0%, transparent 50%),
                      linear-gradient(160deg, #f0f6ff 0%, #eef3ff 50%, #f8f9ff 100%);
          display: flex;
          align-items: stretch;
          font-family: 'Sora', 'Inter', sans-serif;
          overflow: hidden;
        }

        .auth-card {
          display: grid;
          grid-template-columns: 1.15fr 0.85fr;
          width: 100%;
          max-width: 1160px;
          margin: auto;
          min-height: calc(100vh - 48px);
          border-radius: 2rem;
          overflow: hidden;
          box-shadow: 0 40px 100px rgba(15,23,42,0.16), 0 0 0 1px rgba(255,255,255,0.7);
          background: white;
          opacity: 0;
          transform: translateY(28px) scale(0.985);
          animation: cardReveal 0.75s cubic-bezier(.22,1,.36,1) 0.05s forwards;
        }

        @keyframes cardReveal {
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        /* ── Left panel ── */
        .left-panel {
          position: relative;
          overflow: hidden;
          background: #060c1a;
          padding: 3rem 3rem 3rem;
          color: white;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .left-bg-mesh {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 70% 55% at 85% 5%,  rgba(59,130,246,0.38) 0%, transparent 60%),
            radial-gradient(ellipse 55% 45% at 5%  90%, rgba(249,115,22,0.30) 0%, transparent 55%),
            radial-gradient(ellipse 40% 40% at 50% 50%, rgba(99,102,241,0.12) 0%, transparent 60%);
          pointer-events: none;
        }

        .left-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
          background-size: 48px 48px;
          pointer-events: none;
        }

        .brand {
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 0.6rem;
          text-decoration: none;
          z-index: 2;
        }

        .brand-logo {
          width: 36px; height: 36px;
          background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 0 0 1px rgba(255,255,255,0.15), 0 4px 16px rgba(59,130,246,0.45);
        }

        .brand-text {
          font-size: 1.25rem;
          font-weight: 800;
          letter-spacing: -0.03em;
          color: white;
        }

        .left-hero {
          position: relative;
          z-index: 2;
          margin-top: 2.5rem;
        }

        .left-headline {
          font-size: clamp(2rem, 3.5vw, 2.8rem);
          font-weight: 700;
          line-height: 1.18;
          letter-spacing: -0.04em;
          color: white;
          max-width: 400px;
        }

        .left-headline .accent {
          background: linear-gradient(90deg, #60a5fa, #a78bfa);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .left-sub {
          margin-top: 1rem;
          color: rgba(148,163,184,0.85);
          font-size: 0.875rem;
          line-height: 1.75;
          max-width: 360px;
          font-weight: 400;
          font-family: 'Inter', sans-serif;
        }

        /* Role cards on left */
        .role-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.75rem;
          position: relative;
          z-index: 2;
        }

        .role-card-left {
          border-radius: 1rem;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.05);
          backdrop-filter: blur(8px);
          padding: 1rem 1.1rem;
          transition: all 0.25s ease;
          cursor: default;
        }

        .role-card-left:hover {
          border-color: rgba(255,255,255,0.18);
          background: rgba(255,255,255,0.09);
          transform: translateY(-2px);
        }

        .role-card-left-icon {
          width: 32px; height: 32px;
          border-radius: 8px;
          background: rgba(59,130,246,0.2);
          display: flex; align-items: center; justify-content: center;
          color: #60a5fa;
          margin-bottom: 0.65rem;
        }

        .role-card-left-label {
          font-size: 0.8125rem;
          font-weight: 700;
          color: white;
          letter-spacing: -0.01em;
        }

        .role-card-left-desc {
          font-size: 0.7rem;
          color: rgba(148,163,184,0.75);
          margin-top: 0.3rem;
          line-height: 1.55;
          font-family: 'Inter', sans-serif;
        }

        .role-tag {
          display: inline-block;
          font-size: 0.6rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          padding: 0.15rem 0.45rem;
          border-radius: 99px;
          margin-top: 0.5rem;
        }
        .role-tag.free { background: rgba(34,197,94,0.15); color: #4ade80; }
        .role-tag.pro  { background: rgba(249,115,22,0.15); color: #fb923c; }

        /* ── Right panel ── */
        .right-panel {
          background: #ffffff;
          padding: 2.5rem 2.75rem;
          display: flex;
          flex-direction: column;
          overflow-y: auto;
          position: relative;
        }

        .right-panel::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 3px;
          background: linear-gradient(90deg, var(--color-primary, #2563eb), #6366f1, var(--color-cta-orange, #f97316));
        }

        /* Tab switcher */
        .tab-switcher {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4px;
          background: #f1f5f9;
          border-radius: 1rem;
          padding: 4px;
          border: 1px solid rgba(148,163,184,0.25);
        }

        .tab-btn {
          border: none;
          border-radius: 0.75rem;
          padding: 0.6rem 1.5rem;
          font-size: 0.875rem;
          font-weight: 600;
          font-family: 'Sora', sans-serif;
          cursor: pointer;
          transition: all 0.22s cubic-bezier(.4,0,.2,1);
          color: #64748b;
          background: transparent;
          letter-spacing: -0.01em;
        }

        .tab-btn.active {
          background: white;
          color: var(--color-primary, #2563eb);
          box-shadow: 0 2px 8px rgba(15,23,42,0.1), 0 0 0 1px rgba(148,163,184,0.2);
        }

        .page-title {
          font-size: 1.5rem;
          font-weight: 700;
          letter-spacing: -0.04em;
          color: #0f172a;
          margin-top: 1.5rem;
          line-height: 1.25;
        }

        .page-sub {
          font-size: 0.8125rem;
          color: #64748b;
          margin-top: 0.4rem;
          line-height: 1.6;
          font-family: 'Inter', sans-serif;
        }

        /* Error */
        .error-box {
          margin-top: 1rem;
          border-radius: 0.875rem;
          border: 1px solid rgba(244,63,94,0.3);
          background: rgba(255,241,242,0.9);
          padding: 0.75rem 1rem;
          font-size: 0.8125rem;
          color: #be123c;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          animation: shake 0.35s ease;
        }
        @keyframes shake {
          0%,100% { transform: translateX(0); }
          25% { transform: translateX(-6px); }
          75% { transform: translateX(6px); }
        }

        /* Form */
        .form-section {
          margin-top: 1.5rem;
          animation: slideUp 0.35s ease;
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.875rem;
          margin-bottom: 0.875rem;
        }

        .form-col { margin-bottom: 0.875rem; }

        /* Role picker in signup */
        .role-picker {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.6rem;
          margin-top: 0.5rem;
        }

        .role-pick-btn {
          position: relative;
          border-radius: 0.875rem;
          border: 1.5px solid rgba(148,163,184,0.35);
          background: rgba(248,250,255,0.7);
          padding: 0.875rem 0.875rem;
          text-align: left;
          cursor: pointer;
          transition: all 0.22s cubic-bezier(.4,0,.2,1);
          font-family: 'Sora', sans-serif;
          overflow: hidden;
        }

        .role-pick-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(37,99,235,0.07) 0%, transparent 100%);
          opacity: 0;
          transition: opacity 0.2s;
        }

        .role-pick-btn:hover:not(.selected) {
          border-color: rgba(148,163,184,0.6);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(15,23,42,0.06);
        }

        .role-pick-btn.selected {
          border-color: var(--color-primary, #2563eb);
          background: rgba(239,246,255,0.95);
          box-shadow: 0 0 0 3px rgba(37,99,235,0.1), 0 4px 16px rgba(37,99,235,0.1);
        }

        .role-pick-btn.selected::before { opacity: 1; }

        .rpb-icon {
          width: 28px; height: 28px;
          border-radius: 7px;
          display: flex; align-items: center; justify-content: center;
          margin-bottom: 0.5rem;
          transition: all 0.2s;
        }

        .role-pick-btn:not(.selected) .rpb-icon {
          background: rgba(148,163,184,0.15);
          color: #64748b;
        }

        .role-pick-btn.selected .rpb-icon {
          background: rgba(37,99,235,0.12);
          color: var(--color-primary, #2563eb);
        }

        .rpb-label {
          font-size: 0.8125rem;
          font-weight: 700;
          color: #0f172a;
          letter-spacing: -0.01em;
        }

        .rpb-desc {
          font-size: 0.68rem;
          color: #94a3b8;
          margin-top: 0.2rem;
          line-height: 1.45;
          font-family: 'Inter', sans-serif;
        }

        .check-mark {
          position: absolute;
          top: 0.6rem; right: 0.6rem;
          width: 18px; height: 18px;
          border-radius: 50%;
          background: var(--color-primary, #2563eb);
          display: flex; align-items: center; justify-content: center;
          transform: scale(0);
          transition: transform 0.2s cubic-bezier(.34,1.56,.64,1);
        }
        .role-pick-btn.selected .check-mark { transform: scale(1); }

        /* Submit button */
        .submit-btn {
          width: 100%;
          border: none;
          border-radius: 0.875rem;
          padding: 0.9rem 1.5rem;
          font-size: 0.9375rem;
          font-weight: 700;
          font-family: 'Sora', sans-serif;
          letter-spacing: -0.01em;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          transition: all 0.22s cubic-bezier(.4,0,.2,1);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          margin-top: 1.25rem;
        }

        .submit-btn::before {
          content: '';
          position: absolute;
          inset: 0;
          background: rgba(255,255,255,0.12);
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.3s ease;
        }

        .submit-btn:hover:not(:disabled)::before { transform: scaleX(1); }

        .submit-btn:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(37,99,235,0.35);
        }

        .submit-btn:active:not(:disabled) { transform: translateY(0); }

        .submit-btn.login-btn {
          background: linear-gradient(135deg, var(--color-primary, #2563eb) 0%, #1d4ed8 100%);
          color: white;
          box-shadow: 0 4px 16px rgba(37,99,235,0.28);
        }

        .submit-btn.signup-btn {
          background: linear-gradient(135deg, var(--color-cta-orange, #f97316) 0%, #ea580c 100%);
          color: white;
          box-shadow: 0 4px 16px rgba(249,115,22,0.28);
        }

        .submit-btn.signup-btn:hover:not(:disabled) {
          box-shadow: 0 8px 24px rgba(249,115,22,0.38);
        }

        .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }

        .spinner {
          width: 16px; height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* Info footer */
        .info-box {
          margin-top: 1.25rem;
          border-radius: 0.875rem;
          border: 1px solid rgba(148,163,184,0.25);
          background: linear-gradient(135deg, rgba(248,250,255,0.9), rgba(240,246,255,0.6));
          padding: 0.875rem 1rem;
          font-size: 0.78rem;
          color: #64748b;
          display: flex;
          align-items: flex-start;
          gap: 0.5rem;
          font-family: 'Inter', sans-serif;
          line-height: 1.55;
        }

        .field-label {
          font-size: 0.78rem;
          font-weight: 600;
          color: #475569;
          margin-bottom: 0.25rem;
          letter-spacing: 0.01em;
          font-family: 'Sora', sans-serif;
        }

        /* Divider between role-picker and fields */
        .section-label {
          font-size: 0.7rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: #94a3b8;
          margin-bottom: 0.5rem;
          margin-top: 0.25rem;
        }

        /* Responsive */
        @media (max-width: 900px) {
          .auth-card {
            grid-template-columns: 1fr;
            border-radius: 1.25rem;
            margin: 1rem;
            min-height: unset;
          }
          .left-panel { padding: 2rem; min-height: 280px; }
          .role-grid { grid-template-columns: 1fr 1fr; }
          .right-panel { padding: 2rem 1.5rem; }
        }
        @media (max-width: 540px) {
          .form-row { grid-template-columns: 1fr; }
          .role-grid { grid-template-columns: 1fr 1fr; }
          .role-picker { grid-template-columns: 1fr 1fr; }
        }
      `}</style>

      <div className="auth-root">
        <div style={{ margin: 'auto', padding: '1.5rem', width: '100%', maxWidth: '1220px' }}>
          <div className="auth-card">

            {/* ─── Left Panel ─── */}
            <div className="left-panel">
              <div className="left-bg-mesh" />
              <div className="left-grid" />

              <div style={{ position: 'relative', zIndex: 2 }}>
                <Link to="/" className="brand">
                  <div className="brand-logo">
                    <svg viewBox="0 0 24 24" fill="none" width="18" height="18">
                      <path d="M3 10.5L12 3l9 7.5V21H3z" fill="white" opacity=".9"/>
                    </svg>
                  </div>
                  <span className="brand-text">CityPloter</span>
                </Link>

                <div className="left-hero">
                  <h1 className="left-headline">
                    Find, post &amp; manage<br />
                    <span className="accent">real estate</span><br />
                    all in one place.
                  </h1>
                  <p className="left-sub">
                    Sign in once and unlock buying, renting, posting, and managing — whatever your role demands.
                  </p>
                </div>
              </div>

              <div className="role-grid">
                {roleOptions.map((opt, i) => (
                  <div
                    key={opt.value}
                    className="role-card-left"
                    style={{ animationDelay: `${i * 0.08}s` }}
                  >
                    <div className="role-card-left-icon">{opt.icon}</div>
                    <div className="role-card-left-label">{opt.label}</div>
                    <div className="role-card-left-desc">{opt.description}</div>
                    <span className={`role-tag ${opt.tag === 'Free' ? 'free' : 'pro'}`}>{opt.tag}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ─── Right Panel ─── */}
            <div className="right-panel">

              {/* Tab switcher */}
              <div className="tab-switcher">
                <button className={`tab-btn ${mode === 'login' ? 'active' : ''}`} onClick={() => { setMode('login'); setError('') }}>
                  Sign In
                </button>
                <button className={`tab-btn ${mode === 'signup' ? 'active' : ''}`} onClick={() => { setMode('signup'); setError('') }}>
                  Create Account
                </button>
              </div>

              <h2 className="page-title">
                {mode === 'login' ? 'Welcome back 👋' : 'Get started today'}
              </h2>
              <p className="page-sub">
                {mode === 'login'
                  ? 'Sign in to manage your property listings and searches.'
                  : 'Choose your role and join thousands of users on CityPloter.'}
              </p>

              {error && (
                <div className="error-box">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 15, height: 15, flexShrink: 0 }}>
                    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  {error}
                </div>
              )}

              {mode === 'login' ? (
                <form onSubmit={handleLoginSubmit} className="form-section">
                  <div className="form-col">
                    <div className="field-label">Email address</div>
                    <FloatingInput
                      label="your@email.com"
                      type="email"
                      required
                      value={loginForm.email}
                      onChange={e => setLoginForm(c => ({ ...c, email: e.target.value }))}
                      autoComplete="email"
                    />
                  </div>
                  <div className="form-col">
                    <div className="field-label">Password</div>
                    <FloatingInput
                      label="Enter your password"
                      type="password"
                      required
                      value={loginForm.password}
                      onChange={e => setLoginForm(c => ({ ...c, password: e.target.value }))}
                      autoComplete="current-password"
                    />
                  </div>
                  <button type="submit" disabled={isSubmitting} className="submit-btn login-btn">
                    {isSubmitting ? <><div className="spinner" /> Signing in…</> : <>
                      Continue to listing
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: 16, height: 16 }}>
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                      </svg>
                    </>}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleSignupSubmit} className="form-section">
                  {/* Name row */}
                  <div className="form-row">
                    <div>
                      <div className="field-label">First name</div>
                      <FloatingInput label="First name" required value={signupForm.firstName}
                        onChange={e => setSignupForm(c => ({ ...c, firstName: e.target.value }))} />
                    </div>
                    <div>
                      <div className="field-label">Last name</div>
                      <FloatingInput label="Last name" required value={signupForm.lastName}
                        onChange={e => setSignupForm(c => ({ ...c, lastName: e.target.value }))} />
                    </div>
                  </div>

                  {/* Email + Phone */}
                  <div className="form-row">
                    <div>
                      <div className="field-label">Email</div>
                      <FloatingInput label="your@email.com" type="email" required value={signupForm.email}
                        onChange={e => setSignupForm(c => ({ ...c, email: e.target.value }))} autoComplete="email" />
                    </div>
                    <div>
                      <div className="field-label">Phone</div>
                      <FloatingInput label="+91 9876543210" type="tel" required value={signupForm.phone}
                        onChange={e => setSignupForm(c => ({ ...c, phone: e.target.value }))} />
                    </div>
                  </div>

                  {/* Role picker */}
                  <div style={{ marginBottom: '0.875rem' }}>
                    <div className="section-label">Account type</div>
                    <div className="role-picker">
                      {roleOptions.map(opt => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setSignupForm(c => ({ ...c, role: opt.value }))}
                          className={`role-pick-btn ${signupForm.role === opt.value ? 'selected' : ''}`}
                        >
                          <div className="check-mark">
                            <svg viewBox="0 0 12 12" fill="none" width="9" height="9">
                              <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </div>
                          <div className="rpb-icon">{opt.icon}</div>
                          <div className="rpb-label">{opt.label}</div>
                          <div className="rpb-desc">{opt.description}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Business fields */}
                  {(signupForm.role === 'agent' || signupForm.role === 'builder') && (
                    <div className="form-row" style={{ animation: 'slideUp 0.3s ease' }}>
                      <div>
                        <div className="field-label">Business name</div>
                        <FloatingInput
                          label={signupForm.role === 'agent' ? 'Agency name' : 'Builder company'}
                          required value={signupForm.businessName}
                          onChange={e => setSignupForm(c => ({ ...c, businessName: e.target.value }))}
                        />
                      </div>
                      <div>
                        <div className="field-label">License / RERA <span style={{ color: '#94a3b8', fontWeight: 400 }}>(optional)</span></div>
                        <FloatingInput label="RERA number" value={signupForm.licenseNumber}
                          onChange={e => setSignupForm(c => ({ ...c, licenseNumber: e.target.value }))} />
                      </div>
                    </div>
                  )}

                  {/* Password row */}
                  <div className="form-row">
                    <div>
                      <div className="field-label">Password</div>
                      <FloatingInput label="Min. 8 characters" type="password" required value={signupForm.password}
                        onChange={e => setSignupForm(c => ({ ...c, password: e.target.value }))} autoComplete="new-password" />
                    </div>
                    <div>
                      <div className="field-label">Confirm password</div>
                      <FloatingInput label="Repeat password" type="password" required value={signupForm.confirmPassword}
                        onChange={e => setSignupForm(c => ({ ...c, confirmPassword: e.target.value }))} autoComplete="new-password" />
                    </div>
                  </div>

                  <button type="submit" disabled={isSubmitting} className="submit-btn signup-btn">
                    {isSubmitting ? <><div className="spinner" /> Creating account…</> : <>
                      Create {signupForm.role} account
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: 16, height: 16 }}>
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                      </svg>
                    </>}
                  </button>
                </form>
              )}

              <div className="info-box">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 15, height: 15, flexShrink: 0, marginTop: 1 }}>
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
                </svg>
                {user?.role
                  ? 'You already have access to the property posting flow.'
                  : 'Sign in to access property posting, listing management, and your dashboard.'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default AuthPage