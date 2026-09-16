import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAppState, submitApplication, setCompanyLogo } from '../data/store'
import { COMPANY_LEGAL_LINE } from '../data/mockData'

export default function SignUp() {
  const [, setState] = useAppState()
  const navigate = useNavigate()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [companyReg, setCompanyReg] = useState('')
  const [companyAddress, setCompanyAddress] = useState('')
  const [nhbrc, setNhbrc] = useState('')
  const [expiryDay, setExpiryDay] = useState('')
  const [expiryMonth, setExpiryMonth] = useState('')
  const [expiryYear, setExpiryYear] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [agree, setAgree] = useState(false)
  const [certFile, setCertFile] = useState(null) // { name, dataUrl, type }
  const [logoFile, setLogoFile] = useState(null) // { name, dataUrl, type }
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [showTerms, setShowTerms] = useState(false)

  function handleCertFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 10 * 1024 * 1024) {
      setError('Certificate file is larger than 10MB — please choose a smaller PDF or image.')
      return
    }
    setError('')
    const reader = new FileReader()
    reader.onload = () => setCertFile({ name: file.name, dataUrl: reader.result, type: file.type })
    reader.readAsDataURL(file)
  }

  function handleLogoFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      setError('Logo file is larger than 5MB — please choose a smaller image.')
      return
    }
    setError('')
    const reader = new FileReader()
    reader.onload = () => setLogoFile({ name: file.name, dataUrl: reader.result, type: file.type })
    reader.readAsDataURL(file)
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!fullName || !email || !companyName || !nhbrc || !agree) {
      setError('Please fill in the required fields and accept the Terms & Conditions.')
      return
    }
    const nhbrcExpiry = expiryDay && expiryMonth && expiryYear
      ? `${expiryDay.padStart(2, '0')}/${expiryMonth.padStart(2, '0')}/${expiryYear}`
      : ''
    submitApplication(setState, {
      contact: fullName,
      email,
      company: companyName,
      companyReg,
      companyAddress,
      nhbrc,
      nhbrcExpiry,
      certificateFileName: certFile?.name || null,
      certificateDataUrl: certFile?.dataUrl || null,
      certificateType: certFile?.type || null
    })
    if (logoFile) {
      setCompanyLogo(setState, logoFile)
    }
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <div className="bg-navy-900 py-6 flex justify-center">
          <div className="bg-white rounded-xl p-2.5">
            <img src="./logo.jpg" alt="GNA Fast Quote" className="h-16 w-auto" />
          </div>
        </div>
        <p className="text-[11px] text-gray-400 text-center mt-3">{COMPANY_LEGAL_LINE}</p>
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="card max-w-md text-center">
            <div className="h-14 w-14 rounded-full bg-green-100 text-brand-green flex items-center justify-center text-2xl mx-auto mb-4">
              &#10003;
            </div>
            <h2 className="text-xl font-bold mb-2">Submitted for verification</h2>
            <p className="text-sm text-gray-500 mb-6">
              Thanks, {fullName.split(' ')[0] || 'there'} — your registration for{' '}
              <strong>{companyName}</strong> has been sent to a GNA Fast Quote admin for review.
              You'll be notified once your account is approved.
            </p>
            <button className="btn-primary" onClick={() => navigate('/')}>
              Back to Sign In
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-navy-900 py-6 flex justify-center">
        <div className="bg-white rounded-xl p-3">
          <img src="./logo.jpg" alt="GNA Fast Quote" className="h-24 w-auto" />
        </div>
      </div>
      <p className="text-[11px] text-gray-400 text-center mt-3 mb-2">{COMPANY_LEGAL_LINE}</p>

      <div className="max-w-2xl mx-auto px-6 py-10">
        <div className="card">
          <h1 className="text-2xl font-bold text-center mb-1">Create Your Account</h1>
          <p className="text-sm text-gray-500 text-center mb-8">
            Join GNA FAST QUOTE to manage your projects, quotes and credits.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
              <input className="w-full border rounded-lg px-3 py-2.5" placeholder="Enter your full name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
              <input className="w-full border rounded-lg px-3 py-2.5" placeholder="Enter your email address" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Company Name</label>
              <input className="w-full border rounded-lg px-3 py-2.5" placeholder="Enter your company name" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Company Registration</label>
              <input className="w-full border rounded-lg px-3 py-2.5" placeholder="Enter your company registration number" value={companyReg} onChange={(e) => setCompanyReg(e.target.value)} />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Company Address</label>
              <input className="w-full border rounded-lg px-3 py-2.5" placeholder="Enter your company address" value={companyAddress} onChange={(e) => setCompanyAddress(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">NHBRC Number</label>
                <input className="w-full border rounded-lg px-3 py-2.5" placeholder="Enter your NHBRC number" value={nhbrc} onChange={(e) => setNhbrc(e.target.value)} />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">NHBRC Expiry Date</label>
                <div className="grid grid-cols-3 gap-2">
                  <select
                    className="w-full border rounded-lg px-2 py-2.5 text-sm"
                    value={expiryDay}
                    onChange={(e) => setExpiryDay(e.target.value)}
                  >
                    <option value="">Day</option>
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                      <option key={d} value={d}>{String(d).padStart(2, '0')}</option>
                    ))}
                  </select>
                  <select
                    className="w-full border rounded-lg px-2 py-2.5 text-sm"
                    value={expiryMonth}
                    onChange={(e) => setExpiryMonth(e.target.value)}
                  >
                    <option value="">Month</option>
                    {['January','February','March','April','May','June','July','August','September','October','November','December'].map((m, i) => (
                      <option key={m} value={i + 1}>{String(i + 1).padStart(2, '0')} - {m}</option>
                    ))}
                  </select>
                  <select
                    className="w-full border rounded-lg px-2 py-2.5 text-sm"
                    value={expiryYear}
                    onChange={(e) => setExpiryYear(e.target.value)}
                  >
                    <option value="">Year</option>
                    {Array.from({ length: 12 }, (_, i) => 2024 + i).map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                  </select>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  Format: DD/MM/YYYY{expiryDay && expiryMonth && expiryYear ? ` — ${expiryDay.padStart(2, '0')}/${expiryMonth.padStart(2, '0')}/${expiryYear}` : ''}
                </p>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Upload NHBRC Certificate (PDF or image)</label>
              <label className="block border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-brand-blue transition-colors">
                <input type="file" accept=".pdf,image/*" className="hidden" onChange={handleCertFile} />
                <div className="text-brand-blue text-xl mb-1">&#8613;</div>
                {certFile ? (
                  <p className="text-sm text-gray-700 font-medium">Selected: {certFile.name}</p>
                ) : (
                  <>
                    <p className="text-sm text-gray-600">Drag and drop your file here or click to browse</p>
                    <p className="text-xs text-gray-400 mt-1">Accepted formats: PDF, JPG, PNG (Max 10MB)</p>
                  </>
                )}
              </label>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Upload Your Company Logo (optional)</label>
              <label className="block border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-brand-blue transition-colors">
                <input type="file" accept="image/png,image/jpeg,image/jpg,image/svg+xml,image/webp" className="hidden" onChange={handleLogoFile} />
                <div className="text-brand-blue text-xl mb-1">&#8613;</div>
                {logoFile ? (
                  <div className="flex flex-col items-center gap-2">
                    <img src={logoFile.dataUrl} alt="Your logo" className="h-14 object-contain" />
                    <p className="text-sm text-gray-700 font-medium">Selected: {logoFile.name}</p>
                  </div>
                ) : (
                  <>
                    <p className="text-sm text-gray-600">Drag and drop your logo here or click to browse</p>
                    <p className="text-xs text-gray-400 mt-1">PNG, JPEG, WEBP or SVG (Max 5MB) — this appears on your generated quote PDFs</p>
                  </>
                )}
              </label>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="w-full border rounded-lg px-3 py-2.5 pr-9"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" onClick={() => setShowPassword((v) => !v)}>
                  &#128065;
                </button>
              </div>
            </div>

            <label className="flex items-center gap-2 text-sm text-gray-600 mb-6">
              <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
              I agree to the{' '}
              <button type="button" className="text-brand-blue underline" onClick={() => setShowTerms(true)}>
                Terms &amp; Conditions
              </button>
            </label>

            {error && <p className="text-sm text-brand-red mb-4">{error}</p>}

            <button type="submit" className="w-full bg-brand-red text-white rounded-lg py-3 font-semibold hover:bg-red-700 transition-colors">
              Submit for Verification
            </button>

            <p className="text-xs text-gray-400 text-center mt-4">
              After signing up your account will be reviewed and verified. You will be notified once
              your account has been approved.
            </p>
            <p className="text-sm text-center text-gray-600 mt-4">
              Already have an account? <Link to="/" className="text-brand-blue font-semibold">Sign in</Link>
            </p>
          </form>
        </div>
      </div>

      {showTerms && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="bg-white rounded-xl w-full max-w-3xl h-[85vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-5 py-3 border-b">
              <p className="font-semibold text-sm">Terms &amp; Conditions</p>
              <button onClick={() => setShowTerms(false)} className="text-gray-400 hover:text-gray-600 text-lg leading-none">&#10005;</button>
            </div>
            <iframe title="Terms and Conditions" src="./terms-full.html" className="flex-1 w-full" />
          </div>
        </div>
      )}
    </div>
  )
}
