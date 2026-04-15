import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import HomePage from './pages/Home/HomePage'
import AuthPage from './pages/Auth/AuthPage'
import PropertyListingPage from './pages/PropertyListing/PropertyListingPage'
import AdminPropertiesPage from './pages/Admin/AdminPropertiesPage'
import AdminPropertyDetailsPage from './pages/Admin/AdminPropertyDetailsPage'
import PropertyDetailsPage from './pages/PropertyDetails/PropertyDetailsPage'
import SearchResultsPage from './pages/Search/SearchResultsPage'
import UserDashboardPage from './pages/Dashboard/UserDashboardPage'
import CommercialCRMPage from './pages/CRM/CommercialCRMPage'

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
              <ProtectedRoute allowedRoles={['owner', 'agent', 'builder', 'admin']}>
                <PropertyListingPage />
              </ProtectedRoute>
            )}
          />
          <Route
            path="/dashboard"
            element={(
              <ProtectedRoute allowedRoles={['owner', 'agent', 'builder', 'admin']}>
                <UserDashboardPage />
              </ProtectedRoute>
            )}
          />
          <Route
            path="/crm"
            element={(
              <ProtectedRoute allowedRoles={['owner', 'agent', 'builder', 'seller', 'admin']}>
                <CommercialCRMPage />
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
          <Route
            path="/admin/properties/:propertyId"
            element={(
              <ProtectedRoute allowedRoles={["admin"]}>
                <AdminPropertyDetailsPage />
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