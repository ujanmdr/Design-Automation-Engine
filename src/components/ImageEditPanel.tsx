"use client";

import React from "react";
import { RotateCcw } from "lucide-react";

export interface ImageAdjustments {
  exposure: number; // -100 to 100
  contrast: number; // -100 to 100
  saturation: number; // -100 to 100
  temperature: number; // -100 to 100
  tint: number; // -100 to 100
  highlights: number; // -100 to 100
  shadows: number; // -100 to 100
}

interface ImageEditPanelProps {
  photoUrl?: string;
  adjustments: ImageAdjustments;
  onChange: (newAdjustments: ImageAdjustments) => void;
  onReset?: () => void;
}

export const defaultImageAdjustments: ImageAdjustments = {
  exposure: 0,
  contrast: 0,
  saturation: 0,
  temperature: 0,
  tint: 0,
  highlights: 0,
  shadows: 0
};

export function getCssFilterString(adjustments: ImageAdjustments): string {
  // Convert -100..100 ranges to CSS filter values
  const brightness = 100 + adjustments.exposure * 0.5; // 50% to 150%
  const contrast = 100 + adjustments.contrast * 0.5; // 50% to 150%
  const saturate = 100 + adjustments.saturation * 0.7; // 30% to 170%
  const hueRotate = adjustments.temperature * 0.4; // -40deg to 40deg hue shift
  
  return `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturate}%) hue-rotate(${hueRotate}deg)`;
}

export default function ImageEditPanel({ photoUrl, adjustments, onChange, onReset }: ImageEditPanelProps) {
  const updateAdjustment = <K extends keyof ImageAdjustments>(key: K, value: number) => {
    onChange({
      ...adjustments,
      [key]: value
    });
  };

  const cssFilter = getCssFilterString(adjustments);

  const sliderFields: { label: string; key: keyof ImageAdjustments }[] = [
    { label: "Exposure", key: "exposure" },
    { label: "Contrast", key: "contrast" },
    { label: "Saturation", key: "saturation" },
    { label: "Temperat...", key: "temperature" },
    { label: "Tint", key: "tint" },
    { label: "Highlights", key: "highlights" },
    { label: "Shadows", key: "shadows" }
  ];

  return (
    <div className="bg-[#212121] text-white rounded-2xl p-5 border border-zinc-800 shadow-xl space-y-4 font-['Plus_Jakarta_Sans',sans-serif] select-none">
      {/* Header Bar */}
      <div className="flex items-center justify-between pb-1">
        <select
          defaultValue="Crop"
          className="bg-[#2A2A2A] text-zinc-100 text-xs font-semibold rounded-xl px-3 py-1.5 border border-zinc-700/80 focus:outline-none cursor-pointer appearance-none pr-7"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%27A1A1AA' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center' }}
        >
          <option value="Crop">Crop</option>
          <option value="Adjustments">Adjustments</option>
          <option value="Filters">Filters</option>
        </select>

        <button
          type="button"
          onClick={onReset}
          title="Reset Image Adjustments"
          className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors cursor-pointer"
        >
          <RotateCcw size={15} />
        </button>
      </div>

      {/* Transparent Checkerboard Image Preview Frame */}
      <div 
        className="w-full h-56 rounded-xl border border-zinc-800 overflow-hidden relative flex items-center justify-center bg-zinc-900"
        style={{
          backgroundImage: `
            linear-gradient(45deg, #2A2A2A 25%, transparent 25%), 
            linear-gradient(-45deg, #2A2A2A 25%, transparent 25%), 
            linear-gradient(45deg, transparent 75%, #2A2A2A 75%), 
            linear-gradient(-45deg, transparent 75%, #2A2A2A 75%)
          `,
          backgroundSize: '20px 20px',
          backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px'
        }}
      >
        {photoUrl ? (
          <img
            src={photoUrl}
            alt="Subject Cutout Preview"
            className="max-h-52 object-contain transition-all duration-150"
            style={{ filter: cssFilter }}
            onError={(e) => {
              (e.currentTarget as HTMLElement).style.display = 'none';
            }}
          />
        ) : (
          <span className="text-xs text-zinc-500 font-semibold">No Image Selected</span>
        )}
      </div>

      {/* Sliders Container */}
      <div className="space-y-3.5 pt-1">
        {sliderFields.map(({ label, key }) => (
          <div key={key} className="flex items-center gap-3">
            <span className="text-[11px] font-semibold text-zinc-300 w-24 truncate">{label}</span>
            <div className="flex-1 relative flex items-center">
              <input
                type="range"
                min="-100"
                max="100"
                value={adjustments[key]}
                onChange={(e) => updateAdjustment(key, parseInt(e.target.value))}
                className="w-full h-2 bg-[#333333] rounded-lg appearance-none cursor-pointer accent-white"
              />
            </div>
            <span className="text-[10px] font-mono text-zinc-400 w-7 text-right">
              {adjustments[key]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
