import { Link } from 'react-router-dom'
import AdminLayout from '../../components/AdminLayout'
import { useAppState } from '../../data/store'

export default function AdminUsersList() {
  const [state] = useAppState()

  return (
    <AdminLayout
      title="Admin Users"
      subtitle="People with access to the GNA Fast Quote admin portal."
      right={
        <Link to="/admin/admins/new" className="btn-primary" style={{ width: 'auto', padding: '10px 20px' }}>
          + Add Admin
        </Link>
      }
    >
      <div className="grid grid-cols-3 gap-5 mb-6">
        <div className="stat-card">
          <div className="stat-icon bg-blue-100 text-blue-600">&#128101;</div>
          <p className="text-sm text-gray-500">Total Admins</p>
          <p className="text-2xl font-bold">{state.adminUsers.length}</p>
          <p className="text-xs text-gray-400">Across all roles</p>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-green-100 text-green-600">&#9989;</div>
          <p className="text-sm text-gray-500">Active Today</p>
          <p className="text-2xl font-bold">{state.adminUsers.length}</p>
          <p className="text-xs text-gray-400">Signed in within 24h</p>
        </div>
        <div className="stat-card">
          <div className="stat-icon bg-purple-100 text-purple-600">&#128274;</div>
          <p className="text-sm text-gray-500">Master Admins</p>
          <p className="text-2xl font-bold">{state.adminUsers.filter((a) => a.role === 'Master Admin').length}</p>
          <p className="text-xs text-gray-400">Full access</p>
        </div>
      </div>

      <div className="card">
        <h2 className="text-base font-semibold mb-4">All Admins ({state.adminUsers.length})</h2>
        <table className="admin-table">
          <thead>
            <tr><th>Name</th><th>Email</th><th>Role</th><th>Last Active</th><th>Status</th><th>Action</th></tr>
          </thead>
          <tbody>
            {state.adminUsers.map((a) => (
              <tr key={a.id}>
                <td>
                  <div className="flex items-center gap-2.5">
                    <span className="avatar-sq">{a.name.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase()}</span>
                    <span className="font-semibold">{a.name}</span>
                  </div>
                </td>
                <td>{a.email}</td>
                <td>{a.role}</td>
                <td>{a.active}</td>
                <td><span className="badge badge-active">Active</span></td>
                <td><button className="view-btn">Manage</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  )
}
