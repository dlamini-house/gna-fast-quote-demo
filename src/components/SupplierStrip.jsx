const SUPPLIERS = [
  { name: 'BUCO', src: './suppliers/buco.jpg' },
  { name: 'Leroy Merlin', src: './suppliers/leroy-merlin.jpg' },
  { name: 'Build it', src: './suppliers/buildit.jpg' }
]

export default function SupplierStrip({ dark = false }) {
  return (
    <div
      className={`rounded-xl border px-5 py-4 ${
        dark ? 'bg-navy-800/60 border-white/10' : 'bg-white border-gray-200'
      }`}
    >
      <p
        className={`text-xs font-semibold tracking-wide uppercase mb-3 text-center ${
          dark ? 'text-blue-100/80' : 'text-gray-500'
        }`}
      >
        GNA Fast Quote uses real-time data and the latest prices from credible suppliers
      </p>
      <div className="flex items-center justify-center gap-6 flex-wrap">
        {SUPPLIERS.map((s) => (
          <div
            key={s.name}
            className="bg-white rounded-lg p-2 shadow-sm border border-gray-100 flex items-center justify-center"
            style={{ width: 72, height: 72 }}
          >
            <img src={s.src} alt={s.name} className="max-w-full max-h-full object-contain rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}
