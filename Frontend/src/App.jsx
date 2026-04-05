import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import HomePage from './pages/Home/HomePage'
import AuthPage from './pages/Auth/AuthPage'
import PropertyListingPage from './pages/PropertyListing/PropertyListingPage'
import AdminPropertiesPage from './pages/Admin/AdminPropertiesPage'
import PropertyDetailsPage from './pages/PropertyDetails/PropertyDetailsPage'
import SearchResultsPage from './pages/Search/SearchResultsPage'
import UserDashboardPage from './pages/Dashboard/UserDashboardPage'

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/search" element={<SearchResultsPage />} />
          <Route path="/properties/:propertyId" element={<PropertyDetailsPage />} />
          <Route
            path="/post-property"
            element={(
              <ProtectedRoute>
                <PropertyListingPage />
              </ProtectedRoute>
            )}
          />
          <Route
            path="/dashboard"
            element={(
              <ProtectedRoute>
                <UserDashboardPage />
              </ProtectedRoute>
            )}
          />
          <Route
            path="/admin/properties"
            element={(
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminPropertiesPage />
              </ProtectedRoute>
            )}
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App