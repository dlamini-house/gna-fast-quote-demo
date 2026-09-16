import { Link } from 'react-router-dom'
import Layout from '../components/Layout'
import { useAppState } from '../data/store'

export default function Quotes() {
  const [state] = useAppState()

  return (
    <Layout title="Quotes">
      <div className="card">
        {state.quotes.length === 0 ? (
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
                <th className="py-2 font-medium">Project</th>
                <th className="py-2 font-medium">Customer</th>
                <th className="py-2 font-medium">Date</th>
                <th className="py-2 font-medium">Total</th>
                <th className="py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {state.quotes
                .slice()
                .reverse()
                .map((q) => (
                  <tr key={q.id} className="border-b last:border-0">
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
