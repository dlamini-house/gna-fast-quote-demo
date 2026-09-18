import { useState } from 'react'

export default function ApplicantDetailModal({ applicant, onClose, onApprove, onReject }) {
  const [reason, setReason] = useState('')
  const [showRejectBox, setShowRejectBox] = useState(false)

  if (!applicant) return null

  const initials = applicant.company.slice(0, 2).toUpperCase()
  const isPdf = applicant.certificateType === 'application/pdf'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="bg-white rounded-xl w-full max-w-lg max-h-[88vh] overflow-y-auto">
        <div className="flex items-start justify-between p-6 pb-4 border-b">
          <div className="flex items-center gap-3">
            <span className="avatar-sq !h-11 !w-11 !text-sm">{initials}</span>
            <div>
              <p className="font-bold">{applicant.contact}</p>
              <p className="text-xs text-gray-500">{applicant.company} &middot; Registered {applicant.registered}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-lg leading-none">&#10005;</button>
        </div>

        <div className="p-6 space-y-5">
          <div>
            <h3 className="text-xs font-semibold text-gray-700 mb-2">&#128100; Applicant Information</h3>
            <div className="text-sm space-y-1">
              <div className="flex justify-between"><span className="text-gray-500">Full Name</span><span>{applicant.contact}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Email Address</span><span>{applicant.email}</span></div>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-gray-700 mb-2">&#127970; Company Information</h3>
            <div className="text-sm space-y-1">
              <div className="flex justify-between"><span className="text-gray-500">Company Name</span><span>{applicant.company}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Registration No.</span><span>{applicant.companyReg || '—'}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">VAT Number</span><span>{applicant.vatNumber || '—'}</span></div>
              <div className="flex justify-between gap-6"><span className="text-gray-500 shrink-0">Address</span><span className="text-right">{applicant.companyAddress || '—'}</span></div>
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-gray-700 mb-2">&#128196; NHBRC Information</h3>
            <div className="text-sm space-y-1">
              <div className="flex justify-between"><span className="text-gray-500">NHBRC Number</span><span>{applicant.nhbrc}</span></div>
              {applicant.nhbrcExpiry && (
                <div className="flex justify-between"><span className="text-gray-500">Expiry Date</span><span>{applicant.nhbrcExpiry}</span></div>
              )}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-semibold text-gray-700 mb-2">&#128206; Uploaded NHBRC Certificate</h3>
            {applicant.certificateDataUrl ? (
              <div className="border rounded-lg overflow-hidden">
                {isPdf ? (
                  <iframe title="NHBRC certificate" src={applicant.certificateDataUrl} className="w-full h-64" />
                ) : (
                  <img src={applicant.certificateDataUrl} alt="NHBRC certificate" className="w-full max-h-64 object-contain bg-gray-50" />
                )}
                <div className="flex items-center justify-between px-3 py-2 bg-gray-50 text-xs text-gray-500">
                  <span>{applicant.certificateFileName}</span>
                  <a href={applicant.certificateDataUrl} download={applicant.certificateFileName} className="text-brand-blue font-medium">
                    Download
                  </a>
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 border border-dashed rounded-lg p-4 text-sm text-gray-400 text-center">
                No certificate on file for this demo record.
              </div>
            )}
          </div>

          <div>
            <h3 className="text-xs font-semibold text-gray-700 mb-2">&#127912; Company Logo</h3>
            {applicant.logoDataUrl ? (
              <div className="flex items-center gap-3 bg-gray-50 border rounded-lg p-3">
                <img src={applicant.logoDataUrl} alt={`${applicant.company} logo`} className="h-12 object-contain" />
                <span className="text-sm text-gray-600">{applicant.logoFileName}</span>
              </div>
            ) : (
              <div className="bg-gray-50 border border-dashed rounded-lg p-4 text-sm text-gray-400 text-center">
                No logo uploaded for this demo record.
              </div>
            )}
          </div>

          {applicant.status === 'rejected' && applicant.reason && (
            <div>
              <h3 className="text-xs font-semibold text-gray-700 mb-2">&#10060; Rejection Reason</h3>
              <div className="reason-box">{applicant.reason}</div>
            </div>
          )}
        </div>

        {applicant.status === 'pending' && onApprove && onReject && (
          <div className="p-6 pt-0 space-y-3">
            {!showRejectBox ? (
              <div className="flex gap-3">
                <button
                  className="flex-1 bg-brand-green text-white rounded-lg py-2.5 font-medium hover:bg-green-700"
                  onClick={() => {
                    onApprove(applicant.id)
                    onClose()
                  }}
                >
                  &#10003; Accept
                </button>
                <button
                  className="flex-1 border border-red-300 text-brand-red rounded-lg py-2.5 font-medium hover:bg-red-50"
                  onClick={() => setShowRejectBox(true)}
                >
                  &#10005; Reject
                </button>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1.5">Reason for rejection (shown to the applicant)</label>
                <textarea
                  className="w-full border rounded-lg px-3 py-2 text-sm mb-3"
                  rows={2}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. NHBRC certificate has expired"
                />
                <div className="flex gap-3">
                  <button className="btn-secondary flex-1" onClick={() => setShowRejectBox(false)}>Cancel</button>
                  <button
                    className="btn-red-solid flex-1"
                    onClick={() => {
                      onReject(applicant.id, reason || 'No reason provided.')
                      onClose()
                    }}
                  >
                    Confirm reject
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
