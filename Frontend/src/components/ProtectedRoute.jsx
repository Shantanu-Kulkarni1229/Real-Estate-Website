import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import LoadingScreen from './LoadingScreen'

const ProtectedRoute = ({ allowedRoles, children }) => {
  const location = useLocation()
  const { isReady, isAuthenticated, user } = useAuth()

  if (!isReady) {
    return <LoadingScreen fullScreen label="Checking Session" sublabel="Please wait while we verify your account" />
  }

  if (!isAuthenticated) {
    const redirect = encodeURIComponent(`${location.pathname}${location.search}`)
    return <Navigate to={`/auth?redirect=${redirect}`} replace />
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/" replace />
  }

  return children
}

export default ProtectedRoute