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
        className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl shadow-sm cursor-pointer flex justify-between items-center hover:border-primary-500 transition-all"
      >
        <span className={selectedCharacter ? "text-slate-900 font-bold" : "text-slate-400"}>
          {selectedCharacter || "选择角色标记心锚..."}
        </span>
        <Search className="w-4 h-4 text-slate-400" />
      </div>

      {isOpen && (
        <div className="absolute z-[60] mt-2 w-full bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
          <div className="p-2 border-b border-slate-100">
            <input
              type="text"
              placeholder="搜索角色..."
              className="w-full px-3 py-2 bg-slate-50 border-none rounded-lg text-sm focus:ring-0 outline-none"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
          </div>
          <div className="max-h-60 overflow-y-auto p-1">
            <div 
              onClick={() => { onSelect(null); setIsOpen(false); }}
              className="px-3 py-2 text-sm text-slate-500 hover:bg-slate-50 rounded-lg cursor-pointer"
            >
              不选择角色 (None)
            </div>
            {filteredCharacters.map((char) => (
              <div
                key={char.角色名}
                onClick={() => {
                  onSelect(char.角色名);
                  setIsOpen(false);
                }}
                className={`px-3 py-2 text-sm rounded-lg cursor-pointer flex items-center gap-2 transition-colors ${
                  selectedCharacter === char.角色名 
                    ? "bg-primary-50 text-primary-700 font-bold" 
                    : "text-slate-700 hover:bg-slate-50"
                }`}
              >
                <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold">
                  {char.角色名.charAt(0)}
                </div>
                {char.角色名}
                <span className="ml-auto text-[10px] text-slate-400 px-1.5 py-0.5 bg-slate-100 rounded">
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
