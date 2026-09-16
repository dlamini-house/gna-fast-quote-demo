import { useState } from 'react'
import AdminLayout from '../../components/AdminLayout'
import ApplicantDetailModal from '../../components/ApplicantDetailModal'
import { useAppState, approveApplication, rejectApplication } from '../../data/store'

export default function PotentialUsers() {
  const [state, setState] = useAppState()
  const [viewing, setViewing] = useState(null)

  const pending = state.applications.filter((a) => a.status === 'pending')
  const rejectedCount = state.applications.filter((a) => a.status === 'rejected').length
  const totalCredits = 6420 // demo figure

  return (
    <AdminLayout title="Potential Users" subtitle="Review and verify pending user registrations.">
      <div className="grid grid-cols-4 gap-5 mb-6">
        <div className="stat-card">
          <div className="stat-icon bg-blue-100 text-blue-600">&#128101;</div>
          <p className="text-sm text-gray-500">Total Profiles</p>
          <p className="text-2xl font-bold">{state.applications.length}</p>
          <p className="text-xs text-gray-400">All registrations</p>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-amber-100 text-amber-600">&#9203;</div>
          <p className="text-sm text-gray-500">Pending Verification</p>
          <p className="text-2xl font-bold">{pending.length}</p>
          <p className="text-xs text-gray-400">Awaiting review</p>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-red-100 text-red-600">&#10060;</div>
          <p className="text-sm text-gray-500">Rejected Users</p>
          <p className="text-2xl font-bold">{rejectedCount}</p>
          <p className="text-xs text-gray-400">Rejected registrations</p>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-purple-100 text-purple-600">&#128176;</div>
          <p className="text-sm text-gray-500">Total Credits Across Users</p>
          <p className="text-2xl font-bold">{totalCredits.toLocaleString()}</p>
          <p className="text-xs text-gray-400">Potential credits</p>
        </div>
      </div>

      <div className="card">
        <h2 className="text-base font-semibold mb-4">Pending Applicants ({pending.length})</h2>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Company Name</th><th>Contact Name</th><th>Email</th><th>NHBRC Number</th>
              <th>Registered On</th><th>Status</th><th>Action</th>
            </tr>
          </thead>
          <tbody>
            {pending.map((a) => (
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
                <td>{a.registered}</td>
                <td><span className="badge badge-pending">Pending</span></td>
                <td><button className="view-btn" onClick={() => setViewing(a)}>View</button></td>
              </tr>
            ))}
            {pending.length === 0 && (
              <tr><td colSpan={7} className="text-center text-gray-400 py-6">No pending applications.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {viewing && (
        <ApplicantDetailModal
          applicant={viewing}
          onClose={() => setViewing(null)}
          onApprove={(id) => approveApplication(setState, id)}
          onReject={(id, reason) => rejectApplication(setState, id, reason)}
        />
      )}
    </AdminLayout>
  )
}
