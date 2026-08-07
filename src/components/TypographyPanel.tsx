"use client";

import React from "react";
import { 
  LayoutGrid, 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  SlidersHorizontal,
  RotateCcw
} from "lucide-react";

export interface TypographySettings {
  fontFamily: string;
  fontWeight: string;
  fontSize: number;
  lineHeight: number;
  letterSpacing: string;
  textAlign: "left" | "center" | "right";
  verticalAlign: "top" | "middle" | "bottom";
}

interface TypographyPanelProps {
  settings: TypographySettings;
  onChange: (newSettings: TypographySettings) => void;
  onReset?: () => void;
}

export const defaultTypographySettings: TypographySettings = {
  fontFamily: "Plus Jakarta Sans",
  fontWeight: "SemiBold",
  fontSize: 50.83,
  lineHeight: 50,
  letterSpacing: "-4%",
  textAlign: "left",
  verticalAlign: "top"
};

const fontFamilies = [
  "Plus Jakarta Sans",
  "Inter",
  "Roboto",
  "Montserrat",
  "Playfair Display",
  "Outfit",
  "Geist",
  "Fira Code"
];

const fontWeights = [
  { label: "Regular", value: "Regular" },
  { label: "Medium", value: "Medium" },
  { label: "SemiBold", value: "SemiBold" },
  { label: "Bold", value: "Bold" },
  { label: "ExtraBold", value: "ExtraBold" }
];

export default function TypographyPanel({ settings, onChange, onReset }: TypographyPanelProps) {
  const updateSetting = <K extends keyof TypographySettings>(key: K, value: TypographySettings[K]) => {
    onChange({
      ...settings,
      [key]: value
    });
  };

  return (
    <div className="bg-[#212121] text-white rounded-2xl p-5 border border-zinc-800 shadow-xl space-y-4 font-['Plus_Jakarta_Sans',sans-serif] select-none">
      {/* Header */}
      <div className="flex items-center justify-between pb-1">
        <div className="flex items-center gap-2">
          <span className="font-bold text-sm text-zinc-100 tracking-tight">Typography</span>
        </div>
        <div className="flex items-center gap-2">
          {onReset && (
            <button
              type="button"
              onClick={onReset}
              title="Reset Typography"
              className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <RotateCcw size={14} />
            </button>
          )}
          <div className="text-zinc-400 p-1">
            <LayoutGrid size={16} />
          </div>
        </div>
      </div>

      {/* Font Family Dropdown */}
      <div>
        <select
          value={settings.fontFamily}
          onChange={(e) => updateSetting("fontFamily", e.target.value)}
          className="w-full bg-[#2A2A2A] text-zinc-100 text-xs font-semibold rounded-xl px-3.5 py-2.5 border border-zinc-700/80 focus:outline-none focus:border-zinc-500 transition-colors cursor-pointer appearance-none"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%27A1A1AA' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center' }}
        >
          {fontFamilies.map((font) => (
            <option key={font} value={font} className="bg-[#212121] text-zinc-100">
              {font}
            </option>
          ))}
        </select>
      </div>

      {/* Font Weight & Font Size Row */}
      <div className="grid grid-cols-2 gap-3">
        {/* Font Weight */}
        <div>
          <select
            value={settings.fontWeight}
            onChange={(e) => updateSetting("fontWeight", e.target.value)}
            className="w-full bg-[#2A2A2A] text-zinc-100 text-xs font-semibold rounded-xl px-3 py-2.5 border border-zinc-700/80 focus:outline-none focus:border-zinc-500 transition-colors cursor-pointer appearance-none"
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%27A1A1AA' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 10px center' }}
          >
            {fontWeights.map((weight) => (
              <option key={weight.value} value={weight.value} className="bg-[#212121] text-zinc-100">
                {weight.label}
              </option>
            ))}
          </select>
        </div>

        {/* Font Size */}
        <div className="relative flex items-center">
          <input
            type="number"
            step="0.1"
            value={settings.fontSize}
            onChange={(e) => updateSetting("fontSize", parseFloat(e.target.value) || 12)}
            className="w-full bg-[#2A2A2A] text-zinc-100 text-xs font-semibold rounded-xl px-3 py-2.5 border border-zinc-700/80 focus:outline-none focus:border-zinc-500 transition-colors font-mono"
          />
          <span className="absolute right-3 text-[10px] text-zinc-400 pointer-events-none font-semibold">px</span>
        </div>
      </div>

      {/* Line Height & Letter Spacing Row */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        {/* Line Height */}
        <div>
          <label className="block text-[11px] font-semibold text-zinc-400 mb-1">Line height</label>
          <div className="flex items-center bg-[#2A2A2A] rounded-xl border border-zinc-700/80 px-3 py-2">
            <span className="text-zinc-400 font-serif font-bold text-xs mr-2 underline decoration-zinc-400">A</span>
            <input
              type="number"
              value={settings.lineHeight}
              onChange={(e) => updateSetting("lineHeight", parseFloat(e.target.value) || 0)}
              className="w-full bg-transparent text-zinc-100 text-xs font-semibold focus:outline-none font-mono"
            />
          </div>
        </div>

        {/* Letter Spacing */}
        <div>
          <label className="block text-[11px] font-semibold text-zinc-400 mb-1">Letter spacing</label>
          <div className="flex items-center bg-[#2A2A2A] rounded-xl border border-zinc-700/80 px-3 py-2">
            <span className="text-zinc-400 font-mono font-extrabold text-[11px] mr-2">|A|</span>
            <input
              type="text"
              value={settings.letterSpacing}
              onChange={(e) => updateSetting("letterSpacing", e.target.value)}
              className="w-full bg-transparent text-zinc-100 text-xs font-semibold focus:outline-none font-mono"
              placeholder="-4%"
            />
          </div>
        </div>
      </div>

      {/* Alignment Controls Row */}
      <div className="space-y-1.5 pt-1">
        <label className="block text-[11px] font-semibold text-zinc-400">Alignment</label>
        <div className="flex items-center justify-between gap-2">
          
          {/* Horizontal Alignment Group */}
          <div className="flex items-center bg-[#2A2A2A] p-1 rounded-xl border border-zinc-700/80 gap-0.5">
            <button
              type="button"
              onClick={() => updateSetting("textAlign", "left")}
              className={`p-2 rounded-lg transition-colors cursor-pointer ${
                settings.textAlign === "left" ? "bg-zinc-700 text-white shadow-sm" : "text-zinc-400 hover:text-zinc-200"
              }`}
              title="Align Left"
            >
              <AlignLeft size={15} />
            </button>
            <button
              type="button"
              onClick={() => updateSetting("textAlign", "center")}
              className={`p-2 rounded-lg transition-colors cursor-pointer ${
                settings.textAlign === "center" ? "bg-zinc-700 text-white shadow-sm" : "text-zinc-400 hover:text-zinc-200"
              }`}
              title="Align Center"
            >
              <AlignCenter size={15} />
            </button>
            <button
              type="button"
              onClick={() => updateSetting("textAlign", "right")}
              className={`p-2 rounded-lg transition-colors cursor-pointer ${
                settings.textAlign === "right" ? "bg-zinc-700 text-white shadow-sm" : "text-zinc-400 hover:text-zinc-200"
              }`}
              title="Align Right"
            >
              <AlignRight size={15} />
            </button>
          </div>

          {/* Vertical Alignment Group */}
          <div className="flex items-center bg-[#2A2A2A] p-1 rounded-xl border border-zinc-700/80 gap-0.5">
            <button
              type="button"
              onClick={() => updateSetting("verticalAlign", "top")}
              className={`p-2 rounded-lg transition-colors cursor-pointer ${
                settings.verticalAlign === "top" ? "bg-zinc-700 text-white shadow-sm" : "text-zinc-400 hover:text-zinc-200"
              }`}
              title="Align Top"
            >
              <span className="font-extrabold text-xs">↑</span>
            </button>
            <button
              type="button"
              onClick={() => updateSetting("verticalAlign", "middle")}
              className={`p-2 rounded-lg transition-colors cursor-pointer ${
                settings.verticalAlign === "middle" ? "bg-zinc-700 text-white shadow-sm" : "text-zinc-400 hover:text-zinc-200"
              }`}
              title="Align Middle"
            >
              <span className="font-extrabold text-xs">÷</span>
            </button>
            <button
              type="button"
              onClick={() => updateSetting("verticalAlign", "bottom")}
              className={`p-2 rounded-lg transition-colors cursor-pointer ${
                settings.verticalAlign === "bottom" ? "bg-zinc-700 text-white shadow-sm" : "text-zinc-400 hover:text-zinc-200"
              }`}
              title="Align Bottom"
            >
              <span className="font-extrabold text-xs">↓</span>
            </button>
          </div>

          {/* Extra options icon button */}
          <button
            type="button"
            className="p-2 rounded-xl bg-[#2A2A2A] border border-zinc-700/80 text-zinc-400 hover:text-white transition-colors cursor-pointer"
            title="More typography settings"
          >
            <SlidersHorizontal size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
