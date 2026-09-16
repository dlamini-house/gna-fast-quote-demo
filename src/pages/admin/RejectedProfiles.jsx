import { useState } from 'react'
import AdminLayout from '../../components/AdminLayout'
import ApplicantDetailModal from '../../components/ApplicantDetailModal'
import { useAppState, approveApplication } from '../../data/store'

export default function RejectedProfiles() {
  const [state, setState] = useAppState()
  const [viewing, setViewing] = useState(null)
  const rejected = state.applications.filter((a) => a.status === 'rejected')

  return (
    <AdminLayout title="Rejected Profiles" subtitle="Registrations that did not pass verification, and why.">
      <div className="card">
        <h2 className="text-base font-semibold mb-4">Rejected Applicants ({rejected.length})</h2>
        <table className="admin-table">
          <thead>
            <tr><th>Company Name</th><th>Contact Name</th><th>Email</th><th>Reason</th><th>Status</th><th>Action</th></tr>
          </thead>
          <tbody>
            {rejected.map((a) => (
              <tr key={a.id}>
                <td>
                  <div className="flex items-center gap-2.5">
                    <span className="avatar-sq">{a.company.slice(0, 2).toUpperCase()}</span>
                    <span className="font-semibold">{a.company}</span>
                  </div>
                </td>
                <td>{a.contact}</td>
                <td>{a.email}</td>
                <td className="max-w-xs text-gray-500">{a.reason}</td>
                <td><span className="badge badge-rejected">Rejected</span></td>
                <td className="flex gap-2">
                  <button className="view-btn" onClick={() => setViewing(a)}>View</button>
                  <button className="view-btn" onClick={() => approveApplication(setState, a.id)}>
                    Allow resubmission
                  </button>
                </td>
              </tr>
            ))}
            {rejected.length === 0 && (
              <tr><td colSpan={6} className="text-center text-gray-400 py-6">No rejected profiles.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {viewing && <ApplicantDetailModal applicant={viewing} onClose={() => setViewing(null)} />}
    </AdminLayout>
  )
}
