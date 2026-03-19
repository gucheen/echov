import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import charactersData from '../../characters.json';

interface Character {
  角色名: string;
  星级: string[];
  职业: string[];
}

interface CharacterSelectorProps {
  onSelect: (characterName: string | null) => void;
  selectedCharacter: string | null;
}

export default function CharacterSelector({ onSelect, selectedCharacter }: CharacterSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const characters = useMemo(() => {
    return (charactersData as any).异象回声角色tag.角色列表 as Character[];
  }, []);

  const filteredCharacters = useMemo(() => {
    return characters.filter(char => 
      char.角色名.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, characters]);

  return (
    <div className="relative w-full max-w-sm">
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 bg-[#1a1d23] border border-slate-700 text-white cursor-pointer flex justify-between items-center hover:border-[#d4af37] transition-all group"
      >
        <span className={selectedCharacter ? "text-[#d4af37] font-black uppercase tracking-wider" : "text-slate-500"}>
          {selectedCharacter || "选择角色标记心锚..."}
        </span>
        <Search className="w-4 h-4 text-slate-500 group-hover:text-[#d4af37] transition-colors" />
        
        {/* Angular corner accent */}
        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-white/10" />
      </div>

      {isOpen && (
        <div className="absolute z-[60] mt-1 w-full bg-[#1a1d23] border border-[#d4af37]/50 shadow-[0_10px_40px_rgba(0,0,0,0.5)] overflow-hidden">
          <div className="p-2 border-b border-slate-800">
            <input
              type="text"
              placeholder="搜索角色..."
              className="w-full px-3 py-2 bg-[#0f1115] border-none text-sm text-white focus:ring-0 outline-none placeholder:text-slate-600"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
          </div>
          <div className="max-h-64 overflow-y-auto p-1 custom-scrollbar">
            <div 
              onClick={() => { onSelect(null); setIsOpen(false); }}
              className="px-3 py-2 text-xs text-slate-500 hover:bg-white/5 cursor-pointer uppercase font-bold tracking-tighter"
            >
              取消选择角色
            </div>
            {filteredCharacters.map((char) => (
              <div
                key={char.角色名}
                onClick={() => {
                  onSelect(char.角色名);
                  setIsOpen(false);
                }}
                className={`px-3 py-3 text-sm cursor-pointer flex items-center gap-3 transition-colors border-b border-white/5 last:border-none ${
                  selectedCharacter === char.角色名 
                    ? "bg-[#d4af37]/10 text-[#d4af37] font-bold" 
                    : "text-slate-300 hover:bg-white/5"
                }`}
              >
                <div className="w-7 h-7 bg-slate-800 flex items-center justify-center text-[10px] font-black border border-slate-700">
                  {char.角色名.charAt(0)}
                </div>
                <span className="uppercase tracking-tight">{char.角色名}</span>
                <span className="ml-auto text-[8px] text-slate-500 border border-slate-800 px-1.5 py-0.5 uppercase">
                  {char.星级[0]}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {isOpen && <div className="fixed inset-0 z-50" onClick={() => setIsOpen(false)} />}
    </div>
  );
}
