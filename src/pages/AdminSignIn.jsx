import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAppState, findAdminAccount, signInAsAdmin } from '../data/store'
import { COMPANY_LEGAL_LINE } from '../data/mockData'

export default function AdminSignIn() {
  const [state, setState] = useAppState()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  function handleSignIn(e) {
    e.preventDefault()
    const account = findAdminAccount(state, email)
    if (!account || account.password !== password) {
      setError('Invalid email or password.')
      return
    }
    setError('')
    signInAsAdmin(setState, account.email)
    navigate('/admin/potential')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="flex justify-center mb-6">
          <div className="bg-navy-900 rounded-xl p-3 inline-block">
            <img src="./logo.jpg" alt="GNA Fast Quote" className="h-20 w-auto" />
          </div>
        </div>
        <p className="text-[11px] text-gray-400 text-center mb-4">{COMPANY_LEGAL_LINE}</p>
        <h2 className="text-xl font-bold text-center mb-1">Admin Portal</h2>
        <p className="text-sm text-gray-500 text-center mb-8">
          Sign in with an admin account to review and manage registrations.
        </p>

        <form onSubmit={handleSignIn} className="card">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
          <input
            className="w-full border rounded-lg px-3 py-2.5 mb-4"
            placeholder="name@gnafastquote.co.za"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
          <input
            type="password"
            className="w-full border rounded-lg px-3 py-2.5 mb-6"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && <p className="text-sm text-brand-red mb-4">{error}</p>}

          <button
            type="submit"
            className="w-full bg-brand-red text-white rounded-lg py-3 font-semibold hover:bg-red-700 transition-colors"
          >
            Sign In
          </button>
        </form>

        <div className="card mt-4 bg-blue-50 border-blue-100">
          <p className="text-xs font-semibold text-gray-700 mb-2">Demo admin accounts</p>
          <ul className="space-y-1.5">
            {state.adminUsers.map((a) => (
              <li key={a.id}>
                <button
                  type="button"
                  onClick={() => { setEmail(a.email); setError('') }}
                  className="w-full flex items-center justify-between text-left text-xs bg-white border rounded-lg px-3 py-2 hover:border-brand-blue transition-colors"
                >
                  <span>
                    <span className="font-medium text-gray-700">{a.name}</span>{' '}
                    <span className="text-gray-400">&middot; {a.email}</span>
                  </span>
                  <span className={`badge ${a.role === 'Master Admin' ? 'badge-verified' : 'badge-pending'}`}>
                    {a.role}
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <p className="text-[11px] text-gray-400 mt-2">
            Click an account to fill in its email, then sign in with the demo password:{' '}
            <span className="font-mono">GnaAdmin2026</span>
          </p>
        </div>

        <p className="text-center text-sm mt-6">
          <Link to="/" className="text-brand-blue font-semibold">&larr; Back to Sign In</Link>
        </p>
      </div>
    </div>
  )
}
