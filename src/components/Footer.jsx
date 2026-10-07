import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 py-8 px-4 mt-auto border-t border-slate-800">
      <div className="max-w-4xl mx-auto space-y-6 text-center sm:text-left sm:flex sm:justify-between sm:items-start sm:space-y-0">
        {/* Brand & Location */}
        <div className="space-y-2 max-w-sm">
          <div className="flex items-center justify-center sm:justify-start gap-2 select-none">
            <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-xs">
              S
            </div>
            <span className="font-black text-white text-base tracking-tight">Syeds Academy</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Excellence in Mathematics Practice for Class 3 to Class 6 Students.
          </p>
          <div className="text-xs text-slate-400 flex items-center justify-center sm:justify-start gap-1 pt-1">
            <span>📍</span>
            <span>Block B, Soan Gardens, Islamabad, Pakistan</span>
          </div>
        </div>

        {/* Quick Links */}
        <div className="flex justify-center sm:justify-end gap-6 text-xs font-semibold">
          <div className="space-y-2">
            <div className="text-slate-200 font-bold uppercase tracking-wider text-[10px]">Learning</div>
            <ul className="space-y-1.5">
              <li><Link to="/tables" className="hover:text-white transition-colors">Read Tables 1–10</Link></li>
              <li><Link to="/games" className="hover:text-white transition-colors">Math Games</Link></li>
              <li><Link to="/written-math" className="hover:text-white transition-colors">Written Math</Link></li>
            </ul>
          </div>
          <div className="space-y-2">
            <div className="text-slate-200 font-bold uppercase tracking-wider text-[10px]">Challenges</div>
            <ul className="space-y-1.5">
              <li><Link to="/practice" className="hover:text-white transition-colors">Multiplication</Link></li>
              <li><Link to="/games" className="hover:text-white transition-colors">Addition & Subtraction</Link></li>
              <li><span className="text-slate-600">Homework Solver (Soon)</span></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto mt-6 pt-4 border-t border-slate-800/80 text-center text-[11px] text-slate-500">
        © {new Date().getFullYear()} Syeds Academy · Math Practice Platform · Islamabad, Pakistan
      </div>
    </footer>
  );
}
