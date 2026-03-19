import { useState, useMemo } from 'react';
import { Search, ChevronDown, List, Info } from 'lucide-react';
import xinmaoData from '../../xinmao.json';

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

const AttributeCell = ({ attributes }: { attributes: Attribute[] }) => {
  return (
    <div className="space-y-2">
      {attributes.map((attr, i) => (
        <div key={i} className="text-xs">
          <span className="font-semibold text-slate-700">{attr.name}: </span>
          {attr.value && <span className="text-slate-600">{attr.value}</span>}
          {attr.attrs && (
            <div className="ml-2 mt-1 space-y-1">
              {attr.attrs.map((subAttr, j) => (
                <div key={j} className="flex justify-between border-b border-slate-50 pb-1">
                  <span className="text-slate-500">{subAttr.name}</span>
                  <span className="text-primary-600 font-medium">{subAttr.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

const SkillCell = ({ skills }: { skills: Skill[] }) => {
  return (
    <div className="space-y-4">
      {skills.map((skillGroup, i) => (
        <div key={i} className="space-y-1">
          <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
            {skillGroup.name}
          </div>
          <div className="space-y-2">
            {skillGroup.skills.map((skill, j) => (
              <div key={j} className="bg-slate-50 p-2 rounded-lg border border-slate-100">
                <div className="text-sm font-bold text-slate-800 mb-1">{skill.name}</div>
                <div className="text-xs text-slate-600 leading-relaxed">{skill.value}</div>
              </div>
            ))}
            {skillGroup.skills.length === 0 && (
              <div className="text-xs text-slate-300 italic">No skills available</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default function XinmaoTable() {
  const [searchTerm, setSearchTerm] = useState('');

  const items = useMemo(() => xinmaoData as Item[], []);

  const filteredItems = useMemo(() => {
    return items.filter(item => 
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [items, searchTerm]);

  return (
    <div className="space-y-6">
      <div className="relative group max-w-md mx-auto sm:mx-0">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary-500 transition-colors" />
        <input
          type="text"
          placeholder="Search items by name..."
          className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all shadow-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 shadow-xl bg-white">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-200">
              <th className="px-6 py-4 text-sm font-bold text-slate-900 uppercase tracking-wider">Name</th>
              <th className="px-6 py-4 text-sm font-bold text-slate-900 uppercase tracking-wider">Source & Attributes</th>
              <th className="px-6 py-4 text-sm font-bold text-slate-900 uppercase tracking-wider">Skills</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredItems.map((item, index) => (
              <tr key={index} className="hover:bg-slate-50/30 transition-colors">
                <td className="px-6 py-8 align-top">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center text-primary-600 font-bold">
                      {item.name.charAt(0)}
                    </div>
                    <span className="text-lg font-bold text-slate-800">{item.name}</span>
                  </div>
                </td>
                <td className="px-6 py-8 align-top min-w-[280px]">
                  <AttributeCell attributes={item.attributes} />
                </td>
                <td className="px-6 py-8 align-top min-w-[320px]">
                  <SkillCell skills={item.skills} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredItems.length === 0 && (
          <div className="py-24 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 mb-4">
              <Search className="w-8 h-8 text-slate-300" />
            </div>
            <p className="text-slate-500 font-medium">No items found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}
