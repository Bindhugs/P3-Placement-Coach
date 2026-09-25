import React, { useState } from "react";
import { 
  ShieldCheck, 
  Sparkles, 
  SlidersHorizontal, 
  Menu, 
  X, 
  Target, 
  FileSearch, 
  Mic2, 
  TrendingUp, 
  CalendarDays, 
  Briefcase, 
  Users, 
  Lock
} from "lucide-react";

export const Navbar = ({ 
  activeView, 
  setActiveView, 
  aiMode, 
  onOpenSettings, 
  onTriggerDemo 
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: Target },
    { id: "parse", label: "Parse", badge: "X-Ray", icon: FileSearch },
    { id: "probe", label: "Probe", badge: "Hot Seat", icon: Mic2 },
    { id: "progress", label: "Progress", icon: TrendingUp },
    { id: "plan", label: "7-Day Plan", icon: CalendarDays },
    { id: "unlocker", label: "Role Unlocker", icon: Briefcase },
    { id: "personas", label: "Personas", icon: Users },
    { id: "privacy", label: "Privacy & Trust", icon: Lock },
  ];

  const handleNavClick = (viewId) => {
    setActiveView(viewId);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-[#060911]/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Logo and Brand */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => handleNavClick("landing")} 
            className="group flex items-center gap-3 text-left focus:outline-none"
          >
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 font-mono font-bold text-white shadow-lg shadow-cyan-500/20 ring-1 ring-white/20 transition-transform group-hover:scale-105">
              <span>P3</span>
              <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-500 ring-2 ring-[#060911]">
                <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold tracking-tight text-white group-hover:text-cyan-400 transition-colors">
                  P3 · PLACEMENT COACH
                </span>
              </div>
              <p className="text-[11px] font-medium tracking-wide text-slate-400">
                Parse. Probe. Progress.
              </p>
            </div>
          </button>

          {/* AI Mode Indicator Pill */}
          <div className="hidden md:flex items-center ml-2">
            {aiMode === "gemini" ? (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 px-2.5 py-0.5 text-[11px] font-medium text-purple-300">
                <Sparkles className="h-3 w-3 text-purple-400 animate-spin" style={{ animationDuration: '6s' }} />
                Gemini API Mode
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[11px] font-medium text-emerald-300" title="Designed for local-first processing. No raw resume data leaves this browser.">
                <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
                Offline Smart Mode
              </span>
            )}
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="hidden xl:flex items-center space-x-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition-all ${
                  isActive
                    ? "bg-slate-800 text-cyan-400 shadow-sm border border-slate-700"
                    : "text-slate-300 hover:bg-slate-900 hover:text-white"
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isActive ? "text-cyan-400" : "text-slate-400"}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span className={`text-[10px] px-1 rounded uppercase tracking-wider font-semibold ${
                    isActive ? "bg-cyan-500/20 text-cyan-300" : "bg-slate-800 text-slate-400"
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          {/* 1-Click Try Demo Button */}
          <button
            onClick={onTriggerDemo}
            className="flex items-center gap-1.5 rounded-lg border border-cyan-500/40 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 px-3 py-1.5 text-xs font-semibold text-cyan-300 shadow-sm hover:border-cyan-400 hover:from-cyan-500/30 hover:to-blue-500/30 active:scale-95 transition-all"
            title="Load authentic sample resume & test the Hot Seat immediately"
          >
            <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
            <span>Try Demo</span>
          </button>

          {/* Settings Trigger */}
          <button
            onClick={onOpenSettings}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-800 bg-slate-900/80 text-slate-300 hover:border-slate-700 hover:text-white transition-colors"
            title="Settings & Privacy Controls"
          >
            <SlidersHorizontal className="h-4 w-4" />
          </button>

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex xl:hidden h-9 w-9 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-slate-300 hover:text-white"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="border-b border-slate-800 bg-[#090d16] px-4 py-4 xl:hidden">
          <div className="mb-3 flex items-center justify-between pb-3 border-b border-slate-800">
            <span className="text-xs text-slate-400">Current AI Engine:</span>
            {aiMode === "gemini" ? (
              <span className="text-xs font-medium text-purple-300">Gemini API Mode</span>
            ) : (
              <span className="text-xs font-medium text-emerald-400">Offline Smart Mode</span>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium text-left ${
                    isActive
                      ? "bg-slate-800 text-cyan-400 border border-slate-700"
                      : "text-slate-300 hover:bg-slate-900"
                  }`}
                >
                  <Icon className="h-4 w-4 text-cyan-400" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
};
