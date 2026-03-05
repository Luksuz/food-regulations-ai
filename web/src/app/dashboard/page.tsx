"use client";

import Link from "next/link";
import { useState, useRef, useCallback, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface Report {
  id: string;
  fileName: string;
  score: number | null;
  report: string;
  labelText: string | null;
  categories: string[];
  timestamp: string;
}

const CATEGORIES = [
  { id: "animal-food-labeling", label: "FDA 21 CFR 501 — Animal Food Labeling" },
  { id: "aafco-pet-food", label: "AAFCO — Pet Food Regulations" },
  { id: "gras-substances", label: "FDA 21 CFR 582 — GRAS Substances" },
  { id: "gras-animal-feed", label: "FDA 21 CFR 584 — GRAS Animal Feed" },
  { id: "animal-food-general", label: "FDA 21 CFR 500 — General" },
];

function ShieldIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  );
}

function ScoreGauge({ score, size = 160 }: { score: number; size?: number }) {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? "#10b981" : score >= 60 ? "#f59e0b" : "#ef4444";

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg viewBox="0 0 100 100" className="transform -rotate-90" style={{ width: size, height: size }}>
        <circle cx="50" cy="50" r={radius} fill="none" stroke="#1c2320" strokeWidth="8" />
        <circle
          cx="50" cy="50" r={radius} fill="none" stroke={color} strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ animation: "score-fill 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards", transition: "stroke-dashoffset 1.2s cubic-bezier(0.16, 1, 0.3, 1)" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-[family-name:var(--font-display)] text-4xl" style={{ color }}>{score}</span>
        <span className="text-xs text-night-400 mt-0.5">/ 100</span>
      </div>
    </div>
  );
}

function ProgressBar({ progress, label }: { progress: number; label: string }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-night-300">{label}</span>
        <span className="font-[family-name:var(--font-mono)] text-xs text-emit-400">{progress}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-night-700 overflow-hidden">
        <div
          className="h-full rounded-full bg-emit-500 transition-all duration-700 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [selectedCats, setSelectedCats] = useState<string[]>(["animal-food-labeling", "aafco-pet-food"]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [currentReport, setCurrentReport] = useState<Report | null>(null);
  const [history, setHistory] = useState<Report[]>([]);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback((newFiles: FileList | File[]) => {
    const arr = Array.from(newFiles);
    setFiles((prev) => [...prev, ...arr]);
  }, []);

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files.length > 0) addFiles(e.dataTransfer.files);
  }, [addFiles]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) addFiles(e.target.files);
    e.target.value = "";
  }, [addFiles]);

  const toggleCategory = (id: string) => {
    setSelectedCats((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };

  const analyze = async () => {
    if (files.length === 0 || selectedCats.length === 0) return;

    setIsAnalyzing(true);
    setError(null);
    setCurrentReport(null);
    setProgress(0);

    // Simulated progress steps — Goal-Gradient Effect
    const steps = [
      { p: 15, l: `Uploading ${files.length} file${files.length > 1 ? "s" : ""}...` },
      { p: 35, l: "Extracting text with AI Vision..." },
      { p: 55, l: "Retrieving regulatory context..." },
      { p: 75, l: "Evaluating compliance..." },
      { p: 90, l: "Generating report..." },
    ];

    let stepIdx = 0;
    const progressInterval = setInterval(() => {
      if (stepIdx < steps.length) {
        setProgress(steps[stepIdx].p);
        setProgressLabel(steps[stepIdx].l);
        stepIdx++;
      }
    }, 2500);

    try {
      const formData = new FormData();
      files.forEach((f) => formData.append("files", f));
      formData.append("categories", selectedCats.join(","));

      const res = await fetch("/api/evaluate", { method: "POST", body: formData });
      const data = await res.json();

      clearInterval(progressInterval);

      if (!res.ok) {
        setError(data.error || "Evaluation failed");
        return;
      }

      setProgress(100);
      setProgressLabel("Complete!");

      const fileName = files.length === 1 ? files[0].name : `${files.length} files — ${files[0].name}`;
      const report: Report = {
        id: crypto.randomUUID(),
        fileName,
        score: data.score,
        report: data.report,
        labelText: data.labelText,
        categories: data.categories,
        timestamp: data.timestamp,
      };

      setCurrentReport(report);
      setHistory((prev) => [report, ...prev]);
    } catch (err) {
      clearInterval(progressInterval);
      setError(err instanceof Error ? err.message : "Network error");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const loadReport = (report: Report) => {
    setCurrentReport(report);
    setProgress(100);
    setProgressLabel("Complete!");
  };

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem("labelguard-reports");
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch {}
  }, []);

  // Persist history to localStorage on change
  useEffect(() => {
    if (history.length > 0) {
      try {
        localStorage.setItem("labelguard-reports", JSON.stringify(history));
      } catch {}
    }
  }, [history]);

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-72 shrink-0 border-r border-night-700/50 bg-night-900/50 flex flex-col">
        <div className="h-16 px-5 flex items-center gap-2.5 border-b border-night-700/50">
          <Link href="/" className="flex items-center gap-2.5">
            <ShieldIcon className="w-5 h-5 text-emit-500" />
            <span className="font-[family-name:var(--font-display)] text-base">LabelGuard</span>
          </Link>
        </div>

        {/* History — Endowment Effect */}
        <div className="flex-1 overflow-y-auto p-4">
          <p className="text-xs uppercase tracking-widest text-night-500 font-semibold mb-3">Report History</p>
          {history.length === 0 ? (
            <p className="text-xs text-night-500 italic">No reports yet. Upload a label to get started.</p>
          ) : (
            <div className="space-y-1.5">
              {history.map((r) => (
                <button
                  key={r.id}
                  onClick={() => loadReport(r)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg transition-all text-sm ${
                    currentReport?.id === r.id ? "bg-emit-500/10 border border-emit-500/30" : "hover:bg-night-700/50 border border-transparent"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium truncate max-w-[140px]">{r.fileName}</span>
                    {r.score !== null && (
                      <span className={`font-[family-name:var(--font-mono)] text-xs ${
                        r.score >= 80 ? "text-emit-400" : r.score >= 60 ? "text-warn-400" : "text-danger-400"
                      }`}>
                        {r.score}%
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-night-500">
                    {new Date(r.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-night-700/50">
          <Link href="/" className="flex items-center gap-2 text-xs text-night-400 hover:text-emit-400 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Back to Home
          </Link>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col min-h-screen">
        <header className="h-16 px-8 flex items-center border-b border-night-700/50">
          <h1 className="font-[family-name:var(--font-display)] text-lg">Compliance Evaluator</h1>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          {/* Upload Section */}
          {!currentReport && !isAnalyzing && (
            <div className="max-w-2xl mx-auto animate-fade-up">
              {/* Drop Zone — Activation Energy */}
              <div
                className={`upload-zone relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${
                  isDragging ? "border-emit-400 bg-emit-500/5 scale-[1.01]" : "border-night-600"
                } ${files.length > 0 ? "border-emit-500/50 bg-emit-500/3" : ""}`}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".jpg,.jpeg,.png,.webp,.gif,.txt"
                  multiple
                  className="hidden"
                  onChange={handleFileSelect}
                />

                {files.length > 0 ? (
                  <div className="space-y-3">
                    <div className="w-14 h-14 mx-auto rounded-xl bg-emit-500/10 flex items-center justify-center">
                      <svg className="w-7 h-7 text-emit-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="font-semibold">{files.length} file{files.length > 1 ? "s" : ""} selected</p>
                    <p className="text-sm text-night-400">Click to add more</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="w-14 h-14 mx-auto rounded-xl bg-night-700/50 flex items-center justify-center">
                      <svg className="w-7 h-7 text-night-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                      </svg>
                    </div>
                    <p className="font-semibold">Upload photos of your product label</p>
                    <p className="text-sm text-night-400">Upload multiple images to cover all label panels</p>
                    <p className="text-xs text-night-500">Supports JPG, PNG, WEBP, GIF, or TXT</p>
                  </div>
                )}
              </div>

              {/* File list with remove buttons */}
              {files.length > 0 && (
                <div className="mt-3 space-y-1.5">
                  {files.map((f, i) => (
                    <div key={`${f.name}-${i}`} className="flex items-center justify-between px-4 py-2 rounded-lg bg-night-800/30 border border-night-700/30">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xs text-night-500 shrink-0">{i + 1}.</span>
                        <span className="text-sm truncate">{f.name}</span>
                        <span className="text-xs text-night-500 shrink-0">{(f.size / 1024).toFixed(0)} KB</span>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                        className="ml-2 p-1 rounded hover:bg-night-700 text-night-500 hover:text-danger-400 transition-colors shrink-0"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Upload guidance */}
              <div className="mt-6 p-4 rounded-xl border border-night-700/30 bg-night-800/20">
                <p className="text-sm font-semibold mb-2 text-night-200">For the best analysis, capture all of these on the label:</p>
                <div className="grid sm:grid-cols-2 gap-x-6 gap-y-1.5">
                  {[
                    "Product name & brand",
                    "Guaranteed Analysis (protein, fat, fiber, moisture)",
                    "Full ingredients list",
                    "AAFCO nutritional adequacy statement",
                    "Feeding directions",
                    "Net weight",
                    "Manufacturer name & address",
                    "Marketing claims (grain-free, organic, etc.)",
                    "Calorie content",
                    "Species / life stage (e.g. Adult Dogs)",
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-2 text-xs text-night-400">
                      <span className="mt-1 w-1 h-1 rounded-full bg-emit-500/60 shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-night-500 mt-3">Tip: Upload multiple photos to cover all label panels (front, back, sides). The AI will combine all extracted text before evaluating. Missing elements will be flagged as violations.</p>
              </div>

              {/* Sample Labels */}
              {files.length === 0 && (
                <div className="mt-4 flex items-center gap-3 flex-wrap">
                  <span className="text-xs text-night-500">or try a sample:</span>
                  <button
                    onClick={async () => {
                      const res = await fetch("/sample-label.webp");
                      const blob = await res.blob();
                      const sampleFile = new File([blob], "pedigree-dog-food-label.webp", { type: "image/webp" });
                      setFiles([sampleFile]);
                    }}
                    className="text-xs text-emit-400 hover:text-emit-300 underline underline-offset-2 transition-colors"
                  >
                    Pedigree Dog Food
                  </button>
                  <span className="text-xs text-night-600">|</span>
                  <button
                    onClick={async () => {
                      const res = await fetch("/sample-label-2.png");
                      const blob = await res.blob();
                      const sampleFile = new File([blob], "science-diet-large-breed-label.png", { type: "image/png" });
                      setFiles([sampleFile]);
                    }}
                    className="text-xs text-emit-400 hover:text-emit-300 underline underline-offset-2 transition-colors"
                  >
                    Science Diet Large Breed
                  </button>
                </div>
              )}

              {/* Category Selection */}
              <div className="mt-8">
                <p className="text-sm font-semibold mb-3">Evaluate against:</p>
                <div className="space-y-2">
                  {CATEGORIES.map((cat) => (
                    <label
                      key={cat.id}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all ${
                        selectedCats.includes(cat.id)
                          ? "border-emit-500/40 bg-emit-500/5"
                          : "border-night-700/50 hover:border-night-600"
                      }`}
                    >
                      <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${
                        selectedCats.includes(cat.id) ? "border-emit-500 bg-emit-500" : "border-night-500"
                      }`}>
                        {selectedCats.includes(cat.id) && (
                          <svg className="w-2.5 h-2.5 text-night-950" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={4}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                        )}
                      </div>
                      <input type="checkbox" className="hidden" checked={selectedCats.includes(cat.id)} onChange={() => toggleCategory(cat.id)} />
                      <span className="text-sm">{cat.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Analyze Button */}
              <button
                onClick={analyze}
                disabled={files.length === 0 || selectedCats.length === 0}
                className="mt-8 w-full h-14 rounded-xl bg-emit-500 text-night-950 font-semibold text-lg hover:bg-emit-400 disabled:opacity-30 disabled:cursor-not-allowed transition-all hover:shadow-[0_0_30px_rgba(16,185,129,0.2)]"
              >
                Analyze Label for Compliance
              </button>

              {error && (
                <div className="mt-4 p-4 rounded-xl border border-danger-500/30 bg-danger-500/5 text-danger-400 text-sm">
                  {error}
                </div>
              )}
            </div>
          )}

          {/* Progress — Goal-Gradient Effect */}
          {isAnalyzing && (
            <div className="max-w-lg mx-auto mt-20 animate-fade-up">
              <div className="text-center mb-10">
                <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-emit-500/10 flex items-center justify-center">
                  <svg className="w-8 h-8 text-emit-500 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                </div>
                <h2 className="font-[family-name:var(--font-display)] text-xl mb-2">Analyzing Your Label</h2>
                <p className="text-sm text-night-400">{files.length === 1 ? files[0].name : `${files.length} files`}</p>
              </div>
              <ProgressBar progress={progress} label={progressLabel} />
              <div className="mt-6 grid grid-cols-5 gap-1">
                {["Upload", "OCR", "Retrieve", "Evaluate", "Report"].map((step, i) => {
                  const stepProgress = ((i + 1) / 5) * 100;
                  const isActive = progress >= stepProgress - 15;
                  const isDone = progress >= stepProgress;
                  return (
                    <div key={step} className="text-center">
                      <div className={`w-2 h-2 rounded-full mx-auto mb-1.5 transition-all ${isDone ? "bg-emit-500" : isActive ? "bg-emit-500/40 animate-pulse" : "bg-night-700"}`} />
                      <span className={`text-[10px] ${isDone ? "text-emit-400" : "text-night-500"}`}>{step}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Results — Peak-End Rule (satisfying reveal) */}
          {currentReport && !isAnalyzing && (
            <div className="animate-fade-up">
              <div className="flex items-start justify-between mb-8">
                <div>
                  <p className="text-xs text-night-500 uppercase tracking-widest font-semibold mb-1">Compliance Report</p>
                  <h2 className="font-[family-name:var(--font-display)] text-2xl">{currentReport.fileName}</h2>
                  <p className="text-xs text-night-500 mt-1">
                    {new Date(currentReport.timestamp).toLocaleString()} &middot; Categories: {currentReport.categories.join(", ")}
                  </p>
                </div>
                <button
                  onClick={() => { setCurrentReport(null); setFiles([]); setProgress(0); setError(null); }}
                  className="h-10 px-5 rounded-lg border border-night-600 text-sm text-night-300 hover:border-emit-500 hover:text-emit-400 transition-all"
                >
                  New Scan
                </button>
              </div>

              <div className="grid lg:grid-cols-[200px_1fr] gap-8">
                {/* Score Gauge */}
                <div className="flex flex-col items-center gap-3">
                  {currentReport.score !== null && <ScoreGauge score={currentReport.score} />}
                  <p className="text-xs text-night-400 text-center">
                    {currentReport.score !== null && currentReport.score >= 80 && "Looking good!"}
                    {currentReport.score !== null && currentReport.score >= 60 && currentReport.score < 80 && "Needs attention"}
                    {currentReport.score !== null && currentReport.score < 60 && "Significant issues found"}
                  </p>
                </div>

                {/* Report Content */}
                <div className="p-6 rounded-2xl border border-night-700/50 bg-night-800/20 overflow-x-auto prose-report">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      h1: ({ children }) => <h2 className="font-[family-name:var(--font-display)] text-2xl mt-8 mb-4 text-emit-400">{children}</h2>,
                      h2: ({ children }) => <h3 className="font-[family-name:var(--font-display)] text-lg mt-6 mb-3 text-white/90 border-b border-night-700 pb-2">{children}</h3>,
                      h3: ({ children }) => <h4 className="font-[family-name:var(--font-display)] text-base mt-4 mb-2 text-white/80">{children}</h4>,
                      p: ({ children }) => <p className="text-sm text-night-300 leading-relaxed py-1">{children}</p>,
                      strong: ({ children }) => <strong className="text-white/90 font-semibold">{children}</strong>,
                      ul: ({ children }) => <ul className="space-y-1 my-2">{children}</ul>,
                      ol: ({ children }) => <ol className="space-y-1 my-2 list-decimal list-inside">{children}</ol>,
                      li: ({ children }) => <li className="text-sm text-night-300 leading-relaxed">{children}</li>,
                      table: ({ children }) => <div className="overflow-x-auto my-4"><table className="w-full text-sm border-collapse">{children}</table></div>,
                      thead: ({ children }) => <thead className="bg-night-700/30">{children}</thead>,
                      th: ({ children }) => <th className="text-left px-3 py-2 font-semibold text-night-300 border-b border-night-700">{children}</th>,
                      td: ({ children }) => {
                        const text = String(children);
                        const isPass = /present|pass|compliant|yes/i.test(text);
                        const isFail = /missing|fail|violation|no\b/i.test(text);
                        return <td className={`px-3 py-2 border-b border-night-700/30 ${isPass ? "text-emit-400" : isFail ? "text-danger-400" : "text-night-300"}`}>{children}</td>;
                      },
                      code: ({ children }) => <code className="font-[family-name:var(--font-mono)] text-xs bg-night-700/50 px-1.5 py-0.5 rounded">{children}</code>,
                    }}
                  >
                    {currentReport.report}
                  </ReactMarkdown>
                </div>
              </div>

              {/* Extracted Label Text */}
              {currentReport.labelText && (
                <details className="mt-8 group">
                  <summary className="cursor-pointer text-sm text-night-400 hover:text-night-300 transition-colors">
                    View extracted label text
                  </summary>
                  <pre className="mt-3 p-5 rounded-xl bg-night-800/50 border border-night-700/30 text-xs text-night-300 font-[family-name:var(--font-mono)] whitespace-pre-wrap overflow-x-auto leading-relaxed">
                    {currentReport.labelText}
                  </pre>
                </details>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
