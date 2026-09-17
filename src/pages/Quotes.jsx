import { Link } from 'react-router-dom'
import Layout from '../components/Layout'
import { useAppState, currentUser } from '../data/store'

export default function Quotes() {
  const [state] = useAppState()
  const user = currentUser(state)
  const myQuotes = user ? state.quotes.filter((q) => q.ownerEmail === user.email) : state.quotes

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
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b">
                <th className="py-2 font-medium">Reference</th>
                <th className="py-2 font-medium">Project</th>
                <th className="py-2 font-medium">Client</th>
                <th className="py-2 font-medium">Date</th>
                <th className="py-2 font-medium">Total</th>
                <th className="py-2 font-medium">Status</th>
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
                  </tr>
                ))}
            </tbody>
          </table>
        )}
      </div>
    </Layout>
  )
}
