import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/Layout'
import { useAppState, currentUser, updateUserProfile } from '../data/store'

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

function parseExpiry(nhbrcExpiry) {
  const [day, month, year] = (nhbrcExpiry || '').split('/')
  return { day: day || '', month: month ? String(Number(month)) : '', year: year || '' }
}

export default function Profile() {
  const [state, setState] = useAppState()
  const user = currentUser(state)
  const [profile, setProfile] = useState({
    fullName: '', companyName: '', companyReg: '', vatNumber: '', companyAddress: '',
    nhbrc: '', expiryDay: '', expiryMonth: '', expiryYear: ''
  })
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (user) {
      const { day, month, year } = parseExpiry(user.nhbrcExpiry)
      setProfile({
        fullName: user.contact || '',
        companyName: user.company || '',
        companyReg: user.companyReg || '',
        vatNumber: user.vatNumber || '',
        companyAddress: user.companyAddress || '',
        nhbrc: user.nhbrc || '',
        expiryDay: day,
        expiryMonth: month,
        expiryYear: year
      })
    }
  }, [user?.id])

  if (!user) {
    return (
      <Layout title="Profile">
        <div className="card max-w-xl text-center">
          <p className="text-sm text-gray-500 mb-4">You need to sign in to view your profile.</p>
          <Link to="/" className="btn-primary">Go to Sign In</Link>
        </div>
      </Layout>
    )
  }

  function handleLogoFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      updateUserProfile(setState, user.id, {
        logoFileName: file.name,
        logoType: file.type,
        logoDataUrl: reader.result
      })
    }
    reader.readAsDataURL(file)
  }

  function handleCertFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      updateUserProfile(setState, user.id, {
        certificateFileName: file.name,
        certificateType: file.type,
        certificateDataUrl: reader.result
      })
    }
    reader.readAsDataURL(file)
  }

  function handleSave() {
    const nhbrcExpiry = profile.expiryDay && profile.expiryMonth && profile.expiryYear
      ? `${String(profile.expiryDay).padStart(2, '0')}/${String(profile.expiryMonth).padStart(2, '0')}/${profile.expiryYear}`
      : ''
    updateUserProfile(setState, user.id, {
      contact: profile.fullName,
      company: profile.companyName,
      companyReg: profile.companyReg,
      vatNumber: profile.vatNumber,
      companyAddress: profile.companyAddress,
      nhbrc: profile.nhbrc,
      nhbrcExpiry
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <Layout title="Profile">
      <div className="space-y-6 max-w-xl">
        <p className="text-sm text-gray-500">
          Signed in as <strong>{user.email}</strong> &mdash; saved to the demo's local database and
          persists across page reloads on this browser. Your logo and certificate here only ever
          appear on quotes generated under your own account.
        </p>

        <div className="card space-y-4">
          <h2 className="text-sm font-semibold text-gray-700">Personal details</h2>
          <div>
            <label className="block text-sm text-gray-500 mb-1">Full name</label>
            <input
              className="w-full border rounded-lg px-3 py-2"
              value={profile.fullName}
              onChange={(e) => setProfile((p) => ({ ...p, fullName: e.target.value }))}
              placeholder="John Smith"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-500 mb-1">Email address</label>
            <input className="w-full border rounded-lg px-3 py-2 bg-gray-50 text-gray-500" value={user.email} disabled />
            <p className="text-xs text-gray-400 mt-1">This is your sign-in email and can't be changed here.</p>
          </div>
          <div>
            <label className="block text-sm text-gray-500 mb-1">Password</label>
            <input className="w-full border rounded-lg px-3 py-2 bg-gray-50 text-gray-500" value="••••••••••••" disabled />
            <p className="text-xs text-gray-400 mt-1">Password changes aren't available in this demo.</p>
          </div>
        </div>

        <div className="card space-y-4">
          <h2 className="text-sm font-semibold text-gray-700">Company details</h2>
          <div>
            <label className="block text-sm text-gray-500 mb-1">Company name</label>
            <input
              className="w-full border rounded-lg px-3 py-2"
              value={profile.companyName}
              onChange={(e) => setProfile((p) => ({ ...p, companyName: e.target.value }))}
              placeholder="Your construction company"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-500 mb-1">Company registration</label>
              <input
                className="w-full border rounded-lg px-3 py-2"
                value={profile.companyReg}
                onChange={(e) => setProfile((p) => ({ ...p, companyReg: e.target.value }))}
                placeholder="2020/123456/07"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-500 mb-1">
                VAT number <span className="text-gray-400">(optional)</span>
              </label>
              <input
                className="w-full border rounded-lg px-3 py-2"
                value={profile.vatNumber}
                onChange={(e) => setProfile((p) => ({ ...p, vatNumber: e.target.value }))}
                placeholder="4123456789"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-500 mb-1">Company address</label>
            <input
              className="w-full border rounded-lg px-3 py-2"
              value={profile.companyAddress}
              onChange={(e) => setProfile((p) => ({ ...p, companyAddress: e.target.value }))}
              placeholder="12 Main Road, Centurion, 0157"
            />
            <p className="text-xs text-gray-400 mt-1">Shown on every PDF quote you generate.</p>
          </div>
        </div>

        <div className="card space-y-4">
          <h2 className="text-sm font-semibold text-gray-700">NHBRC details</h2>
          <div>
            <label className="block text-sm text-gray-500 mb-1">NHBRC number</label>
            <input
              className="w-full border rounded-lg px-3 py-2"
              value={profile.nhbrc}
              onChange={(e) => setProfile((p) => ({ ...p, nhbrc: e.target.value }))}
              placeholder="NHBRC-000000"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-500 mb-1">NHBRC expiry date</label>
            <div className="grid grid-cols-3 gap-2">
              <select
                className="w-full border rounded-lg px-2 py-2 text-sm"
                value={profile.expiryDay}
                onChange={(e) => setProfile((p) => ({ ...p, expiryDay: e.target.value }))}
              >
                <option value="">Day</option>
                {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                  <option key={d} value={d}>{String(d).padStart(2, '0')}</option>
                ))}
              </select>
              <select
                className="w-full border rounded-lg px-2 py-2 text-sm"
                value={profile.expiryMonth}
                onChange={(e) => setProfile((p) => ({ ...p, expiryMonth: e.target.value }))}
              >
                <option value="">Month</option>
                {MONTHS.map((m, i) => (
                  <option key={m} value={i + 1}>{String(i + 1).padStart(2, '0')} - {m}</option>
                ))}
              </select>
              <select
                className="w-full border rounded-lg px-2 py-2 text-sm"
                value={profile.expiryYear}
                onChange={(e) => setProfile((p) => ({ ...p, expiryYear: e.target.value }))}
              >
                <option value="">Year</option>
                {Array.from({ length: 12 }, (_, i) => 2024 + i).map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            <p className="text-xs text-gray-400 mt-1">Format: DD/MM/YYYY</p>
          </div>

          <div>
            <label className="block text-sm text-gray-500 mb-1">NHBRC certificate</label>
            <p className="text-xs text-gray-400 mb-2">PDF or image, uploaded at sign-up — replace it here if it changes.</p>
            {user.certificateDataUrl && (
              <div className="flex items-center justify-between mb-3 bg-gray-50 border rounded-lg p-3 text-sm">
                <span className="text-gray-600">{user.certificateFileName}</span>
                <a href={user.certificateDataUrl} download={user.certificateFileName} className="text-brand-blue font-medium">Download</a>
              </div>
            )}
            <label className="block border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-brand-blue transition-colors">
              <input type="file" accept=".pdf,image/*" className="hidden" onChange={handleCertFile} />
              <p className="text-sm text-gray-600">{user.certificateDataUrl ? 'Click to replace certificate' : 'Click to upload your NHBRC certificate'}</p>
            </label>
          </div>
        </div>

        <div className="card space-y-4">
          <h2 className="text-sm font-semibold text-gray-700">Company logo</h2>
          <p className="text-xs text-gray-400">
            Shown on every PDF quote you generate, alongside the GNA Fast Quote logo. PNG, JPEG, WEBP or SVG.
          </p>
          {user.logoDataUrl && (
            <div className="flex items-center gap-3 bg-gray-50 border rounded-lg p-3">
              <img src={user.logoDataUrl} alt="Your company logo" className="h-12 object-contain" />
              <span className="text-sm text-gray-600">{user.logoFileName}</span>
            </div>
          )}
          <label className="block border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-brand-blue transition-colors">
            <input type="file" accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml" className="hidden" onChange={handleLogoFile} />
            <p className="text-sm text-gray-600">{user.logoDataUrl ? 'Click to replace logo' : 'Click to upload your company logo'}</p>
          </label>
        </div>

        <button className="btn-primary" onClick={handleSave}>
          {saved ? 'Saved ✓' : 'Save changes'}
        </button>
      </div>
    </Layout>
  )
}
