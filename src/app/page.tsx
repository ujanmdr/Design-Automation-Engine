"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Sparkles, Download, RefreshCw, Sliders, User, Calendar, CheckCircle2, ArrowRight, Search, RotateCcw } from "lucide-react";

export default function Home() {
  const [upcoming, setUpcoming] = useState<any[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Customization states
  const [subtext, setSubtext] = useState("Wishing you a joyful day and a successful year ahead!");
  const [x, setX] = useState(160);
  const [y, setY] = useState(568);
  const [scale, setScale] = useState(1.15);
  
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/birthdays')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setUpcoming(data.upcoming);
          // Auto-select first employee if available
          if (data.upcoming.length > 0) {
            handleSelect(data.upcoming[0]);
          }
        }
      })
      .catch(err => console.error("Failed to load upcoming birthdays", err));
  }, []);

  const handleSelect = (emp: any) => {
    setSelectedEmployee(emp);
    setResultUrl(null);
    setX(emp.birthdayPhotoSettings?.x ?? 160);
    setY(emp.birthdayPhotoSettings?.y ?? 568);
    setScale(emp.birthdayPhotoSettings?.scale ?? 1.15);
  };

  const handleGenerate = async () => {
    if (!selectedEmployee) return;

    setLoading(true);
    try {
      const res = await fetch("/api/generate-post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId: selectedEmployee.id,
          subtext,
          x,
          y,
          scale
        }),
      });

      const data = await res.json();
      if (data.success) {
        setResultUrl(`${data.imageUrl}?t=${Date.now()}`); // cache-busting refresh
        
        setUpcoming(upcoming.map(emp => 
          emp.id === selectedEmployee.id 
            ? { ...emp, birthdayPhotoSettings: { x, y, scale } } 
            : emp
        ));
      } else {
        alert(data.error || "Failed to generate post");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FD] text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-30 apple-glass border-b border-slate-200/80 px-8 py-4">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#F47D30]/10 text-[#F47D30] flex items-center justify-center font-bold text-sm">
              🎂
            </div>
            <div>
              <h1 className="font-extrabold text-base tracking-tight text-slate-900">Birthday Post Studio</h1>
              <p className="text-[11px] text-slate-500 font-medium">Automated High-Resolution Story & Post Generator</p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold text-slate-600">
            <span className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-200/80">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Cron Daemon 9:00 AM Active
            </span>
            <div className="h-4 w-[1px] bg-slate-200" />
            <span className="font-mono text-slate-500 text-[11px] bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">1080 × 1920 PX</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-[1600px] mx-auto p-6 md:p-8 space-y-8">
        
        {/* ── Upcoming Birthdays Queue Carousel ─────────────────────────────────── */}
        {upcoming.length > 0 && (
          <section className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <div className="flex items-center gap-2.5">
                <Calendar size={18} className="text-[#F47D30]" />
                <div>
                  <h2 className="text-sm font-extrabold text-slate-900 tracking-tight">Upcoming Birthdays Queue</h2>
                  <p className="text-[11px] text-slate-500 font-medium">Select an employee to adjust position and generate post</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="relative w-64">
                  <input 
                    type="text" 
                    placeholder="Search birthday queue..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 focus:outline-none focus:border-[#F47D30] focus:ring-2 focus:ring-[#F47D30]/20 transition-all font-medium placeholder-slate-400"
                  />
                  <Search className="absolute left-3 top-2 text-slate-400" size={14} />
                </div>
                <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                  {upcoming.length} Events Pending
                </span>
              </div>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-2 pt-1 custom-scrollbar snap-x">
              {upcoming
                .filter(emp => 
                  emp.name.toLowerCase().includes(searchQuery.trim().toLowerCase()) ||
                  (emp.title && emp.title.toLowerCase().includes(searchQuery.trim().toLowerCase()))
                )
                .map((emp) => {
                const isSelected = selectedEmployee?.id === emp.id;
                const isToday = emp.daysUntil === 0;

                return (
                  <div 
                    key={emp.id} 
                    onClick={() => handleSelect(emp)}
                    className={`snap-start min-w-[200px] cursor-pointer rounded-2xl p-4 flex flex-col items-center text-center transition-all duration-200 select-none ${
                      isSelected 
                        ? "bg-[#F47D30]/5 border-2 border-[#F47D30] shadow-md scale-[1.02]" 
                        : "bg-slate-50/80 border border-slate-200/80 hover:border-[#F47D30]/40 hover:bg-white"
                    }`}
                  >
                    <div className={`w-16 h-16 rounded-full overflow-hidden mb-2.5 relative transition-all shadow-sm ${
                      isSelected ? "ring-2 ring-[#F47D30] ring-offset-2" : ""
                    }`}>
                      <img 
                        src={`/assets/templates/Birthday%20Post%20Employee%20Images/${encodeURIComponent(emp.photoFileName)}`} 
                        alt={emp.name} 
                        className="w-full h-full object-cover object-top" 
                        onError={(e) => (e.currentTarget.src = '/assets/templates/overlay.png')} 
                      />
                    </div>
                    
                    <h3 className="font-bold text-slate-900 text-xs leading-tight line-clamp-1 w-full">{emp.name}</h3>
                    <p className="text-[11px] text-slate-500 mb-2.5 font-medium">{emp.birthday}</p>
                    
                    {isToday ? (
                      <span className="bg-emerald-500 text-white text-[10px] font-extrabold px-3 py-0.5 rounded-full shadow-sm animate-bounce">
                        TODAY! 🎉
                      </span>
                    ) : (
                      <span className="bg-blue-50 text-blue-600 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-blue-200">
                        In {emp.daysUntil} {emp.daysUntil === 1 ? "day" : "days"}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ── Three-Zone Studio Grid ───────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ZONE 1: Left Controls Panel (4 Cols) */}
          <div className="lg:col-span-4 space-y-6">
            {selectedEmployee ? (
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-6">
                
                {/* Selected Employee Badge */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-100 border border-slate-200 shadow-sm">
                      <img 
                        src={`/assets/templates/Birthday%20Post%20Employee%20Images/${encodeURIComponent(selectedEmployee.photoFileName)}`} 
                        alt={selectedEmployee.name} 
                        className="w-full h-full object-cover object-top"
                        onError={(e) => (e.currentTarget.src = '/assets/templates/overlay.png')}
                      />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-slate-900">{selectedEmployee.name}</h3>
                      <p className="text-xs text-slate-500 font-medium">{selectedEmployee.title}</p>
                    </div>
                  </div>
                  <Link 
                    href="/employees" 
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100 transition-colors"
                  >
                    Edit ↗
                  </Link>
                </div>

                {/* Subtext Input */}
                <div>
                  <label className="block text-xs font-extrabold text-slate-800 mb-1.5">
                    Custom Greeting Subtext
                  </label>
                  <textarea
                    value={subtext}
                    onChange={(e) => { setSubtext(e.target.value); setResultUrl(null); }}
                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-3.5 text-xs text-slate-900 focus:outline-none focus:border-[#F47D30] focus:ring-2 focus:ring-[#F47D30]/20 transition-all font-medium resize-none"
                    rows={2}
                    required
                  />
                </div>

                {/* Photo Alignment & Scale Sliders */}
                <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                      <Sliders size={14} className="text-[#F47D30]" /> Photo Alignment
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setX(160);
                        setY(568);
                        setScale(1.15);
                        setResultUrl(null);
                      }}
                      className="text-[10px] font-extrabold text-[#F47D30] hover:text-[#E06820] bg-white hover:bg-[#F47D30]/5 px-2.5 py-1 rounded-lg border border-[#F47D30]/20 transition-all cursor-pointer flex items-center gap-1 shadow-2xs"
                    >
                      <RotateCcw size={11} /> Set as Default
                    </button>
                  </div>

                  {/* Zoom */}
                  <div>
                    <div className="flex justify-between text-xs text-slate-600 mb-1.5 font-semibold">
                      <label>Scale (Zoom)</label>
                      <span className="font-mono text-[11px] bg-white px-2 py-0.5 rounded-md border border-slate-200 text-slate-900">{scale.toFixed(2)}x</span>
                    </div>
                    <input
                      type="range"
                      min="0.1"
                      max="3"
                      step="0.01"
                      value={scale}
                      onChange={(e) => { setScale(parseFloat(e.target.value)); setResultUrl(null); }}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#F47D30]"
                    />
                  </div>

                  {/* Position X & Y */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="flex justify-between text-xs text-slate-600 mb-1.5 font-semibold">
                        <label>Pos X</label>
                        <span className="font-mono text-[11px] bg-white px-1.5 py-0.5 rounded-md border border-slate-200 text-slate-900">{x}px</span>
                      </div>
                      <input
                        type="range"
                        min="-800"
                        max="1080"
                        value={x}
                        onChange={(e) => { setX(parseInt(e.target.value)); setResultUrl(null); }}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#F47D30]"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs text-slate-600 mb-1.5 font-semibold">
                        <label>Pos Y</label>
                        <span className="font-mono text-[11px] bg-white px-1.5 py-0.5 rounded-md border border-slate-200 text-slate-900">{y}px</span>
                      </div>
                      <input
                        type="range"
                        min="-800"
                        max="1920"
                        value={y}
                        onChange={(e) => { setY(parseInt(e.target.value)); setResultUrl(null); }}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#F47D30]"
                      />
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <button
                  onClick={handleGenerate}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-[#F47D30] to-[#E06820] text-white font-extrabold py-3.5 px-4 rounded-2xl shadow-lg shadow-[#F47D30]/25 hover:shadow-xl hover:shadow-[#F47D30]/35 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-xs uppercase tracking-wider cursor-pointer"
                >
                  {loading ? (
                    <>
                      <RefreshCw size={16} className="animate-spin" />
                      Rendering HD Post...
                    </>
                  ) : (
                    <>
                      <Sparkles size={16} />
                      Save Position & Generate HD Post
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm text-center">
                <div className="w-14 h-14 rounded-2xl bg-[#F47D30]/10 text-[#F47D30] flex items-center justify-center mx-auto mb-3">
                  <User size={24} />
                </div>
                <h3 className="text-base font-extrabold text-slate-900 mb-1">Select an Employee</h3>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">Click on any employee from the queue above to preview and adjust their birthday post.</p>
              </div>
            )}
          </div>

          {/* ZONE 2: CENTERED Preview Canvas Stage (5 Cols - Strictly Centered) */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center">
            <div className="w-full bg-[#0B0F19] rounded-3xl p-6 border border-slate-800 shadow-2xl overflow-hidden relative flex flex-col items-center justify-center min-h-[640px]">
              
              {/* Studio Header Bar */}
              <div className="w-full flex items-center justify-between mb-4 pb-3 border-b border-slate-800/80 z-10">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Centered Live Stage</span>
                </div>
                <span className="text-[10px] text-slate-400 font-mono bg-slate-900 px-2 py-0.5 rounded border border-slate-800">1080 × 1920 PX</span>
              </div>

              {/* Stage Canvas - EXACT CENTER */}
              <div className="flex-1 w-full flex items-center justify-center py-2 z-10">
                {selectedEmployee ? (
                  resultUrl ? (
                    /* Rendered Output */
                    <div className="flex flex-col items-center justify-center space-y-4 w-full animate-fadeIn">
                      <div className="relative group flex justify-center">
                        <img 
                          src={resultUrl} 
                          alt="Generated Post" 
                          className="max-h-[500px] rounded-2xl border border-slate-700 shadow-2xl transform transition-transform group-hover:scale-[1.01]" 
                        />
                        <span className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur px-2.5 py-1 rounded-full text-[10px] font-bold text-white uppercase tracking-wider border border-slate-700">
                          HD Rendered Output
                        </span>
                      </div>
                    </div>
                  ) : (
                    /* Live SVG Preview Mockup Shell */
                    <div 
                      className="relative bg-black overflow-hidden border-2 border-slate-700/80 rounded-2xl shadow-2xl transition-all duration-300"
                      style={{ width: '270px', height: '480px' }} // Scaled 1080x1920 ratio
                    >
                      <div className="absolute inset-0 w-full h-full">
                        {/* Background */}
                        <img src="/assets/templates/background.png" className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none" alt="Background" />
                        
                        {/* Scaled Photo */}
                        <img 
                          src={`/assets/templates/Birthday%20Post%20Employee%20Images/${encodeURIComponent(selectedEmployee.photoFileName)}`}
                          style={{
                            position: 'absolute',
                            left: `${(x / 1080) * 100}%`,
                            top: `${(y / 1920) * 100}%`,
                            width: `${(800 / 1080) * 100 * scale}%`,
                            transformOrigin: 'top left',
                          }}
                          className="z-10 object-contain pointer-events-none"
                          alt="Employee"
                          onError={(e) => (e.currentTarget.style.display = 'none')}
                        />

                        {/* Foreground Overlay */}
                        <img src="/assets/templates/overlay.png" className="absolute bottom-0 left-0 w-full z-20 pointer-events-none" alt="Overlay" />
                        
                        {/* Text Mask Box */}
                        <div className="absolute bg-white z-30 pointer-events-none" style={{
                          left: 0,
                          top: `${(1560 / 1920) * 100}%`,
                          width: '100%',
                          height: '15%'
                        }} />

                        {/* Subtext */}
                        <div className="absolute z-30 flex pointer-events-none" style={{
                          left: `${(99 / 1080) * 100}%`,
                          top: `${(452 / 1920) * 100}%`,
                          width: `${(700 / 1080) * 100}%`
                        }}>
                          <span style={{ 
                            fontFamily: "'Plus Jakarta Sans', sans-serif", 
                            fontWeight: 600, 
                            fontSize: '9.5px', 
                            color: '#373737', 
                            letterSpacing: '-0.04em',
                            lineHeight: 1.3
                          }}>
                            {subtext}
                          </span>
                        </div>

                        {/* Name & Title */}
                        <div className="absolute z-40 flex flex-col pointer-events-none" style={{
                          left: `${(80 / 1080) * 100}%`,
                          top: `${(1570 / 1920) * 100}%`,
                        }}>
                          <span style={{ 
                            fontFamily: "'Plus Jakarta Sans', sans-serif", 
                            fontWeight: 'bold', 
                            fontSize: '15px', 
                            color: '#373737', 
                            letterSpacing: '-0.04em',
                            lineHeight: 1.1
                          }}>
                            {selectedEmployee.name}
                          </span>
                          
                          <span style={{ 
                            fontFamily: "'Plus Jakarta Sans', sans-serif", 
                            fontWeight: 500, 
                            fontSize: '10px', 
                            color: '#373737', 
                            letterSpacing: '-0.02em',
                            marginTop: '2px'
                          }}>
                            {selectedEmployee.title}
                          </span>
                        </div>
                      </div>
                    </div>
                  )
                ) : (
                  <div className="text-center py-16">
                    <div className="w-16 h-16 rounded-full bg-slate-900 text-slate-500 flex items-center justify-center mx-auto mb-4 border border-slate-800">
                      <Sparkles size={28} />
                    </div>
                    <p className="text-slate-400 text-xs font-semibold">Select an employee from above to view stage preview</p>
                  </div>
                )}
              </div>

              {/* Stage Footer */}
              <div className="w-full flex items-center justify-between text-[10px] text-slate-500 pt-3 border-t border-slate-800/80 z-10 font-mono">
                <span>Sharp Engine v2.0</span>
                <span>Auto-Cron 9:00 AM</span>
              </div>
            </div>
          </div>

          {/* ZONE 3: Right Action & Download Panel (3 Cols) */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
              <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-500" /> Actions & Downloads
              </h3>

              {resultUrl ? (
                <div className="space-y-3 animate-fadeIn">
                  <a
                    href={resultUrl}
                    download={`${selectedEmployee?.name || "Employee"} birthday post.png`}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold text-xs transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2"
                  >
                    <Download size={16} />
                    Download HD Post Image
                  </a>

                  <button
                    onClick={() => setResultUrl(null)}
                    className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-semibold text-xs transition-all flex items-center justify-center gap-2"
                  >
                    <RefreshCw size={14} />
                    Adjust Position Again
                  </button>
                </div>
              ) : (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60 text-center space-y-2">
                  <p className="text-xs font-bold text-slate-700">Ready to Render</p>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Adjust photo alignment on the left, then click <b>Save Position & Generate</b> to produce the high-res PNG file.
                  </p>
                </div>
              )}

              {/* Specs Box */}
              <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-2 font-mono text-[11px]">
                <div className="flex justify-between text-slate-400">
                  <span>Format:</span>
                  <span className="text-white font-bold">PNG (HD)</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Resolution:</span>
                  <span className="text-white font-bold">1080 × 1920</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Status:</span>
                  <span className="text-emerald-400 font-bold">Ready</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
