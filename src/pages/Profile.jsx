import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/Layout'
import { useAppState, currentUser, updateUserProfile } from '../data/store'

export default function Profile() {
  const [state, setState] = useAppState()
  const user = currentUser(state)
  const [profile, setProfile] = useState({ fullName: '', companyName: '', nhbrc: '' })
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (user) {
      setProfile({ fullName: user.contact || '', companyName: user.company || '', nhbrc: user.nhbrc || '' })
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
    updateUserProfile(setState, user.id, {
      contact: profile.fullName,
      company: profile.companyName,
      nhbrc: profile.nhbrc
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <Layout title="Profile">
      <div className="card max-w-xl space-y-4">
        <p className="text-sm text-gray-500">
          Signed in as <strong>{user.email}</strong> &mdash; saved to the demo's local database and
          persists across page reloads on this browser. Your logo and certificate here only ever
          appear on quotes generated under your own account.
        </p>
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
          <label className="block text-sm text-gray-500 mb-1">Company name</label>
          <input
            className="w-full border rounded-lg px-3 py-2"
            value={profile.companyName}
            onChange={(e) => setProfile((p) => ({ ...p, companyName: e.target.value }))}
            placeholder="Your construction company"
          />
        </div>
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

        <div>
          <label className="block text-sm text-gray-500 mb-1">Company logo</label>
          <p className="text-xs text-gray-400 mb-2">
            Shown on the top-right of every PDF quote you generate, alongside the GNA Fast Quote logo. PNG, JPEG, WEBP or SVG.
          </p>
          {user.logoDataUrl && (
            <div className="flex items-center gap-3 mb-3 bg-gray-50 border rounded-lg p-3">
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
