import { useState } from 'react'
import AdminLayout from '../../components/AdminLayout'
import ApplicantDetailModal from '../../components/ApplicantDetailModal'
import { useAppState } from '../../data/store'

export default function VerifiedUsers() {
  const [state] = useAppState()
  const [viewing, setViewing] = useState(null)
  const verified = state.applications.filter((a) => a.status === 'verified')
  const pendingCount = state.applications.filter((a) => a.status === 'pending').length

  return (
    <AdminLayout title="Verified Users" subtitle="Overview of all verified users and their account activity.">
      <div className="grid grid-cols-4 gap-5 mb-6">
        <div className="stat-card">
          <div className="stat-icon bg-blue-100 text-blue-600">&#128101;</div>
          <p className="text-sm text-gray-500">Total Profiles</p>
          <p className="text-2xl font-bold">{state.applications.length}</p>
          <p className="text-xs text-gray-400">All registered profiles</p>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-green-100 text-green-600">&#9989;</div>
          <p className="text-sm text-gray-500">Verified Users</p>
          <p className="text-2xl font-bold">{verified.length}</p>
          <p className="text-xs text-gray-400">
            {state.applications.length ? Math.round((verified.length / state.applications.length) * 100) : 0}% of total profiles
          </p>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-amber-100 text-amber-600">&#9203;</div>
          <p className="text-sm text-gray-500">Pending Verification</p>
          <p className="text-2xl font-bold">{pendingCount}</p>
          <p className="text-xs text-gray-400">Awaiting review</p>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-purple-100 text-purple-600">&#128176;</div>
          <p className="text-sm text-gray-500">Total Credits Across Users</p>
          <p className="text-2xl font-bold">12,450</p>
          <p className="text-xs text-gray-400">Available credits</p>
        </div>
      </div>

      <div className="card">
        <h2 className="text-base font-semibold mb-4">Verified Users ({verified.length})</h2>
        <table className="admin-table">
          <thead>
            <tr><th>Company Name</th><th>Contact Name</th><th>Email</th><th>NHBRC Number</th><th>Status</th><th>Action</th></tr>
          </thead>
          <tbody>
            {verified.map((a) => (
              <tr key={a.id}>
                <td>
                  <div className="flex items-center gap-2.5">
                    <span className="avatar-sq">{a.company.slice(0, 2).toUpperCase()}</span>
                    <span className="font-semibold">{a.company}</span>
                  </div>
                </td>
                <td>{a.contact}</td>
                <td>{a.email}</td>
                <td>{a.nhbrc}</td>
                <td><span className="badge badge-verified">Verified</span></td>
                <td><button className="view-btn" onClick={() => setViewing(a)}>View</button></td>
              </tr>
            ))}
            {verified.length === 0 && (
              <tr><td colSpan={6} className="text-center text-gray-400 py-6">No verified users yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {viewing && <ApplicantDetailModal applicant={viewing} onClose={() => setViewing(null)} />}
    </AdminLayout>
  )
}
