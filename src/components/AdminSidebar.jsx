import { NavLink, useNavigate } from 'react-router-dom'
import { useAppState, currentAdmin, isMasterAdmin, signOutAdmin } from '../data/store'
import { COMPANY_LEGAL_LINE } from '../data/mockData'

export default function AdminSidebar() {
  const [state, setState] = useAppState()
  const navigate = useNavigate()
  const admin = currentAdmin(state)
  const master = isMasterAdmin(state)

  const links = [
    { to: '/admin/verified', label: 'Verified Users', icon: '\u2713' },
    { to: '/admin/potential', label: 'Potential Users', icon: '\u23F3' },
    { to: '/admin/rejected', label: 'Rejected Profiles', icon: '\u2715' },
    ...(master ? [{ to: '/admin/admins', label: 'Admins', icon: '\u2699' }] : [])
  ]

  function handleSwitchRole() {
    signOutAdmin(setState)
    navigate('/')
  }

  return (
    <aside className="w-60 shrink-0 bg-[#0A0F1F] text-white flex flex-col min-h-screen">
      <div className="px-4 pt-6 flex flex-col items-center">
        <div className="bg-white rounded-xl p-2.5">
          <img src="./logo.jpg" alt="GNA Fast Quote" className="h-[92px] w-auto" />
        </div>
        <p className="text-[9px] text-gray-500 text-center mt-2 leading-snug px-1">{COMPANY_LEGAL_LINE}</p>
        <p className="text-[11px] tracking-widest text-blue-400 font-bold pt-3 pb-1">ADMIN PORTAL</p>
        {admin && (
          <div className="w-full mt-2 bg-[#151B2E] rounded-lg px-3 py-2 text-center">
            <p className="text-xs font-semibold truncate">{admin.name}</p>
            <p className="text-[10px] text-gray-400">{admin.role}</p>
          </div>
        )}
      </div>
      <nav className="flex-1 px-3 mt-4 space-y-1">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            className={({ isActive }) =>
              `flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-[#151B2E] text-white border-l-[3px] border-brand-red -ml-1 pl-3.5'
                  : 'text-gray-400 hover:bg-[#151B2E] hover:text-white'
              }`
            }
          >
            <span className="w-4 text-center text-sm">{l.icon}</span>
            {l.label}
          </NavLink>
        ))}
      </nav>
      <div className="px-3 pb-6 space-y-1">
        <button
          onClick={handleSwitchRole}
          className="w-full flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-400 hover:bg-[#151B2E] hover:text-white"
        >
          <span className="w-4 text-center text-sm">&#8594;</span>
          Switch role
        </button>
      </div>
    </aside>
  )
}
