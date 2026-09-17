import { Routes, Route, Navigate } from 'react-router-dom'
import SignIn from './pages/SignIn'
import SignUp from './pages/SignUp'
import AdminSignIn from './pages/AdminSignIn'
import Dashboard from './pages/Dashboard'
import NewQuote from './pages/NewQuote'
import Quotes from './pages/Quotes'
import PricingCredits from './pages/PricingCredits'
import Profile from './pages/Profile'
import TermsConditions from './pages/TermsConditions'
import PotentialUsers from './pages/admin/PotentialUsers'
import VerifiedUsers from './pages/admin/VerifiedUsers'
import RejectedProfiles from './pages/admin/RejectedProfiles'
import AdminUsersList from './pages/admin/AdminUsersList'
import CreateAdminUser from './pages/admin/CreateAdminUser'
import { useAppState, isMasterAdmin, currentAdmin, currentUser } from './data/store'

function RequireMasterAdmin({ children }) {
  const [state] = useAppState()
  if (!currentAdmin(state)) return <Navigate to="/admin-sign-in" replace />
  if (!isMasterAdmin(state)) return <Navigate to="/admin/potential" replace />
  return children
}

function RequireAdmin({ children }) {
  const [state] = useAppState()
  if (!currentAdmin(state)) return <Navigate to="/admin-sign-in" replace />
  return children
}

function RequireUser({ children }) {
  const [state] = useAppState()
  if (!currentUser(state)) return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<SignIn />} />
      <Route path="/sign-up" element={<SignUp />} />
      <Route path="/admin-sign-in" element={<AdminSignIn />} />

      {/* Contractor portal — requires a signed-in, admin-verified account */}
      <Route path="/dashboard" element={<RequireUser><Dashboard /></RequireUser>} />
      <Route path="/new-quote" element={<RequireUser><NewQuote /></RequireUser>} />
      <Route path="/quotes" element={<RequireUser><Quotes /></RequireUser>} />
      <Route path="/pricing" element={<RequireUser><PricingCredits /></RequireUser>} />
      <Route path="/profile" element={<RequireUser><Profile /></RequireUser>} />
      <Route path="/terms" element={<TermsConditions />} />

      {/* Admin portal — requires a signed-in admin */}
      <Route path="/admin" element={<RequireAdmin><PotentialUsers /></RequireAdmin>} />
      <Route path="/admin/potential" element={<RequireAdmin><PotentialUsers /></RequireAdmin>} />
      <Route path="/admin/verified" element={<RequireAdmin><VerifiedUsers /></RequireAdmin>} />
      <Route path="/admin/rejected" element={<RequireAdmin><RejectedProfiles /></RequireAdmin>} />
      <Route
        path="/admin/admins"
        element={
          <RequireMasterAdmin>
            <AdminUsersList />
          </RequireMasterAdmin>
        }
      />
      <Route
        path="/admin/admins/new"
        element={
          <RequireMasterAdmin>
            <CreateAdminUser />
          </RequireMasterAdmin>
        }
      />
    </Routes>
  )
}
