import { useEffect, useState } from 'react'
import Layout from '../components/Layout'
import { useAppState, setCompanyLogo } from '../data/store'
import { db } from '../data/db'

export default function Profile() {
  const [state, setState] = useAppState()
  const [profile, setProfile] = useState({ fullName: '', companyName: '', nhbrc: '' })
  const [saved, setSaved] = useState(false)
  const [certFile, setCertFile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([db.get('companies', 'me'), db.get('documents', 'nhbrc-certificate')]).then(
      ([company, cert]) => {
        if (company) setProfile({ fullName: company.fullName || '', companyName: company.companyName || '', nhbrc: company.nhbrc || '' })
        if (cert) setCertFile(cert)
        setLoading(false)
      }
    )
  }, [])

  function handleLogoFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      setCompanyLogo(setState, { name: file.name, dataUrl: reader.result, type: file.type })
    }
    reader.readAsDataURL(file)
  }

  async function handleCertFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = async () => {
      const record = await db.set('documents', 'nhbrc-certificate', {
        fileName: file.name,
        fileType: file.type,
        dataUrl: reader.result
      })
      setCertFile(record)
    }
    reader.readAsDataURL(file)
  }

  async function handleSave() {
    await db.set('companies', 'me', profile)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  if (loading) {
    return (
      <Layout title="Profile">
        <p className="text-sm text-gray-400">Loading your saved profile…</p>
      </Layout>
    )
  }

  return (
    <Layout title="Profile">
      <div className="card max-w-xl space-y-4">
        <p className="text-sm text-gray-500">
          Saved in the demo's local database &mdash; no login, but it persists across page reloads
          on this browser.
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
          {certFile && (
            <div className="flex items-center justify-between mb-3 bg-gray-50 border rounded-lg p-3 text-sm">
              <span className="text-gray-600">{certFile.fileName}</span>
              <a href={certFile.dataUrl} download={certFile.fileName} className="text-brand-blue font-medium">Download</a>
            </div>
          )}
          <label className="block border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-brand-blue transition-colors">
            <input type="file" accept=".pdf,image/*" className="hidden" onChange={handleCertFile} />
            <p className="text-sm text-gray-600">{certFile ? 'Click to replace certificate' : 'Click to upload your NHBRC certificate'}</p>
          </label>
        </div>

        <div>
          <label className="block text-sm text-gray-500 mb-1">Company logo</label>
          <p className="text-xs text-gray-400 mb-2">
            Shown on the top-right of every PDF quote you generate. PNG, JPEG, WEBP or SVG.
          </p>
          {state.companyLogo && (
            <div className="flex items-center gap-3 mb-3 bg-gray-50 border rounded-lg p-3">
              <img src={state.companyLogo.dataUrl} alt="Your company logo" className="h-12 object-contain" />
              <span className="text-sm text-gray-600">{state.companyLogo.name}</span>
            </div>
          )}
          <label className="block border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-brand-blue transition-colors">
            <input type="file" accept="image/png,image/jpeg,image/jpg,image/webp,image/svg+xml" className="hidden" onChange={handleLogoFile} />
            <p className="text-sm text-gray-600">{state.companyLogo ? 'Click to replace logo' : 'Click to upload your company logo'}</p>
          </label>
        </div>

        <button className="btn-primary" onClick={handleSave}>
          {saved ? 'Saved ✓' : 'Save changes'}
        </button>
      </div>
    </Layout>
  )
}
