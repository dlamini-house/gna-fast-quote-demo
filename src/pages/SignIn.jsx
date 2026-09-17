import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { COMPANY_LEGAL_LINE } from '../data/mockData'
import { useAppState, findUserAccount, setCurrentUser } from '../data/store'

const FEATURES = [
  { icon: '\u{1F4CB}', label: 'Upload Architectural Plans' },
  { icon: '\u{1F50D}', label: 'Review Extracted Information' },
  { icon: '\u{1F477}', label: 'Add Labour Rates' },
  { icon: '\u{1F4C4}', label: 'Generate Professional PDF Quotes' }
]

export default function SignIn() {
  const [state, setState] = useAppState()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  function handleSignIn(e) {
    e.preventDefault()
    const account = findUserAccount(state, email)

    if (!account || account.password !== password) {
      setError('Invalid email or password.')
      return
    }
    if (account.status === 'pending') {
      setError('Your registration is still pending admin approval. You’ll be able to sign in once it’s verified.')
      return
    }
    if (account.status === 'rejected') {
      setError(`Your registration was not approved.${account.reason ? ` ${account.reason}` : ''}`)
      return
    }

    setError('')
    setCurrentUser(setState, account.email)
    navigate('/dashboard')
  }

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left hero panel */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-navy-900 text-white overflow-hidden flex-col justify-between p-12">
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.6) 1px, transparent 1px)',
            backgroundSize: '36px 36px'
          }}
        />
        <div className="relative z-10">
          <div className="bg-white rounded-xl p-4 inline-block shadow-lg">
            <img src="./logo.jpg" alt="GNA Fast Quote" className="h-32 w-auto" />
          </div>
          <p className="text-[11px] text-blue-100/70 mt-2 tracking-wide">{COMPANY_LEGAL_LINE}</p>

          <h1 className="text-4xl font-bold leading-tight mt-16 mb-2">
            Smarter Quotes.
            <br />
            Stronger Business.
          </h1>
          <div className="h-1 w-14 bg-brand-red rounded-full mb-6"></div>
          <p className="text-blue-100/80 max-w-sm leading-relaxed">
            Upload plans, extract quantities, apply your pricing and labour rates, and generate
            professional PDF quotes in minutes.
          </p>

          <div className="mt-10 space-y-4">
            {FEATURES.map((f) => (
              <div key={f.label} className="flex items-center gap-3">
                <span className="h-9 w-9 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-base">
                  {f.icon}
                </span>
                <span className="text-sm text-blue-50">{f.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-xs text-blue-100/70">
          {COMPANY_LEGAL_LINE}
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-gray-50">
        <div className="w-full max-w-sm">
          <div className="flex justify-center mb-6">
            <img src="./logo.jpg" alt="GNA Fast Quote" className="h-36 w-auto" />
          </div>
          <p className="text-[11px] text-gray-400 text-center -mt-3 mb-4">{COMPANY_LEGAL_LINE}</p>
          <h2 className="text-2xl font-bold text-center mb-1">Welcome back</h2>
          <p className="text-sm text-gray-500 text-center mb-8">Sign in to your account to continue</p>

          <form onSubmit={handleSignIn} className="card">
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
            <div className="relative mb-4">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">&#9993;</span>
              <input
                className="w-full border rounded-lg pl-9 pr-3 py-2.5"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-sm font-medium text-gray-700">Password</label>
              <a href="#" className="text-xs text-brand-blue font-medium">Forgot password?</a>
            </div>
            <div className="relative mb-6">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">&#128274;</span>
              <input
                type={showPassword ? 'text' : 'password'}
                className="w-full border rounded-lg pl-9 pr-9 py-2.5"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm"
                onClick={() => setShowPassword((v) => !v)}
              >
                &#128065;
              </button>
            </div>

            {error && <p className="text-sm text-brand-red mb-4">{error}</p>}

            <button
              type="submit"
              className="w-full bg-brand-red text-white rounded-lg py-3 font-semibold hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
            >
              Sign In <span>&rarr;</span>
            </button>
          </form>

          <p className="text-center text-[11px] text-gray-400 mt-4">
            Demo tip: sign up for an account, have an admin approve it, then sign in here with the
            email and password you registered with.
          </p>

          <p className="text-center text-sm text-gray-600 mt-6">
            Don&apos;t have an account?{' '}
            <Link to="/sign-up" className="text-brand-blue font-semibold">Sign up</Link>
          </p>

          <div className="border-t border-gray-200 mt-8 pt-4 flex flex-col items-center gap-2">
            <p className="text-xs text-gray-400 flex items-center gap-1.5">
              &#128737; Secure &middot; Your data is protected with enterprise-grade security
            </p>
            <Link to="/admin-sign-in" className="text-xs text-gray-400 hover:text-brand-blue">
              Administrator? Go to the Admin Portal
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
