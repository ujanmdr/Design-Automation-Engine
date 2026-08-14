"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Trophy, Film, Sparkles, Download, RefreshCw, Calendar, CheckCircle2, Sliders, PlayCircle, Search, RotateCcw, Type, Image as ImageIcon } from "lucide-react";
import TypographyPanel, { TypographySettings, defaultTypographySettings } from "@/components/TypographyPanel";
import ImageEditPanel, { ImageAdjustments, defaultImageAdjustments, getCssFilterString } from "@/components/ImageEditPanel";

interface Employee {
  id: string;
  name: string;
  title: string;
  appointmentDate?: string;
  photoFileName: string;
  anniversaryPhotoSettings?: {
    x: number;
    y: number;
    scale: number;
  };
}

const parseAppointmentDate = (dateStr: string) => {
  if (!dateStr) return null;
  const cleaned = dateStr.trim();

  // Try "DD-Month-YYYY" or "DD Month, YYYY" e.g., "15-Apr-2024", "16-May-2022", "16 May 2022"
  const textMatch = cleaned.match(/^(\d{1,2})[\s\-]+([A-Za-z]+)[\s,\-]+(\d{4})$/);
  if (textMatch) {
    const day = parseInt(textMatch[1], 10);
    const monthName = textMatch[2].toLowerCase();
    const year = parseInt(textMatch[3], 10);

    const monthMap: Record<string, number> = {
      january: 0, jan: 0,
      february: 1, feb: 1,
      march: 2, mar: 2,
      april: 3, apr: 3,
      may: 4,
      june: 5, jun: 5,
      july: 6, jul: 6,
      august: 7, aug: 7,
      september: 8, sep: 8, sept: 8,
      october: 9, oct: 9,
      november: 10, nov: 10,
      december: 11, dec: 11,
    };

    if (monthMap[monthName] !== undefined) {
      return { day, monthIndex: monthMap[monthName], year };
    }
  }

  // Try ISO "YYYY-MM-DD" or "YYYY/MM/DD"
  const isoMatch = cleaned.match(/^(\d{4})[\-\/](\d{1,2})[\-\/](\d{1,2})$/);
  if (isoMatch) {
    return {
      year: parseInt(isoMatch[1], 10),
      monthIndex: parseInt(isoMatch[2], 10) - 1,
      day: parseInt(isoMatch[3], 10),
    };
  }

  // Native Date fallback
  const fallback = new Date(cleaned);
  if (!isNaN(fallback.getTime())) {
    return {
      year: fallback.getFullYear(),
      monthIndex: fallback.getMonth(),
      day: fallback.getDate(),
    };
  }

  return null;
};

const getUpcomingAnniversary = (appointmentDateStr: string) => {
  const parsed = parseAppointmentDate(appointmentDateStr);
  if (!parsed) return null;
  
  const { day, monthIndex, year: appointmentYear } = parsed;
  const today = new Date();
  
  let anniversaryDate = new Date(today.getFullYear(), monthIndex, day);
  const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  
  if (anniversaryDate < todayMidnight) {
    anniversaryDate.setFullYear(today.getFullYear() + 1);
  }
  
  const diffTime = anniversaryDate.getTime() - todayMidnight.getTime();
  const daysUntil = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const yearsCompleted = Math.max(1, today.getFullYear() - appointmentYear);
  
  return {
    anniversaryDate,
    daysUntil,
    yearsCompleted
  };
};

export default function WorkAnniversaryPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Dynamic parameters
  const [activeTab, setActiveTab] = useState<'align' | 'typography' | 'image'>('align');
  const [years, setYears] = useState<number>(3);
  const [templateType, setTemplateType] = useState<"story" | "post">("story");
  const [testimonial, setTestimonial] = useState<string>(
    "Thank you for your dedication, hard work, and valuable contributions to GritFeat!"
  );

  // Photo alignment parameters
  const [x, setX] = useState<number>(0);
  const [y, setY] = useState<number>(148);
  const [scale, setScale] = useState<number>(1.0);

  const [typography, setTypography] = useState<TypographySettings>(defaultTypographySettings);
  const [imageAdjustments, setImageAdjustments] = useState<ImageAdjustments>(defaultImageAdjustments);

  // Render state
  const [compName, setCompName] = useState("Comp 1");
  const [rendering, setRendering] = useState(false);
  const [renderMsg, setRenderMsg] = useState<string | null>(null);
  const [renderSuccess, setRenderSuccess] = useState<boolean | null>(null);

  // Card Live Preview & Stage Mode States ('cards' | 'video')
  const [cardPreviewTab, setCardPreviewTab] = useState<'both' | 'card1' | 'card2'>('both');
  const [activeStageMode, setActiveStageMode] = useState<'cards' | 'video'>('cards');
  const [previewLoading, setPreviewLoading] = useState(false);

  // Output URLs
  const [card1Url, setCard1Url] = useState<string | null>(null);
  const [card2Url, setCard2Url] = useState<string | null>(null);
  const [renderedVideoUrl, setRenderedVideoUrl] = useState<string | null>(null);
  const [renderedGifUrl, setRenderedGifUrl] = useState<string | null>(null);

  // GIF state
  const [generatingGif, setGeneratingGif] = useState(false);
  const [gifMsg, setGifMsg] = useState<string | null>(null);
  const [gifError, setGifError] = useState<string | null>(null);

  // Debounced Card 1 & Card 2 Preview Generator
  useEffect(() => {
    if (!selectedEmployee) return;

    const timer = setTimeout(async () => {
      setPreviewLoading(true);
      try {
        const res = await fetch("/api/preview-anniversary-cards", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            employeeId: selectedEmployee.id,
            yearsCompleted: `${years} ${years === 1 ? "Year" : "Years"}`,
            testimonial,
            x,
            y,
            scale,
            typographySettings: typography,
            imageAdjustments
          }),
        });
        const data = await res.json();
        if (data.success) {
          setCard1Url(`${data.card1Url}?t=${Date.now()}`);
          setCard2Url(`${data.card2Url}?t=${Date.now()}`);
        }
      } catch (err) {
        console.error("Failed to update card previews:", err);
      }
      setPreviewLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [selectedEmployee?.id, years, testimonial, x, y, scale, typography, imageAdjustments]);

  useEffect(() => {
    fetch("/api/employees")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.employees) {
          setEmployees(data.employees);
          // Auto select first employee if available
          if (data.employees.length > 0) {
            handleSelectEmployee(data.employees[0]);
          }
        }
      })
      .catch((err) => console.error("Failed to load employees:", err));
  }, []);

  const handleSelectEmployee = (emp: Employee) => {
    setSelectedEmployee(emp);
    setActiveStageMode('cards');
    setCard1Url(null);
    setCard2Url(null);
    setRenderedVideoUrl(null);
    setRenderedGifUrl(null);
    setRenderMsg(null);
    setGifMsg(null);
    setGifError(null);

    // Calculate years if appointment date exists
    if (emp.appointmentDate) {
      const up = getUpcomingAnniversary(emp.appointmentDate);
      if (up && up.yearsCompleted > 0) {
        setYears(up.yearsCompleted);
      }
    }

    if (emp.anniversaryPhotoSettings) {
      setX(emp.anniversaryPhotoSettings.x ?? 0);
      setY(emp.anniversaryPhotoSettings.y ?? 148);
      setScale(emp.anniversaryPhotoSettings.scale ?? 1.0);
    } else {
      setX(0);
      setY(148);
      setScale(1.0);
    }
  };

  const handleRender = async () => {
    if (!selectedEmployee) return;

    setRendering(true);
    setRenderMsg("Rendering via After Effects pipeline...");
    setRenderSuccess(null);
    setRenderedVideoUrl(null);
    setRenderedGifUrl(null);
    setGifError(null);

    try {
      const res = await fetch("/api/generate-anniversary-video", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId: selectedEmployee.id,
          yearsCompleted: `${years} ${years === 1 ? "Year" : "Years"}`,
          compositionName: compName,
          templateType,
          testimonial: testimonial,
          x,
          y,
          scale,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setRenderMsg(`✅ Video rendered successfully!`);
        setRenderSuccess(true);
        setCard1Url(data.card1Url);
        setCard2Url(data.card2Url);
        setRenderedVideoUrl(data.videoUrl);
        setActiveStageMode('video');
      } else {
        setRenderMsg(`❌ ${data.details || data.error || "Failed to render video"}`);
        setRenderSuccess(false);
        if (data.card1Url) setCard1Url(data.card1Url);
        if (data.card2Url) setCard2Url(data.card2Url);
      }
    } catch (err: any) {
      setRenderMsg(`❌ Error: ${err?.message || "Failed to trigger video render"}`);
      setRenderSuccess(false);
    }
    setRendering(false);
  };

  const handleGenerateGif = async () => {
    if (!renderedVideoUrl) return;
    setGeneratingGif(true);
    setGifMsg("Converting MP4 to high-quality GIF...");
    setGifError(null);

    try {
      const res = await fetch("/api/generate-anniversary-gif", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoUrl: renderedVideoUrl }),
      });

      if (!res.ok) {
        const text = await res.text();
        let errMsg = "Failed to convert to GIF";
        try {
          const json = JSON.parse(text);
          errMsg = json.error || json.details || errMsg;
        } catch {
          errMsg = `Server returned status ${res.status}`;
        }
        setGifError(errMsg);
        setGifMsg(null);
        setGeneratingGif(false);
        return;
      }

      const data = await res.json();

      if (data.success) {
        setRenderedGifUrl(data.gifUrl);
        setGifMsg("✅ GIF created successfully!");
      } else {
        setGifError(data.error || "Failed to convert to GIF");
        setGifMsg(null);
      }
    } catch (err: any) {
      setGifError(err?.message || "Error creating GIF");
      setGifMsg(null);
    }
    setGeneratingGif(false);
  };

  // Compute upcoming anniversaries list for ALL employees, sorted by upcoming days
  const parsedUpcomingEmployees = employees
    .map((emp) => {
      const upcoming = emp.appointmentDate ? getUpcomingAnniversary(emp.appointmentDate) : null;
      return { 
        ...emp, 
        upcoming: upcoming || { anniversaryDate: null, daysUntil: 999, yearsCompleted: 1 } 
      };
    })
    .sort((a, b) => {
      if (a.upcoming.daysUntil !== b.upcoming.daysUntil) {
        return a.upcoming.daysUntil - b.upcoming.daysUntil;
      }
      return a.name.localeCompare(b.name);
    });

  return (
    <div className="min-h-screen bg-[#F8F9FD] text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-30 apple-glass border-b border-slate-200/80 px-8 py-4">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold text-sm">
              🏆
            </div>
            <div>
              <h1 className="font-extrabold text-base tracking-tight text-slate-900">Work Anniversary Studio</h1>
              <p className="text-[11px] text-slate-500 font-medium">After Effects Automated Video & GIF Engine</p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold text-slate-600">
            <span className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-200/80">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Two-Step AE Pipeline
            </span>
            <div className="h-4 w-[1px] bg-slate-200" />
            <Link href="/employees" className="font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100 transition-colors">
              Manage Employees ↗
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto p-6 md:p-8 space-y-8">
        
        {/* ── Upcoming Work Anniversaries Carousel Queue ───────────────────────── */}
        {parsedUpcomingEmployees.length > 0 && (
          <section className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <div className="flex items-center gap-2.5">
                <Trophy size={18} className="text-emerald-600" />
                <div>
                  <h2 className="text-sm font-extrabold text-slate-900 tracking-tight">Work Anniversary Queue</h2>
                  <p className="text-[11px] text-slate-500 font-medium">All team members in directory</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative w-64">
                  <input 
                    type="text" 
                    placeholder="Search anniversary queue..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium placeholder-slate-400"
                  />
                  <Search className="absolute left-3 top-2 text-slate-400" size={14} />
                </div>
                <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                  {parsedUpcomingEmployees.length} Total Members
                </span>
              </div>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-2 pt-1 custom-scrollbar snap-x">
              {parsedUpcomingEmployees
                .filter(emp => 
                  emp.name.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
                  (emp.title && emp.title.toLowerCase().includes(searchQuery.trim().toLowerCase()))
                )
                .map((emp) => {
                const isSelected = selectedEmployee?.id === emp.id;
                const isToday = emp.upcoming.daysUntil === 0;

                return (
                  <div 
                    key={emp.id} 
                    onClick={() => handleSelectEmployee(emp)}
                    className={`snap-start min-w-[210px] cursor-pointer rounded-2xl p-4 flex flex-col items-center text-center transition-all duration-200 select-none ${
                      isSelected 
                        ? "bg-emerald-50/60 border-2 border-emerald-500 shadow-md scale-[1.02]" 
                        : "bg-slate-50/80 border border-slate-200/80 hover:border-emerald-500/40 hover:bg-white"
                    }`}
                  >
                    <div className={`w-16 h-16 rounded-full overflow-hidden mb-2.5 relative transition-all shadow-sm ${
                      isSelected ? "ring-2 ring-emerald-500 ring-offset-2" : ""
                    }`}>
                      <img 
                        src={`/assets/templates/Id%20Card%20Employee%20Images/${encodeURIComponent(emp.photoFileName)}`} 
                        alt={emp.name} 
                        className="w-full h-full object-cover object-top" 
                        onError={(e) => (e.currentTarget.src = '/assets/templates/overlay.png')} 
                      />
                    </div>
                    
                    <h3 className="font-bold text-slate-900 text-xs leading-tight line-clamp-1 w-full">{emp.name}</h3>
                    <p className="text-[11px] text-slate-500 font-medium line-clamp-1 w-full">{emp.title}</p>
                    <p className="text-[10px] text-emerald-800 font-extrabold mt-1.5 bg-emerald-100/70 px-2.5 py-0.5 rounded-full border border-emerald-200/80 whitespace-nowrap">
                      Completing {emp.upcoming.yearsCompleted} {emp.upcoming.yearsCompleted === 1 ? "Year" : "Years"}
                    </p>
                    
                    <div className="mt-2.5 w-full">
                      {isToday ? (
                        <span className="bg-emerald-600 text-white text-[10px] font-extrabold px-3 py-0.5 rounded-full block animate-bounce shadow-sm">
                          TODAY! 🎉
                        </span>
                      ) : emp.upcoming.daysUntil < 999 ? (
                        <span className="bg-blue-50 text-blue-600 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-blue-200 block">
                          In {emp.upcoming.daysUntil} {emp.upcoming.daysUntil === 1 ? "day" : "days"}
                        </span>
                      ) : (
                        <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-slate-200 block">
                          Select Employee
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ── Three-Zone Studio Grid ───────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ZONE 1: Left Milestone & Employee Controls (4 Cols) */}
          <div className="lg:col-span-4 space-y-6">
            {selectedEmployee ? (
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-6">
                
                {/* Selected Employee Badge */}
                <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-100 border border-slate-200 shadow-sm">
                    <img
                      src={`/assets/templates/Id%20Card%20Employee%20Images/${encodeURIComponent(selectedEmployee.photoFileName)}`}
                      alt={selectedEmployee.name}
                      className="w-full h-full object-cover object-top"
                      onError={(e) => (e.currentTarget.src = "/assets/images/image_0.png")}
                    />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900">{selectedEmployee.name}</h3>
                    <p className="text-xs text-slate-500 font-medium">{selectedEmployee.title}</p>
                  </div>
                </div>

                {/* Studio Control Tabs */}
                <div className="flex bg-slate-100 p-1 rounded-2xl border border-slate-200/80 gap-1">
                  <button
                    type="button"
                    onClick={() => setActiveTab('align')}
                    className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      activeTab === 'align' 
                        ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60' 
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <Sliders size={13} /> Align
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('typography')}
                    className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      activeTab === 'typography' 
                        ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60' 
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <Type size={13} /> Typography
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('image')}
                    className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      activeTab === 'image' 
                        ? 'bg-white text-slate-900 shadow-sm border border-slate-200/60' 
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <ImageIcon size={13} /> Image Edit
                  </button>
                </div>

                {/* TAB 1: Position & Alignment Controls */}
                {activeTab === 'align' && (
                  <div className="space-y-5 animate-fadeIn">
                    {/* Milestone Years Selector */}
                    <div>
                      <label className="block text-xs font-extrabold text-slate-800 mb-2">
                        Milestone Years Completed
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {Array.from(new Set([1, 2, 3, 5, 7, 10, years])).sort((a, b) => a - b).map((yr) => (
                          <button
                            key={yr}
                            onClick={() => setYears(yr)}
                            className={`py-2 px-3.5 text-xs font-extrabold rounded-xl border transition-all ${
                              years === yr
                                ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                                : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                            }`}
                          >
                            {yr} {yr === 1 ? "Year" : "Years"}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Testimonial Input */}
                    <div>
                      <label className="block text-xs font-extrabold text-slate-800 mb-1.5">
                        Testimonial / Recognition Quote
                      </label>
                      <textarea
                        value={testimonial}
                        onChange={(e) => setTestimonial(e.target.value)}
                        rows={3}
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all font-medium resize-none"
                        placeholder="Enter testimonial text..."
                      />
                    </div>

                    {/* Photo Position & Alignment */}
                    <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                          <Sliders size={14} className="text-emerald-600" /> Photo Alignment
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setX(0);
                            setY(148);
                            setScale(1.0);
                          }}
                          className="text-[10px] font-extrabold text-emerald-700 hover:text-emerald-800 bg-white hover:bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200/80 transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
                        >
                          <RotateCcw size={11} /> Reset
                        </button>
                      </div>

                      <div>
                        <div className="flex justify-between text-xs text-slate-600 mb-1 font-semibold">
                          <label>Scale (Zoom)</label>
                          <span className="font-mono text-[11px] bg-white px-2 py-0.5 rounded-md border border-slate-200 text-slate-900">{scale.toFixed(2)}x</span>
                        </div>
                        <input
                          type="range"
                          min="0.1"
                          max="3"
                          step="0.01"
                          value={scale}
                          onChange={(e) => setScale(parseFloat(e.target.value))}
                          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="flex justify-between text-xs text-slate-600 mb-1 font-semibold">
                            <label>Pos X</label>
                            <span className="font-mono text-[11px] bg-white px-1.5 py-0.5 rounded-md border border-slate-200 text-slate-900">{x}px</span>
                          </div>
                          <input
                            type="range"
                            min="-800"
                            max="800"
                            value={x}
                            onChange={(e) => setX(parseInt(e.target.value))}
                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                          />
                        </div>

                        <div>
                          <div className="flex justify-between text-xs text-slate-600 mb-1 font-semibold">
                            <label>Pos Y</label>
                            <span className="font-mono text-[11px] bg-white px-1.5 py-0.5 rounded-md border border-slate-200 text-slate-900">{y}px</span>
                          </div>
                          <input
                            type="range"
                            min="-800"
                            max="1920"
                            value={y}
                            onChange={(e) => setY(parseInt(e.target.value))}
                            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: Typography Panel */}
                {activeTab === 'typography' && (
                  <div className="animate-fadeIn">
                    <TypographyPanel
                      settings={typography}
                      onChange={(newSettings) => setTypography(newSettings)}
                      onReset={() => setTypography(defaultTypographySettings)}
                    />
                  </div>
                )}

                {/* TAB 3: Image Edit Panel */}
                {activeTab === 'image' && (
                  <div className="animate-fadeIn">
                    <ImageEditPanel
                      photoUrl={`/assets/templates/Id%20Card%20Employee%20Images/${encodeURIComponent(selectedEmployee.photoFileName)}`}
                      adjustments={imageAdjustments}
                      onChange={(newAdjustments) => setImageAdjustments(newAdjustments)}
                      onReset={() => setImageAdjustments(defaultImageAdjustments)}
                    />
                  </div>
                )}

              </div>
            ) : (
              <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm text-center">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto mb-3">
                  <Trophy size={24} />
                </div>
                <h3 className="text-base font-extrabold text-slate-900 mb-1">Select an Employee</h3>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">Click on any employee from the queue above to customize their work anniversary video.</p>
              </div>
            )}
          </div>

          {/* ZONE 2: CENTERED Stage Preview (Card 1 & Card 2 Live Preview -> Video Player when Rendered) */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center">
            <div className="w-full bg-[#0B0F19] rounded-3xl p-6 border border-slate-800 shadow-2xl overflow-hidden relative flex flex-col items-center justify-center min-h-[640px]">
              
              {/* Studio Header Bar & Segmented Stage Controls */}
              <div className="w-full flex items-center justify-between mb-4 pb-3 border-b border-slate-800/80 z-10 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    {activeStageMode === 'video' ? "Rendered Video Stage" : "Card 1 & Card 2 Live Stage"}
                  </span>
                </div>

                {/* Stage Mode & Card Selection Segmented Tabs */}
                <div className="flex items-center gap-2">
                  {renderedVideoUrl && (
                    <div className="flex bg-slate-900 p-0.5 rounded-xl border border-slate-800 text-[10px] font-extrabold">
                      <button
                        onClick={() => setActiveStageMode('video')}
                        className={`px-2.5 py-1 rounded-lg transition-all ${activeStageMode === 'video' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                      >
                        📹 Video
                      </button>
                      <button
                        onClick={() => setActiveStageMode('cards')}
                        className={`px-2.5 py-1 rounded-lg transition-all ${activeStageMode === 'cards' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                      >
                        🖼️ Cards
                      </button>
                    </div>
                  )}

                  {activeStageMode === 'cards' && (
                    <div className="flex bg-slate-900 p-0.5 rounded-xl border border-slate-800 text-[10px] font-extrabold">
                      <button
                        onClick={() => setCardPreviewTab('both')}
                        className={`px-2.5 py-1 rounded-lg transition-all ${cardPreviewTab === 'both' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                      >
                        Both
                      </button>
                      <button
                        onClick={() => setCardPreviewTab('card1')}
                        className={`px-2.5 py-1 rounded-lg transition-all ${cardPreviewTab === 'card1' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                      >
                        Card 1
                      </button>
                      <button
                        onClick={() => setCardPreviewTab('card2')}
                        className={`px-2.5 py-1 rounded-lg transition-all ${cardPreviewTab === 'card2' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                      >
                        Card 2
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Stage Canvas - EXACT CENTER */}
              <div className="flex-1 w-full flex items-center justify-center py-2 z-10">
                {selectedEmployee ? (
                  activeStageMode === 'video' && renderedVideoUrl ? (
                    /* Rendered Video Player Mode */
                    <div className="flex flex-col items-center justify-center space-y-4 w-full animate-fadeIn">
                      <div className="relative group flex justify-center w-full">
                        <video
                          src={renderedVideoUrl}
                          controls
                          autoPlay
                          className="max-h-[480px] rounded-2xl border border-slate-700 shadow-2xl overflow-hidden"
                        />
                        <span className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur px-2.5 py-1 rounded-full text-[10px] font-bold text-white uppercase tracking-wider border border-slate-700">
                          AE Rendered Video Output
                        </span>
                      </div>
                    </div>
                  ) : (
                    /* Card 1 & Card 2 Live Preview Mode */
                    <div className="flex items-center justify-center gap-4 flex-wrap animate-fadeIn w-full">
                      
                      {/* CARD 1 LIVE PREVIEW */}
                      {(cardPreviewTab === 'both' || cardPreviewTab === 'card1') && (
                        <div className="relative flex flex-col items-center">
                          {card1Url ? (
                            <img 
                              src={card1Url} 
                              alt="Card 1 Preview" 
                              className="max-h-[440px] rounded-2xl border border-slate-700 shadow-2xl" 
                            />
                          ) : (
                            /* Live SVG Backup Preview of Card 1 */
                            <div 
                              className="relative bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-700/80"
                              style={{ width: '250px', height: '335px' }}
                            >
                              <img src="/assets/templates/card1_bg.jpg" className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none" alt="Card 1 BG" />
                              <img 
                                src={`/assets/templates/Id%20Card%20Employee%20Images/${encodeURIComponent(selectedEmployee.photoFileName)}`}
                                style={{
                                  position: 'absolute',
                                  left: `${(x / 702) * 100}%`,
                                  top: `${(y / 940) * 100}%`,
                                  width: `${scale * 100}%`,
                                  transformOrigin: 'top left',
                                }}
                                className="z-10 object-contain pointer-events-none"
                                alt="Employee"
                                onError={(e) => (e.currentTarget.style.display = 'none')}
                              />
                              <div className="absolute top-4 left-4 z-20 pointer-events-none space-y-0.5">
                                <h3 className="font-extrabold text-slate-800 text-sm">{selectedEmployee.name}</h3>
                                <p className="text-[10px] text-slate-600 font-bold">{selectedEmployee.title}</p>
                              </div>
                            </div>
                          )}
                          <span className="mt-2 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest bg-slate-900 px-2.5 py-0.5 rounded-full border border-slate-800">
                            Card 1 (Intro & Photo)
                          </span>
                        </div>
                      )}

                      {/* CARD 2 LIVE PREVIEW */}
                      {(cardPreviewTab === 'both' || cardPreviewTab === 'card2') && (
                        <div className="relative flex flex-col items-center">
                          {card2Url ? (
                            <img 
                              src={card2Url} 
                              alt="Card 2 Preview" 
                              className="max-h-[440px] rounded-2xl border border-slate-700 shadow-2xl" 
                            />
                          ) : (
                            /* Live SVG Backup Preview of Card 2 */
                            <div 
                              className="relative bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-700/80 flex flex-col items-center justify-center p-4 text-center"
                              style={{ width: '250px', height: '335px' }}
                            >
                              <img src="/assets/templates/card2_bg.png" className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none" alt="Card 2 BG" />
                              <div className="relative z-10 space-y-3 p-2 bg-white/90 rounded-2xl border border-slate-200 backdrop-blur shadow-md max-w-[210px]">
                                <span className="inline-block bg-emerald-100 text-emerald-800 text-xs font-extrabold px-3 py-1 rounded-full border border-emerald-200">
                                  {years} {years === 1 ? "Year" : "Years"} Milestone
                                </span>
                                <p className="text-[10px] text-slate-700 font-medium leading-relaxed italic">
                                  "{testimonial}"
                                </p>
                              </div>
                            </div>
                          )}
                          <span className="mt-2 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest bg-slate-900 px-2.5 py-0.5 rounded-full border border-slate-800">
                            Card 2 (Milestone & Quote)
                          </span>
                        </div>
                      )}

                    </div>
                  )
                ) : (
                  <div className="text-center py-16">
                    <div className="w-16 h-16 rounded-full bg-slate-900 text-slate-500 flex items-center justify-center mx-auto mb-4 border border-slate-800">
                      <Trophy size={28} />
                    </div>
                    <p className="text-slate-400 text-xs font-semibold">Select an employee to view Card 1 & Card 2 live stage</p>
                  </div>
                )}
              </div>

              {/* Stage Footer */}
              <div className="w-full flex items-center justify-between text-[10px] text-slate-500 pt-3 border-t border-slate-800/80 z-10 font-mono">
                <span>Nexrender AE Engine</span>
                <span>Active Mode: {activeStageMode === 'video' ? 'AE Video Output' : 'Live Card 1 & 2'}</span>
              </div>
            </div>
          </div>

          {/* ZONE 3: Right Render Controls & Downloads (3 Cols) */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-5">
              <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Film size={16} className="text-emerald-600" /> AE Render Pipeline
              </h3>

              {/* Video Format Size Selector Segmented Control */}
              <div>
                <label className="block text-xs font-extrabold text-slate-800 mb-2">
                  Aspect Ratio / Format
                </label>
                <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-2xl border border-slate-200/60">
                  <button
                    type="button"
                    onClick={() => setTemplateType("story")}
                    className={`py-2 px-3 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 ${
                      templateType === "story"
                        ? "bg-white text-emerald-800 shadow-sm border border-slate-200"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    📱 Story
                  </button>
                  <button
                    type="button"
                    onClick={() => setTemplateType("post")}
                    className={`py-2 px-3 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1.5 ${
                      templateType === "post"
                        ? "bg-white text-emerald-800 shadow-sm border border-slate-200"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    🔳 Insta Post
                  </button>
                </div>
              </div>

              {/* Composition Name Input */}
              <div>
                <label className="block text-xs font-extrabold text-slate-800 mb-1.5">
                  AE Composition Name
                </label>
                <input
                  type="text"
                  value={compName}
                  onChange={(e) => setCompName(e.target.value)}
                  placeholder="e.g. Comp 1"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              {/* Trigger Render Button */}
              <button
                onClick={handleRender}
                disabled={rendering || !selectedEmployee}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-extrabold text-xs transition-all shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 uppercase tracking-wider disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {rendering ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    Rendering AE Video...
                  </>
                ) : (
                  <>
                    <PlayCircle size={16} />
                    Render Video via AE
                  </>
                )}
              </button>

              {renderMsg && (
                <p className={`text-xs font-semibold p-3 rounded-2xl break-all ${
                  renderSuccess ? "text-emerald-900 bg-emerald-50 border border-emerald-200" : "text-red-900 bg-red-50 border border-red-200"
                }`}>
                  {renderMsg}
                </p>
              )}

              {/* Downloads & GIF Conversion Options */}
              {renderedVideoUrl && (
                <div className="pt-4 border-t border-slate-100 space-y-3 animate-fadeIn">
                  <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 size={14} className="text-emerald-600" /> Export Downloads
                  </h4>

                  {/* MP4 Download Button */}
                  <a
                    href={renderedVideoUrl}
                    download={`${selectedEmployee?.name || "Employee"}_Anniversary.mp4`}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-xs transition-all shadow-sm flex items-center justify-center gap-2"
                  >
                    <Download size={14} />
                    Download MP4 Video
                  </a>

                  {/* GIF Download / Conversion */}
                  {renderedGifUrl ? (
                    <a
                      href={renderedGifUrl}
                      download={`${selectedEmployee?.name || "Employee"}_Anniversary.gif`}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs transition-all shadow-sm flex items-center justify-center gap-2"
                    >
                      <Download size={14} />
                      Download Animated GIF
                    </a>
                  ) : (
                    <button
                      onClick={handleGenerateGif}
                      disabled={generatingGif}
                      className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-extrabold text-xs transition-all flex items-center justify-center gap-2 border border-slate-200/80 disabled:opacity-50"
                    >
                      {generatingGif ? (
                        <>
                          <RefreshCw size={14} className="animate-spin" />
                          Converting to GIF...
                        </>
                      ) : (
                        <>
                          <Sparkles size={14} className="text-amber-500" />
                          Generate Animated GIF
                        </>
                      )}
                    </button>
                  )}

                  {gifMsg && <p className="text-[11px] font-bold text-emerald-700 text-center">{gifMsg}</p>}
                  {gifError && <p className="text-[11px] font-bold text-red-600 text-center">{gifError}</p>}
                </div>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
