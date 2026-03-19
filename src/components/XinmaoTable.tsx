import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import xinmaoData from "../../xinmao.json";

interface Attribute {
  name: string;
  value?: string;
  attrs?: { name: string; value: string }[];
}

interface Skill {
  name: string;
  skills: { name: string; value: string }[];
}

interface Item {
  name: string;
  attributes: Attribute[];
  skills: Skill[];
}

export type MarkingLevel = 'none' | 'required' | 'priority';

interface XinmaoTableProps {
  selectedCharacter: string | null;
  markings: Record<string, any>;
  onMark: (type: 'attribute' | 'skill', itemName: string, subItemName: string, level: MarkingLevel) => void;
}

const MarkingButton = ({ 
  level, 
  onClick, 
  title 
}: { 
  level: MarkingLevel; 
  onClick: () => void; 
  title: string 
}) => {
  const getStyles = () => {
    switch (level) {
      case 'required': return "bg-[#d4af37] text-black border-none shadow-[0_0_10px_rgba(212,175,55,0.4)]";
      case 'priority': return "bg-slate-400 text-black border-none shadow-[0_0_10px_rgba(160,160,160,0.4)]";
      default: return "bg-transparent text-slate-500 border border-slate-700 hover:border-slate-500 hover:text-slate-300";
    }
  };

  const getLabel = () => {
    switch (level) {
      case 'required': return "必须";
      case 'priority': return "优先";
      default: return "标记";
    }
  };

  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      title={title}
      className={`px-3 py-1 rounded-none text-sm font-black uppercase transition-all duration-200 flex items-center justify-center min-w-[42px] ${getStyles()}`}
    >
      {getLabel()}
    </button>
  );
};

const AttributeCell = ({ 
  attributes, 
  itemName, 
  selectedCharacter, 
  markings, 
  onMark 
}: { 
  attributes: Attribute[]; 
  itemName: string;
  selectedCharacter: string | null;
  markings: any;
  onMark: any;
}) => {
  return (
    <div className="space-y-2">
      {attributes.map((attr, i) => {
        const isRandom = attr.name.includes("随机词条");
        return (
          <div key={i} className="text-sm">
            <span className="font-bold text-slate-300 text-sm">{attr.name}: </span>
            {attr.value && <span className="text-slate-400 text-sm">{attr.value}</span>}
            {attr.attrs && (
              <div className="ml-2 mt-1 space-y-1">
                {attr.attrs.map((subAttr, j) => {
                  const currentLevel = markings?.attributes?.[`${itemName}-${subAttr.name}`] || 'none';
                  return (
                    <div
                      key={j}
                      className={`flex justify-between items-center border-b border-slate-50 pb-1 ${
                        currentLevel !== 'none' ? 'bg-slate-50/50 -mx-1 px-1 rounded' : ''
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {selectedCharacter && isRandom && (
                          <MarkingButton 
                            level={currentLevel}
                            title={`标记 ${subAttr.name} 为必须或优先`}
                            onClick={() => {
                              const next: Record<MarkingLevel, MarkingLevel> = {
                                'none': 'required',
                                'required': 'priority',
                                'priority': 'none'
                              };
                              onMark('attribute', itemName, subAttr.name, next[currentLevel as MarkingLevel]);
                            }}
                          />
                        )}
                        <span className={`text-slate-400 text-sm ${currentLevel === 'required' ? 'font-black text-[#d4af37]' : currentLevel === 'priority' ? 'font-black text-slate-200' : ''}`}>
                          {subAttr.name}
                        </span>
                      </div>
                      <span className="text-[#d4af37] font-black uppercase text-sm">
                        {subAttr.value}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

const SkillCell = ({ 
  skills, 
  itemName, 
  selectedCharacter, 
  markings, 
  onMark 
}: { 
  skills: Skill[]; 
  itemName: string;
  selectedCharacter: string | null;
  markings: any;
  onMark: any;
}) => {
  return (
    <div className="space-y-4">
      {skills.map((skillGroup, i) => {
        const isRandom = skillGroup.name.includes("随机特性");
        return (
          <div key={i} className="space-y-1">
            <div className="text-sm uppercase tracking-[0.2em] font-black text-slate-500 mb-2">
              {skillGroup.name}
            </div>
            <div className="space-y-2">
              {skillGroup.skills.map((skill, j) => {
                const currentLevel = markings?.skills?.[`${itemName}-${skill.name}`] || 'none';
                return (
                  <div
                    key={j}
                    className={`p-2 border transition-all rounded-none ${
                      currentLevel === 'required' ? 'border-[#d4af37]/50 bg-[#d4af37]/5 shadow-[inset_0_0_10px_rgba(212,175,55,0.1)]' : 
                      currentLevel === 'priority' ? 'border-slate-500/50 bg-slate-500/5' : 
                      'border-slate-800 bg-[#16191e]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-sm font-black tracking-tight text-white uppercase">
                        {skill.name}
                      </div>
                      {selectedCharacter && isRandom && (
                        <MarkingButton 
                          level={currentLevel}
                          title={`标记 ${skill.name} 为必须或优先`}
                          onClick={() => {
                            const next: Record<MarkingLevel, MarkingLevel> = {
                              'none': 'required',
                              'required': 'priority',
                              'priority': 'none'
                            };
                            onMark('skill', itemName, skill.name, next[currentLevel as MarkingLevel]);
                          }}
                        />
                      )}
                    </div>
                    <div className="text-sm text-slate-400 leading-relaxed font-normal">
                      {skill.value}
                    </div>
                  </div>
                );
              })}
              {skillGroup.skills.length === 0 && (
                <div className="text-sm text-slate-300 italic">
                  暂无可用技能
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default function XinmaoTable({ 
  selectedCharacter, 
  markings, 
  onMark 
}: XinmaoTableProps) {
  const [searchTerm, setSearchTerm] = useState("");

  const items = useMemo(() => xinmaoData as Item[], []);

  const filteredItems = useMemo(() => {
    let result = items;
    if (searchTerm) {
      result = result.filter((item) =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }
    
    // Sort items if a character is selected: marked items first
    if (selectedCharacter && markings) {
      result = [...result].sort((a, b) => {
        const aHasMarkings = (markings.items?.[a.name]) || false;
        const bHasMarkings = (markings.items?.[b.name]) || false;
        if (aHasMarkings && !bHasMarkings) return -1;
        if (!aHasMarkings && bHasMarkings) return 1;
        return 0;
      });
    }
    
    return result;
  }, [items, searchTerm, selectedCharacter, markings]);

  return (
    <div className="space-y-6">
      <div className="relative group max-w-md mx-auto sm:mx-0">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-[#d4af37] transition-colors" />
        <input
          type="text"
          placeholder="搜索项目名称..."
          className="w-full pl-12 pr-4 py-3 bg-[#1a1d23] border border-[#404040] text-white focus:border-[#d4af37] outline-none transition-all placeholder:text-slate-600"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="overflow-x-auto border border-[#404040] bg-[#1a1d23] shadow-2xl relative">
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-[#d4af37] via-transparent to-[#d4af37] opacity-50" />
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#0f1115] border-b border-[#404040]">
              <th className="px-6 py-6 text-sm font-black text-[#d4af37] uppercase tracking-[0.2em]">
                名称
              </th>
              <th className="px-6 py-6 text-sm font-black text-[#d4af37] uppercase tracking-[0.2em]">
                来源与属性
              </th>
              <th className="px-6 py-6 text-sm font-black text-[#d4af37] uppercase tracking-[0.2em]">
                技能
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredItems.map((item, index) => {
              const itemMarked = markings?.items?.[item.name];
              return (
                <tr
                  key={index}
                  className={`hover:bg-white/5 transition-colors border-b border-[#252a31] ${
                    itemMarked ? 'bg-[#d4af37]/5' : ''
                  }`}
                >
                  <td className="px-6 py-10 align-top">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 flex items-center justify-center font-black relative border ${
                        itemMarked ? 'bg-[#d4af37] text-black border-[#d4af37] shadow-[0_0_15px_rgba(212,175,55,0.3)]' : 'bg-slate-900 text-slate-500 border-slate-700'
                      }`}>
                        {item.name.charAt(0)}
                        {selectedCharacter && (
                          <button
                            onClick={() => onMark('attribute', item.name, 'ITEM_MARK', itemMarked ? 'none' : 'required' as any)}
                            className={`absolute -top-1.5 -right-1.5 w-6 h-6 border-2 border-[#1a1d23] text-sm flex items-center justify-center font-black ${
                              itemMarked ? 'bg-black text-[#d4af37]' : 'bg-slate-700 text-slate-400'
                            }`}
                            title="标记此心锚"
                          >
                            ✓
                          </button>
                        )}
                      </div>
                      <span className={`text-xl font-black tracking-tight uppercase ${itemMarked ? 'text-[#d4af37]' : 'text-white'}`}>
                        {item.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-8 align-top min-w-[280px]">
                    <AttributeCell 
                      attributes={item.attributes} 
                      itemName={item.name}
                      selectedCharacter={selectedCharacter}
                      markings={markings}
                      onMark={onMark}
                    />
                  </td>
                  <td className="px-6 py-8 align-top min-w-[320px]">
                    <SkillCell 
                      skills={item.skills} 
                      itemName={item.name}
                      selectedCharacter={selectedCharacter}
                      markings={markings}
                      onMark={onMark}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredItems.length === 0 && (
          <div className="py-24 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
              <Search className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-slate-500 font-medium">
              未找到符合搜索条件的项目。
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
