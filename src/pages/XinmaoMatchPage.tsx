import { useState, useEffect, useMemo } from "react";
import { Search, Zap, CheckCircle2, AlertCircle, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import xinmaoData from "../../xinmao.json";
import charactersData from "../../characters.json";

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

interface MatchResult {
  charName: string;
  type: "must" | "priority" | "default";
  matchedReasons: { text: string; isMaxMust: boolean }[];
}

export default function XinmaoMatchPage() {
  const [selectedItemName, setSelectedItemName] = useState<string>(
    xinmaoData[0].name,
  );
  const [selectedAttrs, setSelectedAttrs] = useState<
    Record<string, { attrName: string; isMax: boolean }>
  >({});
  const [selectedSkills, setSelectedSkills] = useState<Record<string, string>>(
    {},
  );
  const [selectedFixedAttrs, setSelectedFixedAttrs] = useState<
    Record<string, boolean>
  >({});
  const [selectedFixedSkills, setSelectedFixedSkills] = useState<
    Record<string, boolean>
  >({});
  const [allMarkings, setAllMarkings] = useState<Record<string, any>>({});

  // Load markings from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("character_xinmao_markings");
    if (saved) {
      try {
        setAllMarkings(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse markings", e);
      }
    }
  }, []);

  const items = xinmaoData as Item[];
  const selectedItem = useMemo(
    () => items.find((i) => i.name === selectedItemName) || items[0],
    [selectedItemName, items],
  );

  // Extract random attribute groups and skill groups
  const randomAttrGroups = useMemo(
    () =>
      selectedItem.attributes.filter((a: Attribute) =>
        a.name.includes("随机词条"),
      ),
    [selectedItem],
  );

  const randomSkillGroups = useMemo(
    () => selectedItem.skills.filter((s: Skill) => s.name.includes("随机特性")),
    [selectedItem],
  );

  const fixedAttrGroups = useMemo(
    () =>
      selectedItem.attributes.filter((a: Attribute) =>
        a.name.includes("固定词条"),
      ),
    [selectedItem],
  );

  const fixedSkillGroups = useMemo(
    () => selectedItem.skills.filter((s: Skill) => s.name.includes("固定特性")),
    [selectedItem],
  );

  // Initialize selections when item changes
  useEffect(() => {
    const initialAttrs: Record<string, { attrName: string; isMax: boolean }> =
      {};
    randomAttrGroups.forEach((group: Attribute) => {
      if (group.attrs && group.attrs.length > 0) {
        initialAttrs[group.name] = {
          attrName: group.attrs[0].name,
          isMax: false,
        };
      }
    });
    setSelectedAttrs(initialAttrs);

    const initialSkills: Record<string, string> = {};
    randomSkillGroups.forEach((group: Skill) => {
      if (group.skills && group.skills.length > 0) {
        initialSkills[group.name] = group.skills[0].name;
      }
    });
    setSelectedSkills(initialSkills);

    const initialFixedAttrs: Record<string, boolean> = {};
    fixedAttrGroups.forEach((group: Attribute) => {
      group.attrs?.forEach((attr) => {
        initialFixedAttrs[attr.name] = false;
      });
    });
    setSelectedFixedAttrs(initialFixedAttrs);
  }, [
    selectedItem,
    randomAttrGroups,
    randomSkillGroups,
    fixedAttrGroups,
    fixedSkillGroups,
  ]);

  // Matching Logic
  const matchingCharacters = useMemo(() => {
    const results: MatchResult[] = [];
    const characterList = (charactersData as any).异象回声角色tag.角色列表;

    characterList.forEach((char: any) => {
      const charName = char.角色名;
      const charMarkings = allMarkings[charName];
      let matchType: "must" | "priority" | "default" = "default";
      const matchedReasons: { text: string; isMaxMust: boolean }[] = [];

      if (!charMarkings) {
        results.push({ charName, type: "default", matchedReasons: [] });
        return;
      }

      // Check item-level markings (if character specifically wants this item)
      const wantsItem = charMarkings.items?.[selectedItem.name];
      if (wantsItem) {
        matchedReasons.push({
          text: `推荐心锚: ${selectedItem.name}`,
          isMaxMust: false,
        });
      }

      // Check attributes
      Object.values(selectedAttrs).forEach((selection: any) => {
        const key = `${selectedItem.name}-${selection.attrName}`;
        const level = charMarkings.attributes?.[key];
        const reasonSuffix = selection.isMax ? " (满值)" : "";
        if (level === "required") {
          matchType = "must";
          matchedReasons.push({
            text: `必须词条: ${selection.attrName}${reasonSuffix}`,
            isMaxMust: selection.isMax,
          });
        } else if (level === "priority" && matchType !== "must") {
          matchType = "priority";
          matchedReasons.push({
            text: `优先词条: ${selection.attrName}${reasonSuffix}`,
            isMaxMust: false,
          });
        }
      });

      // Check fixed attributes
      fixedAttrGroups.forEach((attrGroup: Attribute) => {
        if (attrGroup.attrs) {
          attrGroup.attrs.forEach((attr) => {
            if (!selectedFixedAttrs[attr.name]) return;
            const key = `${selectedItem.name}-${attr.name}`;
            const level = charMarkings.attributes?.[key];
            if (level === "required") {
              matchType = "must";
              matchedReasons.push({
                text: `必须词条 (固定): ${attr.name}`,
                isMaxMust: false,
              });
            } else if (level === "priority" && matchType !== "must") {
              matchType = "priority";
              matchedReasons.push({
                text: `优先词条 (固定): ${attr.name}`,
                isMaxMust: false,
              });
            }
          });
        }
      });

      // Check fixed skills
      fixedSkillGroups.forEach((skillGroup: Skill) => {
        skillGroup.skills.forEach((skill) => {
          if (!selectedFixedSkills[skill.name]) return;
          const key = `${selectedItem.name}-${skill.name}`;
          const level = charMarkings.skills?.[key];
          if (level === "required") {
            matchType = "must";
            matchedReasons.push({
              text: `必须特性 (固定): ${skill.name}`,
              isMaxMust: false,
            });
          } else if (level === "priority" && matchType !== "must") {
            matchType = "priority";
            matchedReasons.push({
              text: `优先特性 (固定): ${skill.name}`,
              isMaxMust: false,
            });
          }
        });
      });

      // Check skills
      Object.values(selectedSkills).forEach((skillName) => {
        const key = `${selectedItem.name}-${skillName}`;
        const level = charMarkings.skills?.[key];
        if (level === "required") {
          matchType = "must";
          matchedReasons.push({
            text: `必须特性: ${skillName}`,
            isMaxMust: false,
          });
        } else if (level === "priority" && matchType !== "must") {
          matchType = "priority";
          matchedReasons.push({
            text: `优先特性: ${skillName}`,
            isMaxMust: false,
          });
        }
      });

      results.push({ charName, type: matchType, matchedReasons });
    });

    // Sort: Must first, then Priority, then Default. Within same type, sort by number of match reasons.
    return results.sort((a, b) => {
      const score = { must: 1000, priority: 500, default: 0 };
      const aScore = score[a.type] + a.matchedReasons.length;
      const bScore = score[b.type] + b.matchedReasons.length;
      return bScore - aScore;
    });
  }, [selectedItem, selectedAttrs, selectedSkills, allMarkings]);

  const characterMap = useMemo(() => {
    const map: Record<string, any> = {};
    (charactersData as any).异象回声角色tag.角色列表.forEach((char: any) => {
      map[char.角色名] = char;
    });
    return map;
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <header className="mb-12 text-center">
        <h1 className="text-5xl font-black tracking-tight text-[#d4af37] uppercase">
          心锚匹配{" "}
          <span className="text-white opacity-20 font-light">MATCHER</span>
        </h1>
        <p className="mt-4 text-slate-500 font-bold tracking-widest uppercase">
          构建虚拟心锚并匹配最适合的角色
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Builder */}
        <div className="lg:col-span-5 space-y-6">
          <section className="metal-panel p-6 space-y-6 border-t-2 border-t-[#d4af37]">
            <h2 className="text-xl font-black text-white uppercase tracking-widest flex items-center gap-2">
              <Zap className="w-5 h-5 text-[#d4af37]" /> 心锚构建器
            </h2>

            {/* Base Item Selection */}
            <div className="space-y-2">
              <label className="text-sm font-black text-slate-500 uppercase tracking-widest">
                选择基础心锚
              </label>
              <select
                value={selectedItemName}
                onChange={(e) => setSelectedItemName(e.target.value)}
                className="w-full bg-[#0f1115] border border-[#404040] text-white p-3 font-bold focus:border-[#d4af37] outline-none appearance-none"
              >
                {items.map((item) => (
                  <option key={item.name} value={item.name}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Fixed Attributes Selection */}
            {fixedAttrGroups.length > 0 && (
              <div className="space-y-4 pt-4 border-t border-white/5">
                <h3 className="text-sm font-black text-[#d4af37] uppercase tracking-widest">
                  配置固定词条
                </h3>
                {fixedAttrGroups.map((group: Attribute) => (
                  <div
                    key={group.name}
                    className="space-y-3 p-4 bg-black/20 border border-white/5"
                  >
                    {group.attrs?.map((attr) => (
                      <div
                        key={attr.name}
                        className="flex justify-between items-center"
                      >
                        <span className="text-sm font-bold text-slate-400">
                          {attr.name} ({attr.value})
                        </span>
                        <label className="flex items-center gap-3 cursor-pointer group">
                          <span
                            className={`text-sm font-black uppercase transition-colors ${selectedFixedAttrs[attr.name] ? "text-[#d4af37]" : "text-slate-600"}`}
                          >
                            满值
                          </span>
                          <input
                            type="checkbox"
                            className="hidden"
                            checked={selectedFixedAttrs[attr.name] || false}
                            onChange={(e) =>
                              setSelectedFixedAttrs((prev) => ({
                                ...prev,
                                [attr.name]: e.target.checked,
                              }))
                            }
                          />
                          <div
                            className={`w-8 h-4 border transition-all ${selectedFixedAttrs[attr.name] ? "border-[#d4af37] bg-[#d4af37]/20" : "border-slate-700 bg-slate-900"}`}
                          >
                            <div
                              className={`h-full w-3 transition-all ${selectedFixedAttrs[attr.name] ? "translate-x-4 bg-[#d4af37]" : "translate-x-0 bg-slate-600"}`}
                            />
                          </div>
                        </label>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}

            {/* Attributes Selection */}
            {randomAttrGroups.length > 0 && (
              <div className="space-y-4 pt-4 border-t border-white/5">
                <h3 className="text-sm font-black text-[#d4af37] uppercase tracking-widest">
                  配置随机词条
                </h3>
                {randomAttrGroups.map((group: Attribute) => (
                  <div
                    key={group.name}
                    className="space-y-3 p-4 bg-black/20 border border-white/5"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-slate-400">
                        {group.name}
                      </span>
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <span
                          className={`text-sm font-black uppercase transition-colors ${selectedAttrs[group.name]?.isMax ? "text-[#d4af37]" : "text-slate-600"}`}
                        >
                          满值
                        </span>
                        <input
                          type="checkbox"
                          className="hidden"
                          checked={selectedAttrs[group.name]?.isMax || false}
                          onChange={(e) =>
                            setSelectedAttrs((prev: any) => ({
                              ...prev,
                              [group.name]: {
                                ...prev[group.name],
                                isMax: e.target.checked,
                              },
                            }))
                          }
                        />
                        <div
                          className={`w-8 h-4 border transition-all ${selectedAttrs[group.name]?.isMax ? "border-[#d4af37] bg-[#d4af37]/20" : "border-slate-700 bg-slate-900"}`}
                        >
                          <div
                            className={`h-full w-3 transition-all ${selectedAttrs[group.name]?.isMax ? "translate-x-4 bg-[#d4af37]" : "translate-x-0 bg-slate-600"}`}
                          />
                        </div>
                      </label>
                    </div>
                    <select
                      className="w-full bg-[#0f1115] border border-white/10 text-slate-300 p-2 text-sm outline-none focus:border-[#d4af37]"
                      value={selectedAttrs[group.name]?.attrName || ""}
                      onChange={(e) =>
                        setSelectedAttrs((prev: any) => ({
                          ...prev,
                          [group.name]: {
                            ...prev[group.name],
                            attrName: e.target.value,
                          },
                        }))
                      }
                    >
                      {group.attrs?.map((attr: any) => (
                        <option key={attr.name} value={attr.name}>
                          {attr.name} ({attr.value})
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            )}

            {/* Skills Selection */}
            {randomSkillGroups.length > 0 && (
              <div className="space-y-4 pt-4 border-t border-white/5">
                <h3 className="text-sm font-black text-[#d4af37] uppercase tracking-widest">
                  配置随机特性
                </h3>
                {randomSkillGroups.map((group: Skill) => (
                  <div
                    key={group.name}
                    className="space-y-3 p-4 bg-black/20 border border-white/5"
                  >
                    <span className="text-sm font-bold text-slate-400">
                      {group.name}
                    </span>
                    <select
                      className="w-full bg-[#0f1115] border border-white/10 text-slate-300 p-2 text-sm outline-none focus:border-[#d4af37]"
                      value={selectedSkills[group.name] || ""}
                      onChange={(e) =>
                        setSelectedSkills((prev: any) => ({
                          ...prev,
                          [group.name]: e.target.value,
                        }))
                      }
                    >
                      {group.skills.map((skill: any) => (
                        <option key={skill.name} value={skill.name}>
                          {skill.name}
                        </option>
                      ))}
                    </select>
                    {selectedSkills[group.name] && (
                      <p className="text-sm text-slate-500 italic leading-relaxed">
                        {
                          group.skills.find(
                            (s: any) => s.name === selectedSkills[group.name],
                          )?.value
                        }
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Fixed Skills Selection */}
            {fixedSkillGroups.length > 0 && (
              <div className="space-y-4 pt-4 border-t border-white/5">
                <h3 className="text-sm font-black text-[#d4af37] uppercase tracking-widest">
                  固定特性
                </h3>
                {fixedSkillGroups.map((group: Skill) => (
                  <div
                    key={group.name}
                    className="space-y-3 p-4 bg-black/20 border border-white/5"
                  >
                    {group.skills.map((skill) => (
                      <div key={skill.name} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-bold text-slate-400">
                            {skill.name}
                          </span>
                        </div>
                        <p className="text-sm text-slate-500 italic leading-relaxed">
                          {skill.value}
                        </p>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Right: Matches */}
        <div className="lg:col-span-7 space-y-6">
          <section className="metal-panel p-6 border-t-2 border-t-slate-700 min-h-[600px]">
            <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-4">
              <h2 className="text-xl font-black text-white uppercase tracking-widest flex items-center gap-2">
                <Search className="w-5 h-5 text-slate-500" /> 匹配结果
              </h2>
              <div className="flex gap-4">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 bg-[#d4af37]" />
                  <span className="text-sm font-black uppercase text-slate-500">
                    必须匹配
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 bg-slate-400" />
                  <span className="text-sm font-black uppercase text-slate-500">
                    优先匹配
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <AnimatePresence mode="popLayout">
                {matchingCharacters.map((match: MatchResult) => (
                  <motion.div
                    layout
                    key={match.charName}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className={`p-4 border border-[#404040] relative overflow-hidden group transition-all duration-300 ${
                      match.type === "must"
                        ? "bg-[#d4af37]/5 border-[#d4af37]/50 shadow-[0_0_15px_rgba(212,175,55,0.05)]"
                        : match.type === "priority"
                          ? "bg-white/5 border-slate-500"
                          : "bg-black/20 opacity-60"
                    }`}
                  >
                    {/* Character Header */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex gap-4">
                        <div className="w-12 h-12 border border-white/5 bg-slate-800 flex items-center justify-center text-xl font-black text-slate-500 relative">
                          {match.charName.charAt(0)}
                          <div
                            className={`absolute bottom-0 right-0 w-4 h-4 text-[#d4af37]`}
                          >
                            {/* Small profession indicator could go here */}
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <span
                            className={`text-base font-black uppercase tracking-widest ${
                              match.type === "must"
                                ? "text-[#d4af37]"
                                : match.type === "priority"
                                  ? "text-white"
                                  : "text-slate-400"
                            }`}
                          >
                            {match.charName}
                          </span>
                          <div className="flex items-center gap-1.5">
                            {characterMap[match.charName]?.星级[0].includes(
                              "六",
                            ) ? (
                              <div className="flex gap-0.5">
                                {[...Array(6)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className="w-2.5 h-2.5 fill-yellow-500 text-yellow-500"
                                  />
                                ))}
                              </div>
                            ) : characterMap[match.charName]?.星级[0].includes(
                                "五",
                              ) ? (
                              <div className="flex gap-0.5">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className="w-2.5 h-2.5 fill-yellow-500 text-yellow-500"
                                  />
                                ))}
                              </div>
                            ) : (
                              <div className="flex gap-0.5">
                                {[...Array(4)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className="w-2.5 h-2.5 fill-slate-500 text-slate-500"
                                  />
                                ))}
                              </div>
                            )}
                            <span className="text-sm font-bold text-slate-500 uppercase ml-1">
                              {characterMap[match.charName]?.职业[0]}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Status Tags */}
                    <div className="flex gap-2 mb-3">
                      {match.type === "must" && (
                        <span className="text-sm px-1.5 bg-[#d4af37] text-black font-black uppercase">
                          必须匹配 (REQUIRED)
                        </span>
                      )}
                      {match.type === "priority" && (
                        <span className="text-sm px-1.5 bg-slate-400 text-black font-black uppercase">
                          优先匹配 (PRIORITY)
                        </span>
                      )}
                      {match.type === "default" && (
                        <span className="text-sm px-1.5 bg-slate-800 text-slate-400 font-black uppercase">
                          通用匹配 (DEFAULT)
                        </span>
                      )}
                    </div>
                    {/* Reasons */}
                    {match.matchedReasons.length > 0 ? (
                      <div className="space-y-2">
                        {match.matchedReasons.map((reason: any, i: number) => (
                          <div
                            key={i}
                            className={`flex items-center gap-2 text-sm font-bold uppercase tracking-tight p-1.5 transition-all ${
                              reason.isMaxMust
                                ? "bg-[#d4af37] text-black border-l-4 border-black shadow-[0_0_10px_rgba(212,175,55,0.3)] animate-pulse"
                                : "text-slate-300"
                            }`}
                          >
                            <CheckCircle2
                              className={`w-4 h-4 ${reason.isMaxMust ? "text-black" : match.type === "must" ? "text-[#d4af37]" : "text-slate-400"}`}
                            />
                            {reason.text}
                            {reason.isMaxMust && (
                              <span className="ml-auto text-sm bg-black text-[#d4af37] px-2 py-0.5 font-black border border-[#d4af37]/30">
                                PERFECT
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-sm text-slate-600 italic uppercase">
                        <AlertCircle className="w-4 h-4" />
                        默认匹配 (无特定需求)
                      </div>
                    )}

                    {/* Decorative stripes for matched items */}
                    {match.type !== "default" && (
                      <div
                        className={`absolute bottom-0 right-0 w-8 h-8 opacity-10 pointer-events-none transition-transform group-hover:scale-110`}
                      >
                        <div
                          className={`absolute inset-0 skew-x-12 ${match.type === "must" ? "bg-[#d4af37]" : "bg-slate-400"}`}
                        />
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
