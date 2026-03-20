import { useState, useEffect, useRef } from "react";
import {
  Database,
  Download,
  Upload,
  Clipboard,
  Trash2,
  X,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import XinmaoTable from "../components/XinmaoTable";
import type { MarkingLevel } from "../components/XinmaoTable";
import CharacterSelector from "../components/CharacterSelector";

export default function XinmaoPage() {
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(
    null,
  );
  const [allMarkings, setAllMarkings] = useState<Record<string, any>>({});
  const [isSyncOpen, setIsSyncOpen] = useState(false);
  const [syncStatus, setSyncStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load markings from localStorage on mount
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

  // Save markings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(
      "character_xinmao_markings",
      JSON.stringify(allMarkings),
    );
  }, [allMarkings]);

  const showStatus = (type: "success" | "error", message: string) => {
    setSyncStatus({ type, message });
    setTimeout(() => setSyncStatus(null), 3000);
  };

  const currentMarkings = selectedCharacter
    ? allMarkings[selectedCharacter] || {}
    : {};

  const handleMark = (
    type: "attribute" | "skill",
    itemName: string,
    subItemName: string,
    level: MarkingLevel,
  ) => {
    if (!selectedCharacter) return;

    setAllMarkings((prev) => {
      const charMarkings = {
        ...(prev[selectedCharacter] || {
          items: {},
          attributes: {},
          skills: {},
        }),
      };

      if (subItemName === "ITEM_MARK") {
        // Toggle item-level marking
        if (level === "none") {
          const { [itemName]: _, ...restItems } = charMarkings.items || {};
          charMarkings.items = restItems;
        } else {
          charMarkings.items = {
            ...(charMarkings.items || {}),
            [itemName]: true,
          };
        }
      } else {
        const key = `${itemName}-${subItemName}`;
        const targetGroup = type === "attribute" ? "attributes" : "skills";

        if (level === "none") {
          const { [key]: _, ...rest } = charMarkings[targetGroup] || {};
          charMarkings[targetGroup] = rest;
        } else {
          charMarkings[targetGroup] = {
            ...(charMarkings[targetGroup] || {}),
            [key]: level,
          };
        }
      }

      return {
        ...prev,
        [selectedCharacter]: charMarkings,
      };
    });
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(allMarkings, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const date = new Date().toISOString().split("T")[0];
    link.href = url;
    link.download = `xinmao_markings_${date}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showStatus("success", "数据导出成功");
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json && typeof json === "object") {
          if (confirm("导入将覆盖当前所有标记数据，确定继续吗？")) {
            setAllMarkings(json);
            showStatus("success", "数据导入成功");
          }
        } else {
          showStatus("error", "无效的数据格式");
        }
      } catch (err) {
        showStatus("error", "解析 JSON 失败");
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleCopy = async () => {
    try {
      const dataStr = JSON.stringify(allMarkings);
      await navigator.clipboard.writeText(dataStr);
      showStatus("success", "数据已复制到剪贴板");
    } catch (err) {
      showStatus("error", "复制失败");
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      const json = JSON.parse(text);
      if (json && typeof json === "object") {
        if (confirm("粘贴将覆盖当前所有标记数据，确定继续吗？")) {
          setAllMarkings(json);
          showStatus("success", "数据粘贴成功");
        }
      } else {
        showStatus("error", "剪贴板内容格式错误");
      }
    } catch (err) {
      console.error(err);
      showStatus("error", "无法读取或解析剪贴板");
    }
  };

  const handleClear = () => {
    if (confirm("确定要清除所有角色标记数据吗？此操作不可撤销。")) {
      setAllMarkings({});
      localStorage.removeItem("character_xinmao_markings");
      showStatus("success", "所有数据已清除");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <header className="mb-12 text-center space-y-4 relative">
        <div className="absolute top-0 right-0 z-50">
          <button
            onClick={() => setIsSyncOpen(!isSyncOpen)}
            className={`flex items-center gap-2 px-4 py-2 border transition-all duration-300 font-black uppercase tracking-widest text-xs ${
              isSyncOpen
                ? "bg-[#d4af37] text-black border-[#d4af37] shadow-[0_0_15px_rgba(212,175,55,0.4)]"
                : "bg-black/40 text-slate-400 border-slate-800 hover:border-slate-500"
            }`}
          >
            <Database className="w-4 h-4" />
            数据管理
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-300 ${isSyncOpen ? "rotate-180" : ""}`}
            />
          </button>

          {/* Sync Dropdown */}
          <AnimatePresence>
            {isSyncOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className="absolute top-full right-0 mt-2 w-72 metal-panel shadow-2xl p-5 space-y-4 border-t-2 border-t-[#d4af37]"
              >
                <div className="flex justify-between items-center mb-2 border-b border-white/5 pb-2">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                    跨设备同步管理
                  </span>
                  <button
                    onClick={() => setIsSyncOpen(false)}
                    className="hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4 text-slate-500" />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={handleExport}
                    className="flex flex-col items-center justify-center gap-2 p-4 bg-black/40 border border-white/5 hover:border-[#d4af37]/50 hover:bg-[#d4af37]/5 transition-all group relative overflow-hidden"
                  >
                    <Download className="w-6 h-6 text-slate-400 group-hover:text-[#d4af37] transition-transform group-hover:-translate-y-1" />
                    <span className="text-[10px] font-black text-slate-500 group-hover:text-slate-200 uppercase tracking-widest text-center">
                      导出文件
                    </span>
                    <div className="absolute bottom-0 left-0 w-full h-[1px] bg-[#d4af37] scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                  </button>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex flex-col items-center justify-center gap-2 p-4 bg-black/40 border border-white/5 hover:border-[#d4af37]/50 hover:bg-[#d4af37]/5 transition-all group relative overflow-hidden"
                  >
                    <Upload className="w-6 h-6 text-slate-400 group-hover:text-[#d4af37] transition-transform group-hover:-translate-y-1" />
                    <span className="text-[10px] font-black text-slate-500 group-hover:text-slate-200 uppercase tracking-widest text-center">
                      导入文件
                    </span>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImport}
                      accept=".json"
                      className="hidden"
                    />
                    <div className="absolute bottom-0 left-0 w-full h-[1px] bg-[#d4af37] scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                  </button>
                  <button
                    onClick={handleCopy}
                    className="flex flex-col items-center justify-center gap-2 p-4 bg-black/40 border border-white/5 hover:border-[#d4af37]/50 hover:bg-[#d4af37]/5 transition-all group relative overflow-hidden"
                  >
                    <Clipboard className="w-6 h-6 text-slate-400 group-hover:text-[#d4af37] transition-transform group-hover:-translate-y-1" />
                    <span className="text-[10px] font-black text-slate-500 group-hover:text-slate-200 uppercase tracking-widest text-center">
                      复制全部
                    </span>
                    <div className="absolute bottom-0 left-0 w-full h-[1px] bg-[#d4af37] scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                  </button>
                  <button
                    onClick={handlePaste}
                    className="flex flex-col items-center justify-center gap-2 p-4 bg-black/40 border border-white/5 hover:border-[#d4af37]/50 hover:bg-[#d4af37]/5 transition-all group relative overflow-hidden"
                  >
                    <div className="relative">
                      <Clipboard className="w-6 h-6 text-slate-400 group-hover:text-[#d4af37] transition-transform group-hover:-translate-y-1" />
                      <div className="absolute -top-1 -right-1 w-2 h-2 bg-[#d4af37] rounded-full shadow-[0_0_5px_#d4af37]" />
                    </div>
                    <span className="text-[10px] font-black text-slate-500 group-hover:text-slate-200 uppercase tracking-widest text-center">
                      粘贴解析
                    </span>
                    <div className="absolute bottom-0 left-0 w-full h-[1px] bg-[#d4af37] scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                  </button>
                </div>

                <div className="h-[1px] bg-white/5 my-2" />

                <button
                  onClick={handleClear}
                  className="w-full flex items-center justify-center gap-2 p-3 bg-red-900/10 border border-red-900/20 hover:bg-red-900/20 hover:border-red-500 transition-all group"
                >
                  <Trash2 className="w-4 h-4 text-red-500/50 group-hover:text-red-500" />
                  <span className="text-[10px] font-black text-slate-500 group-hover:text-red-500 uppercase tracking-[0.2em]">
                    物理粉碎所有数据
                  </span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Status Toast */}
          <AnimatePresence>
            {syncStatus && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className={`absolute top-full right-0 mt-4 w-72 p-4 border shadow-2xl flex items-center gap-3 backdrop-blur-md ${
                  syncStatus.type === "success"
                    ? "bg-green-900/20 border-green-500/50 text-green-400"
                    : "bg-red-900/20 border-red-500/50 text-red-400"
                }`}
              >
                {syncStatus.type === "success" ? (
                  <CheckCircle2 className="w-5 h-5 shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 shrink-0" />
                )}
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                  {syncStatus.message}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <h1 className="text-5xl font-black tracking-widest text-[#d4af37] sm:text-6xl uppercase">
          心锚数据库{" "}
          <span className="text-white opacity-20 font-light">DATABASE</span>
        </h1>
        <div className="h-[1px] w-24 mx-auto bg-gradient-to-r from-transparent via-[#d4af37] to-transparent mb-4" />
        <p className="text-base tracking-[0.2em] text-slate-500 max-w-2xl mx-auto uppercase font-bold">
          为角色标记推荐的心锚、词条与特性
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
