import AdminSidebar from './AdminSidebar'

export default function AdminLayout({ title, subtitle, right, children }) {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />
      <div className="flex-1 flex flex-col">
        <div className="flex items-start justify-between px-8 pt-6 pb-5">
          <div>
            <h1 className="text-2xl font-bold">{title}</h1>
            {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
          </div>
          {right && <div className="flex items-center gap-4">{right}</div>}
        </div>
        <main className="flex-1 px-8 pb-8">{children}</main>
      </div>
    </div>
  )
}
