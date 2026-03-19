import { useState, useEffect, useMemo } from 'react';
import { Search, Filter, Star, Shield, Crosshair, Zap, Sword, User, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import charactersData from '../../characters.json';

// Utility for Tailwind class merging
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Character {
  角色名: string;
  星级: string[];
  职业: string[];
  [key: string]: any;
}

const ProfessionIcon = ({ profession }: { profession: string }) => {
  switch (profession) {
    case '突击手': return <Zap className="w-4 h-4" />;
    case '狙击手': return <Crosshair className="w-4 h-4" />;
    case '异能者': return <Zap className="w-4 h-4 text-purple-500" />;
    case '战术员': return <Shield className="w-4 h-4 text-blue-500" />;
    case '刀锋': return <Sword className="w-4 h-4 text-red-500" />;
    case '盾卫': return <Shield className="w-4 h-4 text-slate-700" />;
    default: return <User className="w-4 h-4" />;
  }
};

const CharacterCard = ({ character }: { character: Character }) => {
  const [imageError, setImageError] = useState(false);
  const avatarUrl = `/avatars/${character.角色名}.png`;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -5 }}
      className={cn("glass-card group overflow-hidden relative")}
    >
      <div className="aspect-[3/4] overflow-hidden bg-slate-200 relative">
        {!imageError ? (
          <img
            src={avatarUrl}
            alt={character.角色名}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200">
            <User className="w-16 h-16 text-slate-400 opacity-20" />
            <span className="absolute bottom-4 text-xs text-slate-400 font-medium">Avatar Not Found</span>
          </div>
        )}
        
        {/* Star Rating Overlay */}
        <div className="absolute top-3 left-3 flex gap-1">
          {Array.from({ length: character.星级[0].includes('六') ? 6 : character.星级[0].includes('五') ? 5 : 4 }).map((_, i) => (
            <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400 drop-shadow-sm" />
          ))}
        </div>
      </div>

      <div className="p-4 space-y-3">
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-bold text-slate-800">{character.角色名}</h3>
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-slate-100 text-slate-600">
            <ProfessionIcon profession={character.职业[0]} />
            <span className="text-xs font-semibold">{character.职业[0]}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {character.功能?.slice(0, 3).map((tag: string, i: number) => (
            <span key={i} className="text-[10px] px-2 py-0.5 rounded-md bg-primary-50 text-primary-600 font-medium border border-primary-100">
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Hover decoration */}
      <div className="absolute inset-0 border-2 border-primary-500/0 group-hover:border-primary-500/10 rounded-2xl pointer-events-none transition-colors" />
    </motion.div>
  );
};

export default function CharactersPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStar, setSelectedStar] = useState<string | null>(null);
  const [selectedProfession, setSelectedProfession] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate initial load for smooth entry
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const characters = useMemo(() => {
    return (charactersData as any).异象回声角色tag.角色列表 as Character[];
  }, []);

  const stars = (charactersData as any).异象回声角色tag.星级列表;
  const professions = (charactersData as any).异象回声角色tag.职业列表;

  const filteredCharacters = useMemo(() => {
    return characters.filter(char => {
      const matchesSearch = char.角色名.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStar = !selectedStar || char.星级.includes(selectedStar);
      const matchesProfession = !selectedProfession || char.职业.includes(selectedProfession);
      return matchesSearch && matchesStar && matchesProfession;
    });
  }, [searchTerm, selectedStar, selectedProfession, characters]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      {/* Header Section */}
      <header className="mb-12 text-center space-y-4">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl font-extrabold tracking-tight text-slate-900 sm:text-6xl"
        >
          <span className="text-gradient">心锚</span> 档案 (Archive)
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-lg text-slate-500 max-w-2xl mx-auto"
        >
          Explore and filter the comprehensive character database with ease.
        </motion.p>
      </header>

      {/* Controls Section */}
      <section className="glass p-6 rounded-3xl mb-12 space-y-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
            <input
              type="text"
              placeholder="Search by name..."
              className="w-full pl-12 pr-4 py-4 bg-white/50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative group">
              <select
                className="appearance-none pl-4 pr-10 py-4 bg-white/50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none cursor-pointer transition-all"
                value={selectedStar || ''}
                onChange={(e) => setSelectedStar(e.target.value || null)}
              >
                <option value="">All Stars</option>
                {stars.map((star: string) => (
                  <option key={star} value={star}>{star}</option>
                ))}
              </select>
              <Filter className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>

            <div className="relative group">
              <select
                className="appearance-none pl-4 pr-10 py-4 bg-white/50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary-500 outline-none cursor-pointer transition-all"
                value={selectedProfession || ''}
                onChange={(e) => setSelectedProfession(e.target.value || null)}
              >
                <option value="">All Classes</option>
                {professions.map((prof: string) => (
                  <option key={prof} value={prof}>{prof}</option>
                ))}
              </select>
              <Filter className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </section>

      {/* Character Grid */}
      <main>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <Loader2 className="w-12 h-12 text-primary-500 animate-spin" />
            <p className="text-slate-400 font-medium">Decoding archive records...</p>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-8 px-2">
              <h2 className="text-2xl font-bold text-slate-800">
                {filteredCharacters.length} <span className="text-slate-400 font-medium">Characters Found</span>
              </h2>
            </div>

            <motion.div 
              layout
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
            >
              <AnimatePresence mode='popLayout'>
                {filteredCharacters.map((character) => (
                  <CharacterCard key={character.角色名} character={character} />
                ))}
              </AnimatePresence>
            </motion.div>

            {filteredCharacters.length === 0 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-32 space-y-4"
              >
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto">
                  <Search className="w-8 h-8 text-slate-300" />
                </div>
                <div className="space-y-1">
                  <p className="text-xl font-bold text-slate-800">No matches found</p>
                  <p className="text-slate-500">Try adjusting your search or filters.</p>
                </div>
              </motion.div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
