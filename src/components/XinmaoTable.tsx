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
      case 'required': return "bg-rose-500 text-white border-rose-600 shadow-sm ring-2 ring-rose-500/20";
      case 'priority': return "bg-amber-400 text-white border-amber-500 shadow-sm ring-2 ring-amber-500/20";
      default: return "bg-slate-100 text-slate-400 border-slate-200 hover:bg-slate-200 hover:text-slate-600";
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
      className={`px-2 py-0.5 rounded-full text-[9px] font-bold border transition-all duration-200 flex items-center justify-center min-w-[36px] ${getStyles()}`}
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
          <div key={i} className="text-xs">
            <span className="font-semibold text-slate-700">{attr.name}: </span>
            {attr.value && <span className="text-slate-600">{attr.value}</span>}
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
                        <span className={`text-slate-500 ${currentLevel === 'required' ? 'font-bold text-red-600' : currentLevel === 'priority' ? 'font-bold text-orange-600' : ''}`}>
                          {subAttr.name}
                        </span>
                      </div>
                      <span className="text-primary-600 font-medium">
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
            <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
              {skillGroup.name}
            </div>
            <div className="space-y-2">
              {skillGroup.skills.map((skill, j) => {
                const currentLevel = markings?.skills?.[`${itemName}-${skill.name}`] || 'none';
                return (
                  <div
                    key={j}
                    className={`bg-slate-50 p-2 rounded-lg border transition-all ${
                      currentLevel === 'required' ? 'border-red-300 bg-red-50/30' : 
                      currentLevel === 'priority' ? 'border-orange-300 bg-orange-50/30' : 
                      'border-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="text-sm font-bold text-slate-800">
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
                    <div className="text-xs text-slate-600 leading-relaxed">
                      {skill.value}
                    </div>
                  </div>
                );
              })}
              {skillGroup.skills.length === 0 && (
                <div className="text-xs text-slate-300 italic">
                  No skills available
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
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
        <input
          type="text"
          placeholder="搜索项目名称..."
          className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all shadow-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-xl bg-white">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-200">
              <th className="px-6 py-4 text-sm font-bold text-slate-900 uppercase tracking-wider">
                名称 (Name)
              </th>
              <th className="px-6 py-4 text-sm font-bold text-slate-900 uppercase tracking-wider">
                来源与属性 (Source & Attributes)
              </th>
              <th className="px-6 py-4 text-sm font-bold text-slate-900 uppercase tracking-wider">
                技能 (Skills)
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredItems.map((item, index) => {
              const itemMarked = markings?.items?.[item.name];
              return (
                <tr
                  key={index}
                  className={`hover:bg-slate-50/30 transition-colors ${
                    itemMarked ? 'bg-primary-50/20 shadow-inner' : ''
                  }`}
                >
                  <td className="px-6 py-8 align-top">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold relative ${
                        itemMarked ? 'bg-primary-500 text-white shadow-lg' : 'bg-primary-100 text-primary-600'
                      }`}>
                        {item.name.charAt(0)}
                        {selectedCharacter && (
                          <button
                            onClick={() => onMark('attribute', item.name, 'ITEM_MARK', itemMarked ? 'none' : 'required' as any)}
                            className={`absolute -top-1 -right-1 w-4 h-4 rounded-full border border-white text-[8px] flex items-center justify-center ${
                              itemMarked ? 'bg-red-500' : 'bg-slate-300 group-hover:bg-slate-400'
                            }`}
                            title="标记此心锚"
                          >
                            ✓
                          </button>
                        )}
                      </div>
                      <span className={`text-lg font-bold ${itemMarked ? 'text-primary-700' : 'text-slate-800'}`}>
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
              No items found matching your search.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
