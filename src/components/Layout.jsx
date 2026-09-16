import Sidebar from './Sidebar'

export default function Layout({ title, children }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <header className="flex items-center justify-between px-8 py-6 border-b border-gray-200 bg-white">
          <h1 className="text-2xl font-semibold">{title}</h1>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <span className="h-9 w-9 rounded-full bg-navy-800 text-white flex items-center justify-center text-xs font-semibold">
              JS
            </span>
            <span>John Smith</span>
          </div>
        </header>
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  )
}
