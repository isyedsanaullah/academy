import { Link, useLocation } from 'react-router-dom';

export default function Header() {
  const { pathname } = useLocation();

  const navItems = [
    { path: '/', label: 'Home' },
    { path: '/tables', label: 'Tables' },
    { path: '/games', label: 'Math Games' },
    { path: '/written-math', label: 'Written Math' },
  ];

  return (
    <header className="bg-white border-b border-slate-100 sticky top-0 z-30 shadow-xs">
      <div className="max-w-4xl mx-auto px-3 sm:px-4 h-14 sm:h-16 flex items-center justify-between gap-2">
        {/* Logo & Brand */}
        <Link to="/" className="flex items-center gap-2 select-none shrink-0 group">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-sm shadow-sm group-hover:scale-105 transition-transform">
            S
          </div>
          <div className="flex flex-col">
            <span className="font-black text-base sm:text-lg text-slate-800 tracking-tight leading-none">
              Syeds Academy
            </span>
            <span className="text-[10px] font-semibold text-slate-400 tracking-wide leading-tight hidden xs:block">
              Soan Gardens, Islamabad
            </span>
          </div>
        </Link>

        {/* Navigation — responsive horizontal list */}
        <nav className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto no-scrollbar py-1">
          {navItems.map(item => {
            const isActive =
              item.path === '/'
                ? pathname === '/'
                : pathname.startsWith(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                {item.label}
              </Link>
            );
          })}

          <span className="hidden md:inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold text-slate-400 bg-slate-100 rounded-lg select-none">
            <span>Solver</span>
            <span className="text-[9px] bg-slate-200 text-slate-600 px-1 py-0.5 rounded">Soon</span>
          </span>
        </nav>
      </div>
    </header>
  );
}
