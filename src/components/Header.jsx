import { Link, useLocation } from 'react-router-dom';

export default function Header() {
  const { pathname } = useLocation();
  const isPractice = pathname === '/practice';

  return (
    <header className="bg-white border-b border-slate-100 sticky top-0 z-20">
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 select-none">
          <div className="w-8 h-8 rounded-xl bg-brand-600 flex items-center justify-center text-white font-black text-sm leading-none">
            ×
          </div>
          <span className="font-black text-lg text-slate-800 tracking-tight">Math Practice</span>
        </Link>

        {/* Nav — compact on mobile */}
        <nav className="flex items-center gap-1 text-sm font-semibold">
          <Link
            to="/"
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              pathname === '/'
                ? 'bg-brand-50 text-brand-700'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Home
          </Link>
          <Link
            to="/practice"
            className={`px-3 py-1.5 rounded-lg transition-colors ${
              isPractice
                ? 'bg-brand-50 text-brand-700'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Tables
          </Link>
          <span className="hidden sm:block px-3 py-1.5 text-slate-300 cursor-not-allowed select-none">
            More Soon
          </span>
        </nav>
      </div>
    </header>
  );
}
