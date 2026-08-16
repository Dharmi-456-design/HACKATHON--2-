import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
  Award,
  Target,
  Globe,
  BarChart2,
  PanelLeftClose,
  PanelLeftOpen,
  ShieldAlert,
} from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import ExplorerStreak from './ExplorerStreak';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const LINKS = [
  { to: '/app',                label: 'Dashboard',    icon: LayoutDashboard, end: true },
  { to: '/app/lens',           label: 'Nature Lens',  icon: Camera },
  { to: '/app/places',         label: 'Nearby',       icon: Map },
  { to: '/app/act',            label: 'Act',          icon: HandHeart },
  { to: '/app/journal',        label: 'Journal',      icon: BookOpen },
  { to: '/app/passport',       label: 'Passport',     icon: Award },
  { to: '/app/missions',       label: 'Missions',     icon: Target },
  { to: '/app/community-map',  label: 'Bio Map',      icon: Globe },
  { to: '/app/recap',          label: 'Weekly Recap', icon: BarChart2 },
  { to: '/app/stories',        label: 'Stories',      icon: Sparkles },
  { to: '/app/community',      label: 'Community',    icon: Users },
  { to: '/app/pulse',          label: 'Pulse Chat',   icon: MessageCircle },
  { to: '/app/green-watch',    label: 'Green Watch',  icon: ShieldAlert },
];

const MOBILE_PRIMARY = [LINKS[0], LINKS[1], LINKS[2], LINKS[7]];

export default function AppShell() {
  const { logout } = useAuth();
  const { theme } = useTheme();
  const nav = useNavigate();
  const [more, setMore] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    return localStorage.getItem('sidebar_collapsed') === 'true';
  });
  const isDark = theme === 'dark';

  const toggleSidebar = () => {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('sidebar_collapsed', String(next));
      return next;
    });
  };

  const signOut = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    try {
      logout();
    } catch (err) {
      console.error('Sign out error:', err);
    } finally {
      nav('/', { replace: true });
    }
  };

  return (
    <div className={`min-h-screen flex ${isDark ? 'bg-[#040B06] text-slate-100' : 'bg-cream text-ink'}`}>

      {/* ────────────────────── DESKTOP SIDEBAR ────────────────────── */}
      <motion.aside
        initial={false}
        animate={{ width: collapsed ? 68 : 240 }}
        transition={{ type: 'spring', stiffness: 320, damping: 32 }}
        className={`hidden md:flex flex-col border-r sticky top-0 h-screen shrink-0 z-20 overflow-hidden select-none
          ${isDark ? 'bg-[#0E2015] border-[#20452F]' : 'bg-[#F8F9FA] border-ink/8'}`}
      >
        {/* Brand & Toggle Header */}
        <div className="h-16 px-3 flex items-center shrink-0 border-b border-transparent">
          <AnimatePresence mode="wait" initial={false}>
            {collapsed ? (
              <motion.div
                key="collapsed-header"
                initial={{ opacity: 0, scale: 0.85 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{ duration: 0.15 }}
                className="w-full flex justify-center"
              >
                <button
                  type="button"
                  onClick={toggleSidebar}
                  title="Expand sidebar"
                  aria-label="Expand sidebar"
                  className={`p-2 rounded-xl transition-all duration-150 cursor-pointer ${
                    isDark
                      ? 'text-[#96CD7B] hover:bg-white/10'
                      : 'text-[#1C3727] hover:bg-[#E2EFE0]'
                  }`}
                >
                  <PanelLeftOpen size={20} strokeWidth={2} />
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="expanded-header"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="w-full flex items-center justify-between min-w-0"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <img src="/logo.png" alt="NaturePulse Logo" className="w-9 h-9 rounded-xl object-cover shrink-0 shadow-xs" />
                  <div className="truncate">
                    <p className="font-display text-[16px] leading-none font-semibold truncate whitespace-nowrap">NaturePulse</p>
                    <p className="text-[9px] uppercase tracking-[0.15em] text-forest/40 mt-1 truncate whitespace-nowrap">Nature Connection</p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={toggleSidebar}
                  title="Collapse sidebar"
                  aria-label="Collapse sidebar"
                  className={`p-1.5 rounded-lg transition-colors shrink-0 cursor-pointer ${
                    isDark
                      ? 'text-white/60 hover:bg-white/10 hover:text-white'
                      : 'text-forest/60 hover:bg-ink/5 hover:text-forest'
                  }`}
                >
                  <PanelLeftClose size={19} strokeWidth={1.8} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Divider */}
        <div className={`mx-3 h-px ${isDark ? 'bg-white/6' : 'bg-ink/6'} mb-2`} />

        {/* Nav links */}
        <nav className="px-2 flex-1 space-y-0.5 overflow-y-auto overflow-x-hidden pt-1 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden overscroll-contain">
          {!collapsed && (
            <p className="px-3 text-[10px] uppercase tracking-[0.2em] text-forest/35 font-semibold mb-2 mt-1 whitespace-nowrap">
              Menu
            </p>
          )}
          {LINKS.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              title={collapsed ? l.label : undefined}
              className={({ isActive }) =>
                `flex items-center rounded-xl transition-colors duration-150 ${
                  collapsed ? 'justify-center h-10 w-10 mx-auto' : 'gap-3 px-3 py-2 text-sm w-full'
                } ${
                  isActive
                    ? isDark
                      ? 'bg-[#96CD7B]/20 text-[#96CD7B] font-semibold'
                      : 'bg-[#1C3727] text-[#F8F9FA] font-semibold shadow-sm'
                    : isDark
                      ? 'text-white/60 hover:bg-white/6 hover:text-white/90'
                      : 'text-forest/70 hover:bg-[#E2EFE0] hover:text-forest'
                }`
              }
            >
              <l.icon size={19} strokeWidth={1.8} className="shrink-0" />
              {!collapsed && (
                <span className="truncate whitespace-nowrap font-medium text-sm">
                  {l.label}
                </span>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Bottom section */}
        <div className={`p-3 border-t ${isDark ? 'border-white/6' : 'border-ink/6'} space-y-2 shrink-0`}>
          {!collapsed ? (
            <>
              {/* Theme Toggle Pill */}
              <div className={`rounded-xl px-1 py-1 ${isDark ? 'bg-white/4' : 'bg-[#F3F5F1]'}`}>
                <ThemeToggle variant="pill" />
              </div>

              {/* Explorer Streak */}
              <ExplorerStreak />

              {/* User info */}
              <p className={`text-xs truncate px-2 pb-1 ${isDark ? 'text-white/35' : 'text-forest/40'}`}>
                {user?.email}
              </p>

              {/* Settings & Sign out */}
              <div className="flex gap-1">
                <NavLink
                  to="/app/settings"
                  title="Settings"
                  className={({ isActive }) =>
                    `flex-1 text-xs rounded-lg px-2.5 py-2 inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
                      isActive
                        ? isDark ? 'bg-[#97CDAB]/20 text-[#97CDAB] font-semibold' : 'bg-[#1B3A2C]/10 text-[#1B3A2C] font-semibold'
                        : isDark ? 'text-white/50 hover:bg-white/6 hover:text-white/80' : 'text-forest/60 hover:bg-[#EDF2EA] hover:text-forest'
                    }`
                  }
                >
                  <Settings size={14} className="shrink-0" /> Settings
                </NavLink>

                <button
                  type="button"
                  onClick={signOut}
                  title="Sign out"
                  className={`text-xs rounded-lg px-2.5 py-2 inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
                    isDark ? 'text-white/50 hover:bg-red-500/20 hover:text-red-300' : 'text-forest/60 hover:bg-red-50 hover:text-red-700'
                  }`}
                >
                  <LogOut size={14} className="shrink-0" /> Sign out
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center gap-2 py-1">
              {/* Compact Theme Toggle */}
              <ThemeToggle variant="icon" />

              {/* Compact Explorer Streak */}
              <ExplorerStreak compact />

              {/* Compact Settings */}
              <NavLink
                to="/app/settings"
                title="Settings"
                aria-label="Settings"
                className={({ isActive }) =>
                  `p-2 rounded-xl transition-colors cursor-pointer ${
                    isActive
                      ? isDark ? 'bg-[#97CDAB]/20 text-[#97CDAB]' : 'bg-[#1B3A2C]/10 text-[#1B3A2C]'
                      : isDark ? 'text-white/50 hover:bg-white/6 hover:text-white/80' : 'text-forest/60 hover:bg-[#EDF2EA] hover:text-forest'
                  }`
                }
              >
                <Settings size={18} />
              </NavLink>

              {/* Compact Sign out */}
              <button
                type="button"
                onClick={signOut}
                title="Sign out"
                aria-label="Sign out"
                className={`p-2 rounded-xl transition-colors cursor-pointer ${
                  isDark ? 'text-white/50 hover:bg-red-500/20 hover:text-red-300' : 'text-forest/60 hover:bg-red-50 hover:text-red-700'
                }`}
              >
                <LogOut size={18} />
              </button>
            </div>
          )}
        </div>
      </motion.aside>

      {/* ────────────────────── MAIN CONTENT ────────────────────── */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Mobile top bar */}
        <header className={`md:hidden flex items-center justify-between px-4 py-3 border-b sticky top-0 z-20
          ${isDark ? 'bg-[#111f17] border-white/8' : 'bg-white border-ink/8'}`}
        >
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="NaturePulse Logo" className="w-8 h-8 rounded-lg object-cover shrink-0" />
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
