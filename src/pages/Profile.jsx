import Layout from '../components/Layout'
import { useAppState, setCompanyLogo } from '../data/store'

export default function Profile() {
  const [state, setState] = useAppState()

  function handleLogoFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      setCompanyLogo(setState, { name: file.name, dataUrl: reader.result, type: file.type })
    }
    reader.readAsDataURL(file)
  }

  return (
    <Layout title="Profile">
      <div className="card max-w-xl space-y-4">
        <p className="text-sm text-gray-500">
          This is a placeholder profile page for the demo &mdash; there's no authentication yet, so
          these fields aren't tied to a real account.
        </p>
        <div>
          <label className="block text-sm text-gray-500 mb-1">Full name</label>
          <input className="w-full border rounded-lg px-3 py-2" defaultValue="John Smith" />
        </div>
        <div>
          <label className="block text-sm text-gray-500 mb-1">Company name</label>
          <input className="w-full border rounded-lg px-3 py-2" placeholder="Your construction company" />
        </div>
        <div>
          <label className="block text-sm text-gray-500 mb-1">NHBRC number</label>
          <input className="w-full border rounded-lg px-3 py-2" placeholder="NHBRC-000000" />
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
            <p className="text-sm text-gray-600">
              {state.companyLogo ? 'Click to replace logo' : 'Click to upload your company logo'}
            </p>
          </label>
        </div>
        <button className="btn-primary">Save changes</button>
      </div>
    </Layout>
  )
}
