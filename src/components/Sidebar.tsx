"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Cake, Users, IdCard, Sparkles, ShieldCheck, Trophy } from "lucide-react";

export function Sidebar() {
  const pathname = usePathname();

  const links = [
    { name: "Birthday Posts", href: "/", icon: Cake, description: "Automated Posts & Previews" },
    { name: "Work Anniversary", href: "/work-anniversary", icon: Trophy, description: "Animated Anniversary Videos" },
    { name: "Employees", href: "/employees", icon: Users, description: "Directory & Records" },
    { name: "ID Cards", href: "/id-cards", icon: IdCard, description: "High-Res PVC Cards" },
  ];

  return (
    <aside className="w-60 h-screen bg-[#090D16] text-white flex flex-col fixed left-0 top-0 z-40 border-r border-slate-800/80 font-['Plus_Jakarta_Sans',sans-serif] selection:bg-[#F47D30]/30 selection:text-[#F47D30] backdrop-blur-xl">
      {/* Brand Header */}
      <div className="p-5 pb-4 border-b border-slate-800/60">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#F47D30] via-[#F47D30] to-[#FFA86B] flex items-center justify-center font-bold text-white shadow-lg shadow-[#F47D30]/30 text-sm tracking-wider">
            GF
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
              GritFeat <span className="text-[9px] uppercase font-bold tracking-widest bg-[#F47D30]/15 text-[#F47D30] px-1.5 py-0.5 rounded border border-[#F47D30]/25">Pro</span>
            </h1>
            <p className="text-[11px] text-slate-400 font-medium">Automation Studio</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-3 py-5 space-y-1">
        <div className="px-3 mb-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
          Studio Apps
        </div>
        {links.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                isActive 
                  ? "bg-slate-800/80 text-white font-semibold shadow-sm border border-slate-700/60" 
                  : "text-slate-400 hover:bg-slate-800/40 hover:text-slate-200"
              }`}
            >
              {/* Active Indicator Accent */}
              {isActive && (
                <span className="absolute left-0 top-2 bottom-2 w-1 bg-[#F47D30] rounded-r-full shadow-md shadow-[#F47D30]/60" />
              )}
              
              <div className={`p-1 rounded-lg transition-colors ${
                isActive ? "text-[#F47D30]" : "text-slate-400 group-hover:text-slate-200"
              }`}>
                <Icon size={17} />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold leading-tight">{link.name}</span>
                <span className={`text-[10px] transition-colors ${
                  isActive ? "text-slate-300" : "text-slate-500 group-hover:text-slate-400"
                }`}>
                  {link.description}
                </span>
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Status & Footer */}
      <div className="p-4 border-t border-slate-800/60 space-y-2.5">
        <div className="p-2.5 bg-slate-900/90 rounded-xl border border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[11px] font-medium text-slate-300">Cron Daemon Active</span>
          </div>
          <ShieldCheck size={14} className="text-emerald-500" />
        </div>

        <div className="flex items-center justify-between px-1 text-[10px] text-slate-500 font-medium">
          <span className="flex items-center gap-1">
            <Sparkles size={11} className="text-[#F47D30]" /> v2.5 Enterprise
          </span>
          <span>&copy; GritFeat</span>
        </div>
      </div>
    </aside>
  );
}
