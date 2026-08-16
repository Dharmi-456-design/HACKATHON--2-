import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Menu, X } from 'lucide-react';
import ThemeToggle from './ThemeToggle';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
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
    <header className="fixed top-0 left-0 right-0 z-[100] backdrop-blur-xl bg-[#0A1610]/90 border-b border-white/10 transition-all select-none">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between">
        
        {/* Leftmost Logo & Brand Title */}
        <Link to="/" className="flex items-center gap-3 group shrink-0">
          <div className="relative">
            <div className="absolute inset-0 bg-[#96CD7B]/20 rounded-xl blur-md group-hover:bg-[#96CD7B]/40 transition-colors" />
            <img
              src="/logo.png"
              alt="NaturePulse Logo"
              className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl object-cover border border-white/20 shadow-md group-hover:scale-105 transition-transform"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-display text-xl sm:text-2xl font-bold tracking-tight text-white group-hover:text-[#96CD7B] transition-colors">
              NaturePulse
            </span>
            <span className="text-[10px] text-[#96CD7B] font-mono font-semibold tracking-wider uppercase hidden sm:inline-block">
              AI Nature Platform
            </span>
          </div>
        </Link>

        {/* Center Pill Nav Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-1 bg-white/5 border border-white/10 rounded-full px-3 py-1.5 backdrop-blur-md shadow-inner">
          <a
            href="#hero"
            className="px-4 py-1.5 rounded-full text-xs font-medium text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            Explore
          </a>
          <a
            href="#reviews"
            className="px-4 py-1.5 rounded-full text-xs font-medium text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            Community
          </a>
          <a
            href="#journey"
            className="px-4 py-1.5 rounded-full text-xs font-medium text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            The Loop
          </a>
          <a
            href="#pulse"
            className="px-4 py-1.5 rounded-full text-xs font-medium text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            Pulse AI
          </a>
          <a
            href="#pricing"
            className="px-4 py-1.5 rounded-full text-xs font-medium text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            Pricing
          </a>
        </nav>

        {/* Right CTA Actions */}
        <div className="flex items-center gap-3">
          <ThemeToggle />

          {isLoggedIn ? (
            <div className="flex items-center gap-2">
              <button
                onClick={handleSignOut}
                className="hidden sm:inline-flex text-xs px-3 py-2 rounded-full border border-white/15 text-white/80 hover:text-red-300 hover:border-red-400/40 transition-colors font-medium cursor-pointer"
              >
                Sign out
              </button>
              <button
                onClick={handleDashboardClick}
                className="inline-flex items-center gap-1.5 rounded-full bg-[#96CD7B] text-[#0A1610] font-semibold text-xs sm:text-sm px-4 sm:px-5 py-2 hover:bg-white transition-all cursor-pointer shadow-md hover:scale-[1.02]"
              >
                Dashboard <ArrowRight size={14} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="hidden sm:inline-flex text-xs sm:text-sm px-3.5 py-2 text-white/80 hover:text-white font-medium transition-colors"
              >
                Sign in
              </Link>
              <button
                onClick={handleDashboardClick}
                className="inline-flex items-center gap-1.5 rounded-full bg-[#96CD7B] text-[#0A1610] font-semibold text-xs sm:text-sm px-4 sm:px-5 py-2 hover:bg-white transition-all cursor-pointer shadow-md hover:scale-[1.02]"
              >
                Begin <ArrowRight size={14} />
              </button>
            </div>
          )}

          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-white p-2 rounded-xl bg-white/5 border border-white/10 focus:outline-none cursor-pointer"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0E1E15]/95 border-b border-white/10 px-6 py-6 space-y-4 text-white">
          <a
            href="#hero"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-white/80 hover:text-[#96CD7B]"
          >
            Explore
          </a>
          <a
            href="#reviews"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-white/80 hover:text-[#96CD7B]"
          >
            Community
          </a>
          <a
            href="#journey"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-white/80 hover:text-[#96CD7B]"
          >
            The Loop
          </a>
          <a
            href="#pulse"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-white/80 hover:text-[#96CD7B]"
          >
            Pulse AI
          </a>
          <a
            href="#pricing"
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-medium text-white/80 hover:text-[#96CD7B]"
          >
            Pricing
          </a>
          {isLoggedIn && (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                handleSignOut();
              }}
              className="block text-sm font-medium text-red-400 pt-2"
            >
              Sign out
            </button>
          )}
        </div>
      )}
    </header>
  );
}
