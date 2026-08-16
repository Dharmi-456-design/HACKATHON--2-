import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Menu, X } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isLoggedIn = Boolean(user);

  const handleDashboardClick = (e) => {
    e.preventDefault();
    if (isLoggedIn) {
      navigate('/app');
    } else {
      navigate('/login');
    }
  };

  const handleSignOut = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-[100] backdrop-blur-xl transition-colors duration-300 select-none ${
      isDark
        ? 'bg-[#0A1610]/90 border-b border-white/10 text-white'
        : 'bg-[#F8F9FA]/90 border-b border-emerald-950/10 text-slate-900 shadow-sm'
    }`}>
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
        
        {/* Leftmost Logo & Brand Title */}
        <Link to="/" className="flex items-center gap-3 group shrink-0">
          <div className="relative">
            <div className="absolute inset-0 bg-[#96CD7B]/20 rounded-xl blur-md group-hover:bg-[#96CD7B]/40 transition-colors" />
            <img
              src="/logo.webp"
              alt="NaturePulse Logo"
<<<<<<< HEAD
              className={`relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl object-cover shadow-md group-hover:scale-105 transition-transform ${
                isDark ? 'border border-white/20' : 'border border-emerald-900/15'
              }`}
=======
              width="40"
              height="40"
              className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl object-cover border border-white/20 shadow-md group-hover:scale-105 transition-transform"
>>>>>>> f074206a79e5d5964495dfb7ae7c772cc365acf5
            />
          </div>
          <div className="flex flex-col">
            <span className={`font-display text-xl sm:text-2xl font-bold tracking-tight transition-colors ${
              isDark ? 'text-white group-hover:text-[#96CD7B]' : 'text-slate-900 group-hover:text-emerald-700'
            }`}>
              NaturePulse
            </span>
            <span className={`text-[10px] font-mono font-semibold tracking-wider uppercase hidden sm:inline-block ${
              isDark ? 'text-[#96CD7B]' : 'text-emerald-700'
            }`}>
              AI Nature Platform
            </span>
          </div>
        </Link>

        {/* Center Pill Nav Links (Desktop) */}
<<<<<<< HEAD
        <nav className={`hidden md:flex items-center gap-1 rounded-full px-3 py-1.5 backdrop-blur-md shadow-inner ${
          isDark ? 'bg-white/5 border border-white/10' : 'bg-slate-900/5 border border-slate-900/10'
        }`}>
          {[
            { href: '#hero', label: 'Explore' },
            { href: '#reviews', label: 'Community' },
            { href: '#journey', label: 'The Loop' },
            { href: '#pulse', label: 'Pulse AI' },
            { href: '#pricing', label: 'Pricing' },
          ].map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-colors ${
                isDark
                  ? 'text-white/80 hover:text-white hover:bg-white/10'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-slate-900/5'
              }`}
            >
              {item.label}
            </a>
          ))}
=======
        <nav className="hidden md:flex items-center gap-1 bg-white/5 border border-white/10 rounded-full px-3 py-1.5 backdrop-blur-md shadow-inner" aria-label="Main Navigation">
          <a
            href="#hero"
            className="px-4 py-1.5 rounded-full text-xs font-medium text-white/90 hover:text-white hover:bg-white/10 transition-colors"
          >
            Explore
          </a>
          <a
            href="#reviews"
            className="px-4 py-1.5 rounded-full text-xs font-medium text-white/90 hover:text-white hover:bg-white/10 transition-colors"
          >
            Community
          </a>
          <a
            href="#journey"
            className="px-4 py-1.5 rounded-full text-xs font-medium text-white/90 hover:text-white hover:bg-white/10 transition-colors"
          >
            The Loop
          </a>
          <a
            href="#pulse"
            className="px-4 py-1.5 rounded-full text-xs font-medium text-white/90 hover:text-white hover:bg-white/10 transition-colors"
          >
            Pulse AI
          </a>
          <a
            href="#pricing"
            className="px-4 py-1.5 rounded-full text-xs font-medium text-white/90 hover:text-white hover:bg-white/10 transition-colors"
          >
            Pricing
          </a>
>>>>>>> f074206a79e5d5964495dfb7ae7c772cc365acf5
        </nav>

        {/* Right CTA Actions */}
        <div className="flex items-center gap-3">
          <ThemeToggle />

          {isLoggedIn ? (
            <div className="flex items-center gap-2">
              <button
                onClick={handleSignOut}
                className={`hidden sm:inline-flex text-xs px-3 py-2 rounded-full border font-medium cursor-pointer transition-colors ${
                  isDark
                    ? 'border-white/15 text-white/80 hover:text-red-300 hover:border-red-400/40'
                    : 'border-slate-300 text-slate-700 hover:text-red-600 hover:border-red-300'
                }`}
              >
                Sign out
              </button>
              <button
                onClick={handleDashboardClick}
                className={`inline-flex items-center gap-1.5 rounded-full font-semibold text-xs sm:text-sm px-4 sm:px-5 py-2 transition-all cursor-pointer shadow-md hover:scale-[1.02] ${
                  isDark
                    ? 'bg-[#96CD7B] text-[#0A1610] hover:bg-white'
                    : 'bg-[#1C3727] text-white hover:bg-[#2A4D38]'
                }`}
              >
                Dashboard <ArrowRight size={14} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className={`hidden sm:inline-flex text-xs sm:text-sm px-3.5 py-2 font-medium transition-colors ${
                  isDark ? 'text-white/80 hover:text-white' : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                Sign in
              </Link>
<<<<<<< HEAD
              <button
                onClick={handleDashboardClick}
                className={`inline-flex items-center gap-1.5 rounded-full font-semibold text-xs sm:text-sm px-4 sm:px-5 py-2 transition-all cursor-pointer shadow-md hover:scale-[1.02] ${
                  isDark
                    ? 'bg-[#96CD7B] text-[#0A1610] hover:bg-white'
                    : 'bg-[#1C3727] text-white hover:bg-[#2A4D38]'
                }`}
=======
              <Link
                to={isLoggedIn ? '/app' : '/login'}
                className="inline-flex items-center gap-1.5 rounded-full bg-[#96CD7B] text-[#0A1610] font-semibold text-xs sm:text-sm px-4 sm:px-5 py-2 hover:bg-white transition-all cursor-pointer shadow-md hover:scale-[1.02]"
>>>>>>> f074206a79e5d5964495dfb7ae7c772cc365acf5
              >
                Begin <ArrowRight size={14} />
              </Link>
            </div>
          )}

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`md:hidden p-2 rounded-xl border focus:outline-none cursor-pointer ${
              isDark ? 'text-white bg-white/5 border-white/10' : 'text-[#0F2418] bg-[#EDE6D8] border-[#D4CBB8]'
            }`}
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className={`md:hidden border-b px-6 py-6 space-y-4 shadow-xl ${
          isDark ? 'bg-[#0E1E15]/95 border-white/10 text-white' : 'bg-[#FAF7F0]/98 border-[#E3DDD1] text-[#0F2418]'
        }`}>
          {[
            { href: '#hero', label: 'Explore' },
            { href: '#reviews', label: 'Community' },
            { href: '#journey', label: 'The Loop' },
            { href: '#pulse', label: 'Pulse AI' },
            { href: '#pricing', label: 'Pricing' },
          ].map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`block text-sm font-medium transition-colors ${
                isDark ? 'text-white/80 hover:text-[#96CD7B]' : 'text-[#3E5C48] hover:text-[#183B28]'
              }`}
            >
              {item.label}
            </a>
          ))}
          {isLoggedIn && (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleSignOut();
              }}
              className="block text-sm font-medium text-red-500 pt-2"
            >
              Sign out
            </button>
          )}
        </div>
      )}
    </header>
  );
}
