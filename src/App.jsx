import { Routes, Route } from 'react-router-dom';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import Home from './pages/Home.jsx';
import Tables from './pages/Tables.jsx';
import Games from './pages/Games.jsx';
import TablesPractice from './pages/TablesPractice.jsx';
import WrittenMath from './pages/WrittenMath.jsx';
import Results from './pages/Results.jsx';

export default function App() {
  return (
    <div className="flex flex-col min-h-dvh bg-slate-50/60 font-sans antialiased text-slate-800">
      <Header />
      <main className="flex-1 w-full overflow-x-hidden">
        <Routes>
          <Route path="/"             element={<Home />}           />
          <Route path="/tables"       element={<Tables />}         />
          <Route path="/games"        element={<Games />}          />
          <Route path="/practice"     element={<TablesPractice />} />
          <Route path="/written-math" element={<WrittenMath />}    />
          <Route path="/results"      element={<Results />}        />
          {/* Catch-all fallback → Home */}
          <Route path="*"             element={<Home />}           />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
