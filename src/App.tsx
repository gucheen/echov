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
    { path: '/', name: '角色档案', icon: Users },
    { path: '/xinmao', name: '心锚数据库', icon: Database },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full bg-[#1a1d23]/90 backdrop-blur-md border-b border-[#404040] shadow-2xl flex justify-center py-2 px-4 mb-12">
      <div className="flex gap-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "group relative flex items-center gap-2 px-6 py-3 transition-all duration-300 border-x border-transparent",
                isActive 
                  ? "text-[#d4af37] bg-white/5 border-[#404040]" 
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              )}
            >
              <Icon className={cn("w-4 h-4 transition-transform group-hover:scale-110", isActive ? "text-[#d4af37]" : "text-slate-500")} />
              <span className="text-sm font-black tracking-widest uppercase">{item.name}</span>
              
              {/* Gold indicator line */}
              {isActive && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#d4af37] to-transparent shadow-[0_0_10px_#d4af37]" />
              )}
              
              {/* Corner accents */}
              {isActive && (
                <>
                  <div className="absolute top-0 left-0 w-1.5 h-1.5 border-t border-l border-[#d4af37]" />
                  <div className="absolute bottom-0 right-0 w-1.5 h-1.5 border-b border-r border-[#d4af37]" />
                </>
              )}
            </Link>
          );
        })}
      </div>
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
          <p>&copy; {new Date().getFullYear()} 心锚 (Xinmao) 档案库 • 本地数据记录</p>
        </footer>
      </div>
    </Router>
  );
}
