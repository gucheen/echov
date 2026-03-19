import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { Users, Database } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import CharactersPage from './pages/CharactersPage';
import XinmaoPage from './pages/XinmaoPage';

function cn(...inputs: any[]) {
  return twMerge(clsx(inputs));
}

const Navbar = () => {
  const location = useLocation();
  
  const navItems = [
    { path: '/', name: 'Characters', icon: Users },
    { path: '/xinmao', name: 'Xinmao Data', icon: Database },
  ];

  return (
    <nav className="sticky top-6 z-50 max-w-fit mx-auto bg-white/80 backdrop-blur-xl border border-white/20 shadow-lg rounded-2xl px-2 py-1.5 flex gap-1 mb-8">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300",
              isActive 
                ? "bg-primary-500 text-white shadow-md shadow-primary-500/20" 
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            )}
          >
            <Icon className={cn("w-4 h-4", isActive ? "text-white" : "text-slate-400")} />
            {item.name}
          </Link>
        );
      })}
    </nav>
  );
};

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-[#f8fafc] pb-24">
        <div className="pt-8">
          <Navbar />
        </div>
        
        <Routes>
          <Route path="/" element={<CharactersPage />} />
          <Route path="/xinmao" element={<XinmaoPage />} />
        </Routes>

        {/* Footer */}
        <footer className="mt-12 text-center text-slate-400 text-sm">
          <p>&copy; {new Date().getFullYear()} Echov Archive • Data from Local Records</p>
        </footer>
      </div>
    </Router>
  );
}
