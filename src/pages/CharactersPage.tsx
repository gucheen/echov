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
      className={cn("metal-panel group overflow-hidden relative border-t-2 border-t-slate-700")}
    >
      <div className="aspect-[3/4] overflow-hidden bg-slate-900 relative">
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
            <span className="absolute bottom-4 text-xs text-slate-400 font-medium">未找到头像</span>
          </div>
        )}
        
        {/* Star Rating Overlay */}
        <div className="absolute top-3 left-3 flex gap-1">
          {Array.from({ length: character.星级[0].includes('六') ? 6 : character.星级[0].includes('五') ? 5 : 4 }).map((_, i) => (
            <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400 drop-shadow-sm" />
          ))}
        </div>
      </div>

      <div className="p-4 space-y-3 bg-[#1a1d23]">
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-black tracking-tight text-white uppercase">{character.角色名}</h3>
          <div className="flex items-center gap-1.5 px-2 py-1 bg-slate-800 text-slate-300 border border-slate-700">
            <ProfessionIcon profession={character.职业[0]} />
            <span className="text-[10px] font-black uppercase">{character.职业[0]}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {character.功能?.slice(0, 3).map((tag: string, i: number) => (
            <span key={i} className="text-[9px] px-2 py-0.5 bg-[#d4af37]/5 text-[#d4af37] font-bold border border-[#d4af37]/20">
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Industrial decoration */}
      <div className="absolute top-0 right-0 w-8 h-8 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[141%] h-[1px] bg-slate-700 rotate-45 transform origin-top-right opacity-50" />
      </div>
      <div className="absolute inset-0 border border-white/0 group-hover:border-[#d4af37]/30 pointer-events-none transition-colors" />
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
          轻松探索与筛选详尽的角色数据库。
        </motion.p>
      </header>

      {/* Controls Section */}
      <section className="bg-[#1a1d23] border border-[#404040] p-6 mb-12 space-y-6 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-slate-600 to-transparent opacity-30" />
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-[#d4af37] transition-colors" />
            <input
              type="text"
              placeholder="按名称搜索..."
              className="w-full pl-12 pr-4 py-3 bg-[#0f1115] border border-[#404040] text-white focus:border-[#d4af37] outline-none transition-all placeholder:text-slate-600"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative group">
              <select
                className="appearance-none pl-4 pr-10 py-3 bg-[#0f1115] border border-[#404040] text-slate-300 focus:border-[#d4af37] outline-none cursor-pointer transition-all"
                value={selectedStar || ''}
                onChange={(e) => setSelectedStar(e.target.value || null)}
              >
                <option value="">所有星级</option>
                {stars.map((star: string) => (
                  <option key={star} value={star}>{star}</option>
                ))}
              </select>
              <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-500 pointer-events-none" />
            </div>

            <div className="relative group">
              <select
                className="appearance-none pl-4 pr-10 py-3 bg-[#0f1115] border border-[#404040] text-slate-300 focus:border-[#d4af37] outline-none cursor-pointer transition-all"
                value={selectedProfession || ''}
                onChange={(e) => setSelectedProfession(e.target.value || null)}
              >
                <option value="">所有职业</option>
                {professions.map((prof: string) => (
                  <option key={prof} value={prof}>{prof}</option>
                ))}
              </select>
              <Filter className="absolute right-3 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-500 pointer-events-none" />
            </div>
          </div>
        </div>
      </section>

      {/* Character Grid */}
      <main>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 space-y-4">
            <Loader2 className="w-12 h-12 text-primary-500 animate-spin" />
            <p className="text-slate-400 font-medium">正在解析档案记录...</p>
          </div>
        ) : (
          <>
              <h2 className="text-2xl font-bold text-slate-800">
                找到 <span className="text-primary-600">{filteredCharacters.length}</span> 位角色
              </h2>

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
                  <p className="text-xl font-bold text-slate-800">未找到匹配项</p>
                  <p className="text-slate-500">请尝试调整搜索内容或筛选条件。</p>
                </div>
              </motion.div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
