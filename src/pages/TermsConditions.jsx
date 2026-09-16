import Layout from '../components/Layout'

export default function TermsConditions() {
  return (
    <Layout title="Terms & Conditions">
      <div className="card p-0 overflow-hidden" style={{ height: '75vh' }}>
        <iframe title="Terms and Conditions" src="./terms-full.html" className="w-full h-full" />
      </div>
    </Layout>
  )
}
