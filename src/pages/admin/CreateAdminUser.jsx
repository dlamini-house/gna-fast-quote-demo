import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminLayout from '../../components/AdminLayout'
import { useAppState, addAdminUser, SEED_ADMIN_PASSWORD } from '../../data/store'

const ROLES = [
  { id: 'admin', title: 'Admin', desc: 'Reviews and verifies contractor registrations. Cannot view, add, edit or delete other admins.' },
  { id: 'master', title: 'Master Admin', desc: 'No restrictions — full access, including managing other admins.' }
]

export default function CreateAdminUser() {
  const [, setState] = useAppState()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('admin')
  const [password, setPassword] = useState(SEED_ADMIN_PASSWORD)

  function sendInvite() {
    const roleTitle = role === 'master' ? 'Master Admin' : 'Admin'
    addAdminUser(setState, {
      name: name || 'Unnamed admin',
      email,
      password: password || SEED_ADMIN_PASSWORD,
      role: roleTitle
    })
    navigate('/admin/admins')
  }

  return (
    <AdminLayout title="Add Admin User" subtitle="Invite a new team member to the admin portal.">
      <div className="card max-w-lg">
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
        <input
          className="w-full border rounded-lg px-3 py-2 mb-5"
          placeholder="e.g. Naledi Mahlangu"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
        <input
          className="w-full border rounded-lg px-3 py-2 mb-5"
          placeholder="name@gnafastquote.co.za"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Sign-in Password</label>
        <input
          className="w-full border rounded-lg px-3 py-2 mb-1"
          placeholder="Set a password for this admin"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <p className="text-xs text-gray-400 mb-5">
          This is what {name || 'the new admin'} will use to sign in on the Admin Portal.
        </p>
        <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
        <div className="grid grid-cols-1 gap-3 mb-6">
          {ROLES.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => setRole(r.id)}
              className={`text-left border rounded-lg p-3.5 text-sm transition-colors ${
                role === r.id ? 'border-brand-blue bg-blue-50' : 'border-gray-300'
              }`}
            >
              <p className="font-semibold mb-0.5">{r.title}</p>
              <p className="text-xs text-gray-500">{r.desc}</p>
            </button>
          ))}
        </div>
        <div className="flex gap-3">
          <button className="btn-secondary flex-1" onClick={() => navigate('/admin/admins')}>
            Cancel
          </button>
          <button className="btn-primary flex-1" onClick={sendInvite}>
            Send Invite
          </button>
        </div>
      </div>
    </AdminLayout>
  )
}
