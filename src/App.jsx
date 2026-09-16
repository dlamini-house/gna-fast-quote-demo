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
import { useAppState, isMasterAdmin } from './data/store'

function RequireMasterAdmin({ children }) {
  const [state] = useAppState()
  if (!isMasterAdmin(state)) return <Navigate to="/admin/potential" replace />
  return children
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<SignIn />} />
      <Route path="/sign-up" element={<SignUp />} />
      <Route path="/admin-sign-in" element={<AdminSignIn />} />

      {/* Contractor portal */}
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/new-quote" element={<NewQuote />} />
      <Route path="/quotes" element={<Quotes />} />
      <Route path="/pricing" element={<PricingCredits />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/terms" element={<TermsConditions />} />

      {/* Admin portal */}
      <Route path="/admin" element={<PotentialUsers />} />
      <Route path="/admin/potential" element={<PotentialUsers />} />
      <Route path="/admin/verified" element={<VerifiedUsers />} />
      <Route path="/admin/rejected" element={<RejectedProfiles />} />
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
