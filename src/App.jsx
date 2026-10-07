import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Home from './pages/Home';
import TablesPractice from './pages/TablesPractice';
import Results from './pages/Results';

export default function App() {
  return (
    <div className="flex flex-col min-h-dvh">
      <Header />
      <main className="flex-1 w-full overflow-x-hidden">
        <Routes>
          <Route path="/"        element={<Home />}           />
          <Route path="/practice" element={<TablesPractice />} />
          <Route path="/results"  element={<Results />}        />
          {/* Catch-all → Home */}
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
    </div>
  );
}
