import { Link } from 'react-router-dom'
import Layout from '../components/Layout'
import { useAppState, trialStatus, currentUser } from '../data/store'

export default function Dashboard() {
  const [state] = useAppState()
  const user = currentUser(state)
  const trial = trialStatus(state)
  const myQuotes = user ? state.quotes.filter((q) => q.ownerEmail === user.email) : state.quotes
  const draftCount = myQuotes.filter((q) => q.status === 'draft').length
  const completedCount = myQuotes.filter((q) => q.status === 'completed').length

  return (
    <Layout title="Dashboard">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <p className="text-sm text-gray-500 mb-1">Plan status</p>
          <p className="text-2xl font-bold">{state.plan ? state.plan.name : 'Free trial'}</p>
          {!state.plan && (
            <p className={`text-sm mt-1 ${trial.trialExpired ? 'text-brand-red' : 'text-gray-500'}`}>
              {trial.trialExpired
                ? 'Trial ended'
                : `${trial.daysLeft} day(s) or ${trial.quotesLeft} quote(s) left`}
            </p>
          )}
        </div>
        <div className="card">
          <p className="text-sm text-gray-500 mb-1">Credits remaining</p>
          <p className="text-2xl font-bold">{state.credits}</p>
          <Link to="/pricing" className="text-brand-blue text-sm font-medium">
            Buy credits &rarr;
          </Link>
        </div>
        <div className="card">
          <p className="text-sm text-gray-500 mb-1">Quotes</p>
          <p className="text-2xl font-bold">{myQuotes.length} total</p>
          <p className="text-sm text-gray-500">{draftCount} draft &middot; {completedCount} completed</p>
        </div>
      </div>

      {user && (
        <div className="card mb-8">
          <p className="text-sm text-gray-500">
            Signed in as <strong>{user.contact}</strong> &middot; {user.company}
          </p>
        </div>
      )}

      <div className="card mb-8 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold mb-1">Start a new quote</h2>
          <p className="text-sm text-gray-500">
            Upload plans, review quantities, set pricing and generate a client-ready PDF.
          </p>
        </div>
        <Link to="/new-quote" className="btn-primary">
          New Quote
        </Link>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold mb-4">Recent activity</h2>
        {myQuotes.length === 0 ? (
          <p className="text-sm text-gray-500">No quotes yet. Create your first one to see it here.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {myQuotes
              .slice()
              .reverse()
              .slice(0, 5)
              .map((q) => (
                <li key={q.id} className="py-3 flex items-center justify-between text-sm">
                  <span>{q.projectName}</span>
                  <span className="text-gray-500">R {q.total.toFixed(2)}</span>
                  <span className="capitalize text-gray-500">{q.status}</span>
                </li>
              ))}
          </ul>
        )}
      </div>
    </Layout>
  )
}
