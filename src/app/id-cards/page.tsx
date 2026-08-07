"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { jsPDF } from "jspdf";
import QRCode from "qrcode";
import { IdCard, Sparkles, Download, RefreshCw, Sliders, Search, CheckCircle2, User, FileText, RotateCcw, Type, Image as ImageIcon } from "lucide-react";
import TypographyPanel, { TypographySettings, defaultTypographySettings } from "@/components/TypographyPanel";
import ImageEditPanel, { ImageAdjustments, defaultImageAdjustments, getCssFilterString } from "@/components/ImageEditPanel";

export default function IdCardsPage() {
  const [employees, setEmployees] = useState<any[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  
  // Customization states
  const [activeTab, setActiveTab] = useState<'align' | 'typography' | 'image'>('align');
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);
  const [scale, setScale] = useState(1.0);
  const [customTitle, setCustomTitle] = useState("Engineering");
  const [searchQuery, setSearchQuery] = useState("");

  const [typography, setTypography] = useState<TypographySettings>(defaultTypographySettings);
  const [imageAdjustments, setImageAdjustments] = useState<ImageAdjustments>(defaultImageAdjustments);
  
  // Backside states
  const [includeBackside, setIncludeBackside] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState("https://www.gritfeat.com");
  const [website, setWebsite] = useState("www.gritfeat.com");
  const [email, setEmail] = useState("contact@gritfeat.com");
  const [phone, setPhone] = useState("+977-01-5900445");
  const [address, setAddress] = useState("Ekantakuna-13, Laitpur");
  const [backResultUrl, setBackResultUrl] = useState<string | null>(null);

  // Live preview tab state: 'side' | 'front' | 'back'
  const [previewTab, setPreviewTab] = useState<'side' | 'front' | 'back'>('side');

  const [liveQrDataUrl, setLiveQrDataUrl] = useState<string>("");
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (qrCodeUrl) {
      QRCode.toDataURL(qrCodeUrl, { width: 350, margin: 2, color: { dark: '#000000', light: '#ffffff' } })
        .then(url => setLiveQrDataUrl(url))
        .catch(console.error);
    }
  }, [qrCodeUrl]);

  useEffect(() => {
    fetch('/api/employees')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const sorted = data.employees.sort((a: any, b: any) => a.name.localeCompare(b.name));
          setEmployees(sorted);
          if (sorted.length > 0) {
            handleSelect(sorted[0]);
          }
        }
      })
      .catch(err => console.error("Failed to load employees", err));
  }, []);

  const handleSelect = (emp: any) => {
    setSelectedEmployee(emp);
    setResultUrl(null);
    setX(emp.idCardPhotoSettings?.x ?? 0);
    setY(emp.idCardPhotoSettings?.y ?? 0);
    setScale(emp.idCardPhotoSettings?.scale ?? 1.0);
    setCustomTitle("Engineering");
    setBackResultUrl(null);
  };

  // Auto-render live preview whenever parameters change (350ms debounce)
  useEffect(() => {
    if (!selectedEmployee) return;
    const timer = setTimeout(() => {
      handleGenerate();
    }, 350);
    return () => clearTimeout(timer);
  }, [selectedEmployee?.id, x, y, scale, customTitle, includeBackside, qrCodeUrl, website, email, phone, address]);

  const filteredEmployees = employees.filter(emp => emp.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleGenerate = async () => {
    if (!selectedEmployee) return;

    setLoading(true);
    try {
      const res = await fetch("/api/generate-id", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeId: selectedEmployee.id,
          x,
          y,
          scale,
          customTitle,
          includeBackside,
          qrCodeUrl,
          website,
          email,
          phone,
          address,
          typographySettings: typography,
          imageAdjustments
        }),
      });

      const data = await res.json();
      if (data.success) {
        setResultUrl(`${data.imageUrl}?t=${Date.now()}`);
        if (data.backUrl) {
          setBackResultUrl(`${data.backUrl}?t=${Date.now()}`);
        } else {
          setBackResultUrl(null);
        }
        
        setEmployees(employees.map(emp => 
          emp.id === selectedEmployee.id 
            ? { ...emp, idCardPhotoSettings: { x, y, scale } } 
            : emp
        ));
      } else {
        alert(data.error || "Failed to generate ID card");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred");
    }
    setLoading(false);
  };

  const handleDownloadPdf = () => {
    if (!resultUrl) return;
    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: [54, 86]
    });
    pdf.addImage(resultUrl, "PNG", 0, 0, 54, 86);
    
    if (includeBackside && backResultUrl) {
      pdf.addPage([54, 86], "portrait");
      pdf.addImage(backResultUrl, "PNG", 0, 0, 54, 86);
    }
    
    pdf.save(`${selectedEmployee.name} ID Card.pdf`);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FD] text-slate-900 font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-30 apple-glass border-b border-slate-200/80 px-8 py-4">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-600 flex items-center justify-center font-bold text-sm">
              🪪
            </div>
            <div>
              <h1 className="font-extrabold text-base tracking-tight text-slate-900">ID Card Studio</h1>
              <p className="text-[11px] text-slate-500 font-medium">300 DPI High-Res PVC Card Generator</p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold text-slate-600">
            <span className="flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-200/80">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              CR80 Standard (54 × 86 mm)
            </span>
            <div className="h-4 w-[1px] bg-slate-200" />
            <Link href="/employees" className="font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100 transition-colors">
              Manage Employees ↗
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto p-6 md:p-8 space-y-8">
        
        {/* ── Employee Directory Carousel ──────────────────────────────────────── */}
        <section className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-extrabold text-slate-900 tracking-tight">Employee Directory</h2>
              <p className="text-[11px] text-slate-500 font-medium">Select an employee to generate high-resolution PVC ID cards</p>
            </div>
            <div className="relative w-64">
              <input 
                type="text" 
                placeholder="Search team..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 focus:outline-none focus:border-[#F47D30] focus:ring-2 focus:ring-[#F47D30]/20 transition-all font-medium placeholder-slate-400"
              />
              <Search className="absolute left-3 top-2 text-slate-400" size={14} />
            </div>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-2 pt-1 custom-scrollbar snap-x">
            {filteredEmployees.map((emp) => {
              const isSelected = selectedEmployee?.id === emp.id;
              return (
                <div 
                  key={emp.id} 
                  onClick={() => handleSelect(emp)}
                  className={`snap-start min-w-[130px] max-w-[130px] cursor-pointer rounded-2xl p-3 flex flex-col items-center text-center transition-all duration-200 select-none ${
                    isSelected 
                      ? "bg-[#F47D30]/5 border-2 border-[#F47D30] shadow-md scale-[1.03]" 
                      : "bg-slate-50/80 border border-slate-200/80 hover:border-[#F47D30]/40 hover:bg-white"
                  }`}
                >
                  <div className={`w-14 h-14 rounded-full overflow-hidden mb-2 relative transition-all shadow-sm ${
                    isSelected ? "ring-2 ring-[#F47D30] ring-offset-2" : ""
                  }`}>
                    <img 
                      src={`/assets/templates/Birthday Post Employee Images/${emp.photoFileName}`} 
                      alt={emp.name} 
                      className="w-full h-full object-cover" 
                      onError={(e) => (e.currentTarget.src = '/assets/templates/overlay.png')} 
                    />
                  </div>
                  <h3 className="font-extrabold text-slate-900 text-xs leading-tight line-clamp-1 w-full">{emp.name}</h3>
                  <span className="text-[10px] text-slate-500 font-medium mt-0.5 line-clamp-1 w-full">{emp.title || "Team Member"}</span>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── Three-Zone Studio Grid ───────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* ZONE 1: Left Customization Controls (4 Cols) */}
          <div className="lg:col-span-4 space-y-6">
            {selectedEmployee ? (
              <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-6">
                
                {/* Employee Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-100 border border-slate-200 shadow-sm">
                      <img 
                        src={`/assets/templates/Birthday Post Employee Images/${selectedEmployee.photoFileName}`} 
                        alt={selectedEmployee.name} 
                        className="w-full h-full object-cover"
                        onError={(e) => (e.currentTarget.src = '/assets/templates/overlay.png')}
                      />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-sm text-slate-900">{selectedEmployee.name}</h3>
                      <p className="text-xs text-slate-500 font-medium">{selectedEmployee.email || "No email"}</p>
                    </div>
                  </div>
                  <Link 
                    href="/employees" 
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100 transition-colors"
                  >
                    Edit Info ↗
                  </Link>
                </div>

                {/* Front Side Section */}
                <div className="space-y-4">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400">Card Front Customization</span>
                  
                  {/* Designation */}
                  <div>
                    <label className="block text-xs font-extrabold text-slate-800 mb-1.5">Designation Title</label>
                    <input
                      type="text"
                      value={customTitle}
                      onChange={(e) => { setCustomTitle(e.target.value); setResultUrl(null); }}
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#F47D30] focus:ring-2 focus:ring-[#F47D30]/20 transition-all font-medium"
                    />
                  </div>

                  {/* Photo Scaling & Adjustments */}
                  <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                        <Sliders size={14} className="text-[#F47D30]" /> Photo Adjustments
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setX(0);
                          setY(0);
                          setScale(1.0);
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
                </div>

                {/* Backside Section & Toggle */}
                <div className="pt-4 border-t border-slate-100 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-extrabold text-slate-900 block">Include Card Backside</span>
                      <span className="text-[11px] text-slate-500 font-medium">Dynamic QR code & contact details</span>
                    </div>

                    {/* iOS-style toggle switch */}
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={includeBackside}
                        onChange={(e) => { setIncludeBackside(e.target.checked); setResultUrl(null); setBackResultUrl(null); }}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                    </label>
                  </div>

                  {/* Collapsible Backside Form */}
                  {includeBackside && (
                    <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-3 transition-all animate-fadeIn">
                      <div>
                        <label className="block text-[11px] font-extrabold text-slate-700 mb-1">QR Code Destination URL</label>
                        <input
                          type="text"
                          value={qrCodeUrl}
                          onChange={(e) => { setQrCodeUrl(e.target.value); setResultUrl(null); setBackResultUrl(null); }}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-900 focus:outline-none focus:border-[#F47D30] font-mono"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Website</label>
                          <input
                            type="text"
                            value={website}
                            onChange={(e) => { setWebsite(e.target.value); setResultUrl(null); setBackResultUrl(null); }}
                            className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1 text-xs text-slate-900"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Email</label>
                          <input
                            type="text"
                            value={email}
                            onChange={(e) => { setEmail(e.target.value); setResultUrl(null); setBackResultUrl(null); }}
                            className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1 text-xs text-slate-900"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Phone</label>
                          <input
                            type="text"
                            value={phone}
                            onChange={(e) => { setPhone(e.target.value); setResultUrl(null); setBackResultUrl(null); }}
                            className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1 text-xs text-slate-900"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Address</label>
                          <input
                            type="text"
                            value={address}
                            onChange={(e) => { setAddress(e.target.value); setResultUrl(null); setBackResultUrl(null); }}
                            className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1 text-xs text-slate-900"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

              </div>
            ) : (
              <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm text-center">
                <div className="w-14 h-14 rounded-2xl bg-orange-500/10 text-orange-600 flex items-center justify-center mx-auto mb-3">
                  <User size={24} />
                </div>
                <h3 className="text-base font-extrabold text-slate-900 mb-1">Select an Employee</h3>
                <p className="text-xs text-slate-500 max-w-xs mx-auto">Click on any employee from the directory above to preview and generate their ID card.</p>
              </div>
            )}
          </div>

          {/* ZONE 2: CENTERED ID Card Live Preview Stage (5 Cols - Strictly Centered) */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center">
            <div className="w-full bg-[#0B0F19] rounded-3xl p-6 border border-slate-800 shadow-2xl overflow-hidden relative flex flex-col items-center justify-center min-h-[640px]">
              
              {/* Studio Header & Segmented Preview Control */}
              <div className="w-full flex items-center justify-between mb-4 pb-3 border-b border-slate-800/80 z-10">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Centered ID Stage</span>
                </div>

                {/* Segmented View Tabs */}
                <div className="flex bg-slate-900 p-0.5 rounded-xl border border-slate-800 text-[10px] font-extrabold">
                  {includeBackside && (
                    <button
                      onClick={() => setPreviewTab('side')}
                      className={`px-2.5 py-1 rounded-lg transition-all ${previewTab === 'side' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                    >
                      Both Sides
                    </button>
                  )}
                  <button
                    onClick={() => setPreviewTab('front')}
                    className={`px-2.5 py-1 rounded-lg transition-all ${previewTab === 'front' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                  >
                    Front
                  </button>
                  {includeBackside && (
                    <button
                      onClick={() => setPreviewTab('back')}
                      className={`px-2.5 py-1 rounded-lg transition-all ${previewTab === 'back' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'}`}
                    >
                      Back
                    </button>
                  )}
                </div>
              </div>

              {/* Stage Canvas / Live Preview - EXACT CENTER */}
              <div className="flex-1 w-full flex items-center justify-center py-2 z-10">
                {selectedEmployee ? (
                  resultUrl ? (
                    /* Rendered HD Output Images */
                    <div className="flex flex-col items-center justify-center space-y-4 w-full animate-fadeIn">
                      <div className="flex items-center justify-center gap-4 flex-wrap">
                        {(previewTab === 'side' || previewTab === 'front') && (
                          <div className="relative group">
                            <img
                              src={resultUrl}
                              alt="Generated ID Card Front"
                              className="max-h-[460px] rounded-2xl border border-slate-700 shadow-2xl"
                            />
                            <span className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur px-2 py-0.5 rounded-full text-[9px] font-bold text-white uppercase tracking-wider border border-slate-700">
                              Front Output
                            </span>
                          </div>
                        )}

                        {includeBackside && backResultUrl && (previewTab === 'side' || previewTab === 'back') && (
                          <div className="relative group">
                            <img
                              src={backResultUrl}
                              alt="Generated ID Card Back"
                              className="max-h-[460px] rounded-2xl border border-slate-700 shadow-2xl"
                            />
                            <span className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur px-2 py-0.5 rounded-full text-[9px] font-bold text-white uppercase tracking-wider border border-slate-700">
                              Back Output
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    /* Live SVG Preview Card Mockups - 1:1 Match with Print Output Template */
                    <div className="flex items-center justify-center gap-4 flex-wrap">
                      {/* FRONT CARD PREVIEW (Matches generateIdCard in image-engine.ts 1:1) */}
                      {(previewTab === 'side' || previewTab === 'front') && (
                        <div 
                          className="relative bg-white rounded-2xl overflow-hidden shadow-2xl border border-slate-700/80 flex flex-col justify-between"
                          style={{ width: '235px', height: '374px' }} // 638 x 1016 CR80 Ratio
                        >
                          <div className="absolute inset-0 w-full h-full">
                            {/* Scaled Photo */}
                            <img 
                              src={`/assets/templates/Id%20Card%20Employee%20Images/${encodeURIComponent(selectedEmployee.photoFileName)}`}
                              style={{
                                position: 'absolute',
                                left: `${(x / 638) * 100}%`,
                                top: `${(y / 1016) * 100}%`,
                                width: `${scale * 100}%`,
                                transformOrigin: 'top left',
                              }}
                              className="z-10 object-contain pointer-events-none"
                              alt="Employee"
                              onError={(e) => (e.currentTarget.style.display = 'none')}
                            />

                            {/* #71cc44 Green Line Separator */}
                            <div 
                              className="absolute z-20 pointer-events-none"
                              style={{
                                left: 0,
                                top: `${(728 / 1016) * 100}%`,
                                width: '100%',
                                height: `${(15 / 1016) * 100}%`,
                                backgroundColor: '#71cc44'
                              }}
                            />

                            {/* White Footer Background */}
                            <div 
                              className="absolute bg-white z-20 pointer-events-none"
                              style={{
                                left: 0,
                                top: `${(743 / 1016) * 100}%`,
                                width: '100%',
                                height: `${(273 / 1016) * 100}%`
                              }}
                            />

                            {/* Gritfeat Logo (Top Right of Footer) */}
                            <img 
                              src="/assets/templates/gritfeat_logo.png" 
                              className="absolute z-30 pointer-events-none object-contain"
                              style={{
                                left: `${(475 / 638) * 100}%`,
                                top: `${(765 / 1016) * 100}%`,
                                width: `${(125 / 638) * 100}%`
                              }}
                              alt="Logo"
                            />

                            {/* Email Icon */}
                            <img 
                              src="/assets/templates/email_icon.png" 
                              className="absolute z-30 pointer-events-none object-contain"
                              style={{
                                left: `${(36 / 638) * 100}%`,
                                top: `${(948 / 1016) * 100}%`,
                                width: `${(32 / 638) * 100}%`
                              }}
                              alt="Email Icon"
                            />

                            {/* Employee Name (First & Last Name) */}
                            <div 
                              className="absolute z-30 flex flex-col pointer-events-none leading-none"
                              style={{
                                left: `${(36 / 638) * 100}%`,
                                top: `${(770 / 1016) * 100}%`,
                              }}
                            >
                              <span style={{ 
                                fontFamily: "'Plus Jakarta Sans', sans-serif", 
                                fontWeight: 800, 
                                fontSize: '18px', 
                                color: '#121212',
                                letterSpacing: '0'
                              }}>
                                {selectedEmployee.name.split(' ')[0]}
                              </span>
                              {selectedEmployee.name.split(' ').length > 1 && (
                                <span style={{ 
                                  fontFamily: "'Plus Jakarta Sans', sans-serif", 
                                  fontWeight: 800, 
                                  fontSize: '18px', 
                                  color: '#121212',
                                  marginTop: '2px',
                                  letterSpacing: '0'
                                }}>
                                  {selectedEmployee.name.split(' ').slice(1).join(' ')}
                                </span>
                              )}
                            </div>

                            {/* Designation Title (Green #71cc44) */}
                            <div 
                              className="absolute z-30 flex pointer-events-none"
                              style={{
                                left: `${(36 / 638) * 100}%`,
                                top: selectedEmployee.name.split(' ').length > 1 ? `${(885 / 1016) * 100}%` : `${(830 / 1016) * 100}%`,
                              }}
                            >
                              <span style={{ 
                                fontFamily: "'Plus Jakarta Sans', sans-serif", 
                                fontWeight: 700, 
                                fontSize: '11px', 
                                color: '#71cc44',
                                letterSpacing: '0'
                              }}>
                                {customTitle || "Engineering"}
                              </span>
                            </div>

                            {/* Email Text */}
                            <div 
                              className="absolute z-30 flex pointer-events-none"
                              style={{
                                left: `${(76 / 638) * 100}%`,
                                top: `${(952 / 1016) * 100}%`,
                              }}
                            >
                              <span style={{ 
                                fontFamily: "'Plus Jakarta Sans', sans-serif", 
                                fontWeight: 500, 
                                fontSize: '9px', 
                                color: '#121212',
                                letterSpacing: '0'
                              }}>
                                {(selectedEmployee.email || email).toLowerCase()}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* BACK CARD PREVIEW (Matches generateIdCardBackside in image-engine.ts 1:1) */}
                      {includeBackside && (previewTab === 'side' || previewTab === 'back') && (
                        <div 
                          className="relative bg-white rounded-2xl overflow-hidden shadow-2xl border border-slate-700/80 p-3.5 flex flex-col justify-between"
                          style={{ width: '235px', height: '374px' }}
                        >
                          <img 
                            src="/assets/templates/card2_bg.png" 
                            className="absolute inset-0 w-full h-full object-cover z-0 pointer-events-none" 
                            alt="Back Card Template"
                          />

                          {/* Dynamic QR Code & Contact Info Overlay */}
                          <div className="relative z-10 flex flex-col items-center text-center my-auto space-y-2 pt-6">
                            {liveQrDataUrl && (
                              <img src={liveQrDataUrl} alt="QR Code" className="w-24 h-24 border border-slate-200 p-1 rounded-2xl shadow-md bg-white" />
                            )}
                            <p className="text-[9px] text-slate-600 font-bold max-w-[180px] leading-tight">
                              Scan QR code for verification.
                            </p>
                          </div>

                          {/* Footer Contact Details */}
                          <div className="relative z-10 bg-white/95 p-2.5 rounded-xl border border-slate-200 text-[8px] font-semibold text-slate-700 space-y-1 backdrop-blur shadow-sm">
                            <div className="flex justify-between">
                              <span className="font-bold text-slate-400">WEB:</span>
                              <span className="font-mono font-bold text-slate-900">{website}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-bold text-slate-400">EMAIL:</span>
                              <span className="font-mono font-bold text-slate-900">{email}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="font-bold text-slate-400">TEL:</span>
                              <span className="font-mono font-bold text-slate-900">{phone}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                ) : (
                  <div className="text-center py-16">
                    <div className="w-16 h-16 rounded-full bg-slate-900 text-slate-500 flex items-center justify-center mx-auto mb-4 border border-slate-800">
                      <IdCard size={28} />
                    </div>
                    <p className="text-slate-400 text-xs font-semibold">Select an employee to view ID card live stage</p>
                  </div>
                )}
              </div>

              {/* Stage Footer */}
              <div className="w-full flex items-center justify-between text-[10px] text-slate-500 pt-3 border-t border-slate-800/80 z-10 font-mono">
                <span>PVC 300 DPI Engine</span>
                <span>CR80 standard (54 × 86 mm)</span>
              </div>
            </div>
          </div>

          {/* ZONE 3: Right Action CTA & Export Downloads (3 Cols) */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-5">
              <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-500" /> Actions & Downloads
              </h3>

              {/* Action Button */}
              <button
                onClick={handleGenerate}
                disabled={loading || !selectedEmployee}
                className="w-full py-3.5 bg-gradient-to-r from-[#F47D30] to-[#E06820] text-white font-extrabold py-3.5 px-4 rounded-2xl shadow-lg shadow-[#F47D30]/25 hover:shadow-xl hover:shadow-[#F47D30]/35 transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-xs uppercase tracking-wider cursor-pointer"
              >
                {loading ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    Generating High-Res Card...
                  </>
                ) : (
                  <>
                    <Sparkles size={16} />
                    Generate PVC ID Card
                  </>
                )}
              </button>

              {resultUrl ? (
                <div className="pt-4 border-t border-slate-100 space-y-3 animate-fadeIn">
                  <h4 className="text-xs font-extrabold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 size={14} className="text-emerald-600" /> Downloads Ready
                  </h4>

                  {/* PDF Download Button */}
                  <button
                    onClick={handleDownloadPdf}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold text-xs transition-all shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Download size={16} />
                    Download Printable PDF
                  </button>

                  {/* PNG Direct Link */}
                  <a
                    href={resultUrl}
                    download={`${selectedEmployee?.name || "Employee"} Front ID.png`}
                    className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold text-xs transition-all flex items-center justify-center gap-2"
                  >
                    <FileText size={14} />
                    Download Front PNG
                  </a>

                  {includeBackside && backResultUrl && (
                    <a
                      href={backResultUrl}
                      download={`${selectedEmployee?.name || "Employee"} Back ID.png`}
                      className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold text-xs transition-all flex items-center justify-center gap-2"
                    >
                      <FileText size={14} />
                      Download Back PNG
                    </a>
                  )}
                </div>
              ) : (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/60 text-center space-y-2">
                  <p className="text-xs font-bold text-slate-700">Ready to Generate</p>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Adjust photo alignment and backside settings, then click <b>Generate PVC ID Card</b> to produce printable 300 DPI outputs.
                  </p>
                </div>
              )}

              {/* Specs Box */}
              <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-2 font-mono text-[11px]">
                <div className="flex justify-between text-slate-400">
                  <span>Physical Standard:</span>
                  <span className="text-white font-bold">CR80 PVC</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Dimensions:</span>
                  <span className="text-white font-bold">54 × 86 mm</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Resolution:</span>
                  <span className="text-emerald-400 font-bold">300 DPI</span>
                </div>
              </div>

            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
