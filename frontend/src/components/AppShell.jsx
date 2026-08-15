import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Camera,
  Map,
  Sparkles,
  BookOpen,
  HandHeart,
  Users,
  MessageCircle,
  LogOut,
  Settings,
  Menu,
  X,
  Leaf,
} from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import supabase from '../lib/supabase';

const LINKS = [
  { to: '/app',           label: 'Dashboard',   icon: LayoutDashboard, end: true },
  { to: '/app/lens',      label: 'Nature Lens',  icon: Camera },
  { to: '/app/places',    label: 'Nearby',       icon: Map },
  { to: '/app/act',       label: 'Act',          icon: HandHeart },
  { to: '/app/journal',   label: 'Journal',      icon: BookOpen },
  { to: '/app/stories',   label: 'Stories',      icon: Sparkles },
  { to: '/app/community', label: 'Community',    icon: Users },
  { to: '/app/pulse',     label: 'Pulse Chat',   icon: MessageCircle },
];

const MOBILE_PRIMARY = [LINKS[0], LINKS[1], LINKS[2], LINKS[7]];

export default function AppShell() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const nav = useNavigate();
  const [more, setMore] = useState(false);
  const isDark = theme === 'dark';

  const signOut = async () => {
    await supabase.auth.signOut();
    nav('/');
  };

  return (
    <div className="min-h-screen bg-cream text-ink flex">

      {/* ────────────────────── DESKTOP SIDEBAR ────────────────────── */}
      <aside className={`hidden md:flex w-[240px] shrink-0 flex-col border-r sticky top-0 h-screen
        ${isDark ? 'bg-[#111f17] border-white/8' : 'bg-white border-ink/8'}`}
      >
        {/* Brand */}
        <div className="px-5 pt-6 pb-5 flex items-center gap-3">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0
            ${isDark ? 'bg-[#97CDAB]/20' : 'bg-[#1B3A2C]'}`}
          >
            <Leaf size={17} className={isDark ? 'text-[#97CDAB]' : 'text-white'} strokeWidth={2} />
          </div>
          <div>
            <p className="font-display text-[17px] leading-none font-semibold">NaturePulse</p>
            <p className="text-[10px] uppercase tracking-[0.18em] text-forest/40 mt-0.5">Nature Connection</p>
          </div>
        </div>

        {/* Divider */}
        <div className={`mx-5 h-px ${isDark ? 'bg-white/6' : 'bg-ink/6'} mb-3`} />

        {/* Nav links */}
        <nav className="px-3 flex-1 space-y-0.5 overflow-y-auto">
          <p className="px-3 text-[10px] uppercase tracking-[0.2em] text-forest/35 font-semibold mb-2 mt-1">Menu</p>
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150 ${
                  isActive
                    ? isDark
                      ? 'bg-[#97CDAB]/15 text-[#97CDAB] font-semibold'
                      : 'bg-[#1B3A2C] text-white font-semibold shadow-sm'
                    : isDark
                      ? 'text-white/60 hover:bg-white/6 hover:text-white/90'
                      : 'text-forest/70 hover:bg-[#EDF2EA] hover:text-forest'
                }`
              }
            >
              <l.icon size={16} strokeWidth={1.8} />
              {l.label}
            </NavLink>
          ))}
        </nav>

        {/* Bottom section */}
        <div className={`p-4 border-t ${isDark ? 'border-white/6' : 'border-ink/6'} space-y-1`}>
          {/* ── THEME TOGGLE (prominent pill) ── */}
          <div className={`rounded-xl px-1 py-1 mb-2 ${isDark ? 'bg-white/4' : 'bg-[#F3F5F1]'}`}>
            <ThemeToggle variant="pill" />
          </div>

          {/* User */}
          <p className={`text-xs truncate px-3 pb-1 ${isDark ? 'text-white/35' : 'text-forest/40'}`}>
            {user?.email}
          </p>
          <div className="flex gap-1">
            <NavLink
              to="/app/settings"
              className={`flex-1 text-xs rounded-lg px-3 py-2 inline-flex items-center gap-1.5 transition-colors
                ${isDark ? 'text-white/50 hover:bg-white/6 hover:text-white/80' : 'text-forest/60 hover:bg-[#EDF2EA] hover:text-forest'}`}
            >
              <Settings size={13} /> Settings
            </NavLink>
            <button
              onClick={signOut}
              className={`text-xs rounded-lg px-3 py-2 inline-flex items-center gap-1.5 transition-colors
                ${isDark ? 'text-white/50 hover:bg-white/6 hover:text-white/80' : 'text-forest/60 hover:bg-[#EDF2EA] hover:text-forest'}`}
            >
              <LogOut size={13} /> Sign out
            </button>
          </div>
        </div>
      </aside>

      {/* ────────────────────── MAIN CONTENT ────────────────────── */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Mobile top bar */}
        <header className={`md:hidden flex items-center justify-between px-4 py-3 border-b sticky top-0 z-20
          ${isDark ? 'bg-[#111f17] border-white/8' : 'bg-white border-ink/8'}`}
        >
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center
              ${isDark ? 'bg-[#97CDAB]/20' : 'bg-[#1B3A2C]'}`}
            >
              <Leaf size={15} className={isDark ? 'text-[#97CDAB]' : 'text-white'} strokeWidth={2} />
            </div>
            <span className="font-display text-base font-semibold">NaturePulse</span>
          </div>
          {/* Mini toggle on mobile header */}
          <ThemeToggle variant="icon" />
        </header>

        <main className="flex-1 pb-24 md:pb-10">
          <Outlet />
        </main>

        {/* Mobile "More" drawer */}
        {more && (
          <div
            className="md:hidden fixed inset-0 z-40 bg-ink/30 backdrop-blur-xs"
            onClick={() => setMore(false)}
          >
            <div
              className={`absolute bottom-16 inset-x-3 rounded-3xl p-4 shadow-lift border
                ${isDark ? 'bg-[#16271F] border-white/10' : 'bg-white border-ink/10'}`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Theme pill in the drawer */}
              <div className={`rounded-xl px-1 py-1 mb-3 ${isDark ? 'bg-white/4' : 'bg-[#F3F5F1]'}`}>
                <ThemeToggle variant="pill" />
              </div>

              <div className="grid grid-cols-3 gap-2">
                {LINKS.slice(3, 7).map((l) => (
                  <NavLink
                    key={l.to}
                    to={l.to}
                    onClick={() => setMore(false)}
                    className={`flex flex-col items-center gap-1 py-3 rounded-2xl text-xs transition-colors
                      ${isDark ? 'bg-white/5 text-white/70 hover:bg-white/10' : 'bg-[#F3F5F1] text-forest hover:bg-[#E8EDE5]'}`}
                  >
                    <l.icon size={18} strokeWidth={1.8} />
                    {l.label.split(' ')[0]}
                  </NavLink>
                ))}
                <NavLink
                  to="/app/settings"
                  onClick={() => setMore(false)}
                  className={`flex flex-col items-center gap-1 py-3 rounded-2xl text-xs transition-colors
                    ${isDark ? 'bg-white/5 text-white/70 hover:bg-white/10' : 'bg-[#F3F5F1] text-forest hover:bg-[#E8EDE5]'}`}
                >
                  <Settings size={18} strokeWidth={1.8} />
                  Settings
                </NavLink>
                <button
                  onClick={signOut}
                  className={`flex flex-col items-center gap-1 py-3 rounded-2xl text-xs col-span-3 transition-colors
                    ${isDark ? 'bg-red-900/20 text-red-300 hover:bg-red-900/30' : 'bg-red-50 text-red-700 hover:bg-red-100'}`}
                >
                  <LogOut size={18} strokeWidth={1.8} />
                  Sign out
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Mobile bottom nav */}
        <nav className={`md:hidden fixed bottom-0 inset-x-0 backdrop-blur-md border-t px-2 py-2 grid grid-cols-5 gap-1 z-30
          ${isDark ? 'bg-[#111f17]/95 border-white/8' : 'bg-white/95 border-ink/8'}`}
        >
          {MOBILE_PRIMARY.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 py-1.5 rounded-xl text-[10px] transition-colors ${
                  isActive
                    ? isDark ? 'text-[#97CDAB] font-semibold' : 'text-forest font-semibold'
                    : isDark ? 'text-white/35' : 'text-forest/40'
                }`
              }
            >
              <l.icon size={18} strokeWidth={1.8} />
              {l.label.split(' ')[0]}
            </NavLink>
          ))}
          <button
            onClick={() => setMore((v) => !v)}
            className={`flex flex-col items-center gap-0.5 py-1.5 rounded-xl text-[10px] transition-colors
              ${more
                ? isDark ? 'text-[#97CDAB]' : 'text-forest'
                : isDark ? 'text-white/35' : 'text-forest/40'
              }`}
          >
            {more ? <X size={18} /> : <Menu size={18} />}
            More
          </button>
        </nav>
      </div>
    </div>
  );
}
