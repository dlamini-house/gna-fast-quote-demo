import { Link, useNavigate } from 'react-router-dom'
import { useAppState, signInAsAdmin } from '../data/store'
import { COMPANY_LEGAL_LINE } from '../data/mockData'

export default function AdminSignIn() {
  const [state, setState] = useAppState()
  const navigate = useNavigate()

  function pick(email) {
    signInAsAdmin(setState, email)
    navigate('/admin/potential')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-6">
          <div className="bg-navy-900 rounded-xl p-3 inline-block">
            <img src="./logo.jpg" alt="GNA Fast Quote" className="h-20 w-auto" />
          </div>
        </div>
        <p className="text-[11px] text-gray-400 text-center mb-4">{COMPANY_LEGAL_LINE}</p>
        <h2 className="text-xl font-bold text-center mb-1">Admin Portal</h2>
        <p className="text-sm text-gray-500 text-center mb-8">
          Demo only — pick an admin account to sign in as. This decides what you can see.
        </p>

        <div className="card space-y-2">
          {state.adminUsers.map((a) => (
            <button
              key={a.id}
              onClick={() => pick(a.email)}
              className="w-full flex items-center justify-between border rounded-lg px-4 py-3 hover:border-brand-blue hover:bg-blue-50 transition-colors text-left"
            >
              <div>
                <p className="font-semibold text-sm">{a.name}</p>
                <p className="text-xs text-gray-500">{a.email}</p>
              </div>
              <span className={`badge ${a.role === 'Master Admin' ? 'badge-verified' : 'badge-pending'}`}>
                {a.role}
              </span>
            </button>
          ))}
        </div>

        <p className="text-center text-sm mt-6">
          <Link to="/" className="text-brand-blue font-semibold">&larr; Back to Sign In</Link>
        </p>
      </div>
    </div>
  )
}
