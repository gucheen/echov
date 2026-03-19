import { useState, useEffect } from 'react';
import XinmaoTable from '../components/XinmaoTable';
import type { MarkingLevel } from '../components/XinmaoTable';
import CharacterSelector from '../components/CharacterSelector';

export default function XinmaoPage() {
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null);
  const [allMarkings, setAllMarkings] = useState<Record<string, any>>({});

  // Load markings from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('character_xinmao_markings');
    if (saved) {
      try {
        setAllMarkings(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse markings", e);
      }
    }
  }, []);

  // Save markings to localStorage whenever they change
  useEffect(() => {
    if (Object.keys(allMarkings).length > 0) {
      localStorage.setItem('character_xinmao_markings', JSON.stringify(allMarkings));
    }
  }, [allMarkings]);

  const currentMarkings = selectedCharacter ? (allMarkings[selectedCharacter] || {}) : {};

  const handleMark = (type: 'attribute' | 'skill', itemName: string, subItemName: string, level: MarkingLevel) => {
    if (!selectedCharacter) return;

    setAllMarkings(prev => {
      const charMarkings = { ...(prev[selectedCharacter] || { items: {}, attributes: {}, skills: {} }) };
      
      if (subItemName === 'ITEM_MARK') {
        // Toggle item-level marking
        if (level === 'none') {
          const { [itemName]: _, ...restItems } = charMarkings.items || {};
          charMarkings.items = restItems;
        } else {
          charMarkings.items = { ...(charMarkings.items || {}), [itemName]: true };
        }
      } else {
        const key = `${itemName}-${subItemName}`;
        const targetGroup = type === 'attribute' ? 'attributes' : 'skills';
        
        if (level === 'none') {
          const { [key]: _, ...rest } = charMarkings[targetGroup] || {};
          charMarkings[targetGroup] = rest;
        } else {
          charMarkings[targetGroup] = { ...(charMarkings[targetGroup] || {}), [key]: level };
        }
      }

      return {
        ...prev,
        [selectedCharacter]: charMarkings
      };
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-12 text-center space-y-4">
        <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 sm:text-6xl">
          <span className="text-gradient">心锚</span> 数据库
        </h1>
        <p className="text-lg text-slate-500 max-w-2xl mx-auto">
          为角色标记推荐的心锚、词条与特性。 (Mark recommended Xinmao, attributes, and skills for characters.)
        </p>
      </header>

      <div className="flex justify-center mb-12">
        <CharacterSelector 
          selectedCharacter={selectedCharacter} 
          onSelect={setSelectedCharacter} 
        />
      </div>

      <main>
        <XinmaoTable 
          selectedCharacter={selectedCharacter}
          markings={currentMarkings}
          onMark={handleMark}
        />
      </main>
    </div>
  );
}
