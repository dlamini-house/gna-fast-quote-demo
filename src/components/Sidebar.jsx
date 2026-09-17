import { NavLink, useNavigate } from 'react-router-dom'
import { COMPANY_LEGAL_LINE } from '../data/mockData'
import { useAppState, currentUser, signOutUser } from '../data/store'

const links = [
  { to: '/dashboard', label: 'Dashboard', icon: '\u2302', end: true },
  { to: '/new-quote', label: 'New Quote', icon: '\u2795' },
  { to: '/quotes', label: 'Quotes', icon: '\u2261' },
  { to: '/pricing', label: 'Pricing & Credits', icon: '\u25A6' },
  { to: '/profile', label: 'Profile', icon: '\u263A' },
  { to: '/terms', label: 'Terms & Conditions', icon: '\u2263' }
]

export default function Sidebar() {
  const [state, setState] = useAppState()
  const navigate = useNavigate()
  const user = currentUser(state)

  function handleSignOut() {
    signOutUser(setState)
    navigate('/')
  }

  return (
    <aside className="w-64 shrink-0 bg-navy-900 text-white flex flex-col min-h-screen">
      <div className="px-6 py-6 flex flex-col items-center">
        <div className="bg-white rounded-xl p-3">
          <img src="./logo.jpg" alt="GNA Fast Quote" className="h-24 w-auto" />
        </div>
        <p className="text-[10px] text-gray-400 text-center mt-2 leading-snug px-2">{COMPANY_LEGAL_LINE}</p>
        {user && (
          <div className="w-full mt-3 bg-navy-800 rounded-lg px-3 py-2 text-center">
            <p className="text-xs font-semibold truncate">{user.company}</p>
            <p className="text-[10px] text-gray-400 truncate">{user.email}</p>
          </div>
        )}
      </div>
      <nav className="flex-1 px-3 space-y-1">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.end}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-navy-700 text-white border-l-4 border-brand-red -ml-1 pl-4'
                  : 'text-gray-300 hover:bg-navy-800 hover:text-white'
              }`
            }
          >
            <span className="text-base leading-none w-4 text-center">{l.icon}</span>
            {l.label}
          </NavLink>
        ))}
      </nav>
      <div className="px-3 pb-6">
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-300 hover:bg-navy-800 hover:text-white transition-colors"
        >
          <span className="text-base leading-none w-4 text-center">&#8674;</span>
          Sign out
        </button>
      </div>
    </aside>
  )
}
