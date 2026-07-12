import React, { useState } from "react";
import { Sparkles, X, Send } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import API from "../api/axios";

export default function AIChat({ isOpen, onClose }) {
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiOutput, setAiOutput] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  if (!isOpen) return null;

  const fireAICoPilotInquiry = async () => {
    if (!aiPrompt.trim()) return;
    setAiLoading(true);
    setAiOutput("");
    try {
      const res = await API.post("chat/ai_insights/", { prompt: aiPrompt });
      if (res.data.insights) {
        setAiOutput(res.data.insights);
      } else {
        setAiOutput(JSON.stringify(res.data));
      }
    } catch (err) {
      const serverError =
        err.response?.data?.error || "Inference connection failure.";
      setAiOutput(`### ⚠️ Live API Wire Exception\n\n${serverError}`);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex justify-end transition-opacity animate-fade-in">
      <div className="w-full sm:max-w-md md:max-w-lg bg-gradient-to-b from-slate-900 to-indigo-950 h-full shadow-2xl flex flex-col border-l border-slate-800 text-white animate-slide-in">
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between bg-black/20">
          <div className="flex items-center gap-2">
            <Sparkles className="text-blue-400 w-5 h-5 animate-pulse shrink-0" />
            <div>
              <h3 className="text-xs sm:text-sm font-black text-blue-400 uppercase tracking-widest">
                AI Co-Pilot Insights
              </h3>
              <p className="text-[10px] text-slate-400 font-medium">
                Live reasoning evaluation engine
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* Output Viewport with scrollable markdown table support */}
        <div className="flex-1 p-4 sm:p-5 overflow-y-auto text-xs space-y-4 custom-scrollbar">
          {aiLoading ? (
            <div className="flex flex-col space-y-2 pt-2">
              <span className="font-mono text-[11px] text-slate-400 animate-pulse block">
                Compiling data matrices...
              </span>
              <div className="h-1.5 w-full bg-white/5 overflow-hidden rounded-full">
                <div className="h-full bg-blue-500 rounded-full animate-progress w-1/3"></div>
              </div>
            </div>
          ) : aiOutput ? (
            <div
              className="prose prose-invert prose-xs max-w-none text-slate-200 
                            prose-headings:font-black prose-headings:text-blue-400 prose-headings:my-2
                            prose-ul:list-disc prose-ul:ml-4 prose-strong:text-emerald-400
                            prose-table:border-collapse prose-table:w-full prose-th:bg-white/10 prose-th:p-2 prose-td:p-2 prose-td:border prose-td:border-white/10 overflow-x-auto animate-fade-in"
            >
              {/* 🌟 Enabled table parsing below */}
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {aiOutput}
              </ReactMarkdown>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 space-y-3 py-20 px-4">
              <Sparkles size={24} className="text-slate-700" />
              <p className="font-medium max-w-xs text-[11px] sm:text-xs">
                Inquire regarding performance bottlenecks or active blocker
                tracking parameters.
              </p>
            </div>
          )}
        </div>

        {/* Input Box */}
        <div className="p-3 sm:p-4 border-t border-white/10 bg-black/20">
          <div className="flex gap-2">
            <input
              type="text"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && !aiLoading && fireAICoPilotInquiry()
              }
              className="flex-1 bg-white/5 border border-white/10 p-2.5 sm:p-3 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 transition w-full min-w-0"
              placeholder="Ask about active workloads..."
              disabled={aiLoading}
            />
            <button
              onClick={fireAICoPilotInquiry}
              disabled={aiLoading || !aiPrompt.trim()}
              className="bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-600 px-3.5 sm:px-4 rounded-xl font-bold text-xs text-white transition flex items-center justify-center shrink-0"
            >
              <Send size={13} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
