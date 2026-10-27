import { useState } from 'react'
import { Link } from 'react-router-dom'
import Layout from '../components/Layout'
import { useAppState, currentUser } from '../data/store'
import { downloadSavedQuote, downloadSavedBoq } from '../data/quotePdf'
import { db } from '../data/db'

export default function Quotes() {
  const [state, setState] = useAppState()
  const user = currentUser(state)
  const myQuotes = user ? state.quotes.filter((q) => q.ownerEmail === user.email) : state.quotes
  const [toDelete, setToDelete] = useState(null) // quote awaiting "Are you sure?"

  async function confirmDelete() {
    if (!toDelete) return
    const id = toDelete.id
    setState((s) => ({ ...s, quotes: s.quotes.filter((q) => q.id !== id) }))
    try {
      await db.remove('quotes', String(id))
    } catch (e) {
      console.warn('Could not remove quote from local database', e)
    }
    setToDelete(null)
  }

  return (
    <Layout title="Quotes">
      <div className="card">
        {myQuotes.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-gray-500 mb-4">No quotes yet.</p>
            <Link to="/new-quote" className="btn-primary">
              Create your first quote
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="py-2 font-medium">Reference</th>
                  <th className="py-2 font-medium">Project</th>
                  <th className="py-2 font-medium">Client</th>
                  <th className="py-2 font-medium">Date</th>
                  <th className="py-2 font-medium">Total</th>
                  <th className="py-2 font-medium">Status</th>
                  <th className="py-2 font-medium text-right">Download</th>
                  <th className="py-2 font-medium text-right"></th>
                </tr>
              </thead>
              <tbody>
                {myQuotes
                  .slice()
                  .reverse()
                  .map((q) => (
                    <tr key={q.id} className="border-b last:border-0">
                      <td className="py-3 text-gray-500">{q.reference || '-'}</td>
                      <td className="py-3">{q.projectName}</td>
                      <td className="py-3">{q.customerName || '-'}</td>
                      <td className="py-3">{new Date(q.createdAt).toLocaleDateString()}</td>
                      <td className="py-3">R {q.total.toFixed(2)}</td>
                      <td className="py-3 capitalize">{q.status}</td>
                      <td className="py-3 text-right whitespace-nowrap">
                        <button className="btn-secondary text-xs px-3 py-1.5 mr-2" onClick={() => downloadSavedQuote(q, user)}>
                          Quote
                        </button>
                        <button
                          className="btn-secondary text-xs px-3 py-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
                          disabled={!q.boqData}
                          title={q.boqData ? 'Download the bill of quantities' : 'This quote was saved before the BOQ was available'}
                          onClick={() => downloadSavedBoq(q, user)}
                        >
                          BOQ
                        </button>
                      </td>
                      <td className="py-3 text-right">
                        <button className="text-xs text-gray-400 hover:text-brand-red px-2 py-1.5" onClick={() => setToDelete(q)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {toDelete && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => setToDelete(null)}>
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-semibold mb-2">Delete this quote?</h3>
            <p className="text-sm text-gray-500 mb-5">
              {toDelete.reference} &middot; {toDelete.projectName} (R {toDelete.total.toFixed(2)}) will be removed from your saved quotes. This can&rsquo;t be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button className="btn-secondary" onClick={() => setToDelete(null)}>Cancel</button>
              <button className="btn-primary" onClick={confirmDelete}>Delete quote</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  )
}
