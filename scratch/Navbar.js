import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Menu, X } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import { useAuth } from "../contexts/AuthContext";
export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const isLoggedIn = Boolean(user);
  const handleDashboardClick = (e) => {
    e.preventDefault();
    if (isLoggedIn) {
      navigate("/app");
    } else {
      navigate("/login");
    }
  };
  const handleSignOut = () => {
    logout();
    navigate("/login");
  };
  return /* @__PURE__ */ React.createElement("header", { className: "fixed top-0 left-0 right-0 z-[100] backdrop-blur-xl bg-[#0A1610]/90 border-b border-white/10 transition-all select-none" }, /* @__PURE__ */ React.createElement("div", { className: "w-full max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between" }, /* @__PURE__ */ React.createElement(Link, { to: "/", className: "flex items-center gap-3 group shrink-0" }, /* @__PURE__ */ React.createElement("div", { className: "relative" }, /* @__PURE__ */ React.createElement("div", { className: "absolute inset-0 bg-[#96CD7B]/20 rounded-xl blur-md group-hover:bg-[#96CD7B]/40 transition-colors" }), /* @__PURE__ */ React.createElement(
    "img",
    {
      src: "/logo.png",
      alt: "NaturePulse Logo",
      className: "relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl object-cover border border-white/20 shadow-md group-hover:scale-105 transition-transform"
    }
  )), /* @__PURE__ */ React.createElement("div", { className: "flex flex-col" }, /* @__PURE__ */ React.createElement("span", { className: "font-display text-xl sm:text-2xl font-bold tracking-tight text-white group-hover:text-[#96CD7B] transition-colors" }, "NaturePulse"), /* @__PURE__ */ React.createElement("span", { className: "text-[10px] text-[#96CD7B] font-mono font-semibold tracking-wider uppercase hidden sm:inline-block" }, "AI Nature Platform"))), /* @__PURE__ */ React.createElement("nav", { className: "hidden md:flex items-center gap-1 bg-white/5 border border-white/10 rounded-full px-3 py-1.5 backdrop-blur-md shadow-inner" }, /* @__PURE__ */ React.createElement(
    "a",
    {
      href: "#hero",
      className: "px-4 py-1.5 rounded-full text-xs font-medium text-white/80 hover:text-white hover:bg-white/10 transition-colors"
    },
    "Explore"
  ), /* @__PURE__ */ React.createElement(
    "a",
    {
      href: "#reviews",
      className: "px-4 py-1.5 rounded-full text-xs font-medium text-white/80 hover:text-white hover:bg-white/10 transition-colors"
    },
    "Community"
  ), /* @__PURE__ */ React.createElement(
    "a",
    {
      href: "#journey",
      className: "px-4 py-1.5 rounded-full text-xs font-medium text-white/80 hover:text-white hover:bg-white/10 transition-colors"
    },
    "The Loop"
  ), /* @__PURE__ */ React.createElement(
    "a",
    {
      href: "#pulse",
      className: "px-4 py-1.5 rounded-full text-xs font-medium text-white/80 hover:text-white hover:bg-white/10 transition-colors"
    },
    "Pulse AI"
  ), /* @__PURE__ */ React.createElement(
    "a",
    {
      href: "#pricing",
      className: "px-4 py-1.5 rounded-full text-xs font-medium text-white/80 hover:text-white hover:bg-white/10 transition-colors"
    },
    "Pricing"
  )), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-3" }, /* @__PURE__ */ React.createElement(ThemeToggle, null), isLoggedIn ? /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: handleSignOut,
      className: "hidden sm:inline-flex text-xs px-3 py-2 rounded-full border border-white/15 text-white/80 hover:text-red-300 hover:border-red-400/40 transition-colors font-medium cursor-pointer"
    },
    "Sign out"
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: handleDashboardClick,
      className: "inline-flex items-center gap-1.5 rounded-full bg-[#96CD7B] text-[#0A1610] font-semibold text-xs sm:text-sm px-4 sm:px-5 py-2 hover:bg-white transition-all cursor-pointer shadow-md hover:scale-[1.02]"
    },
    "Dashboard ",
    /* @__PURE__ */ React.createElement(ArrowRight, { size: 14 })
  )) : /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ React.createElement(
    Link,
    {
      to: "/login",
      className: "hidden sm:inline-flex text-xs sm:text-sm px-3.5 py-2 text-white/80 hover:text-white font-medium transition-colors"
    },
    "Sign in"
  ), /* @__PURE__ */ React.createElement(
    Link,
    {
      to: isLoggedIn ? "/app" : "/login",
      className: "inline-flex items-center gap-1.5 rounded-full bg-[#96CD7B] text-[#0A1610] font-semibold text-xs sm:text-sm px-4 sm:px-5 py-2 hover:bg-white transition-all cursor-pointer shadow-md hover:scale-[1.02]"
    },
    "Begin ",
    /* @__PURE__ */ React.createElement(ArrowRight, { size: 14 })
  )), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setMobileMenuOpen(!mobileMenuOpen),
      className: "md:hidden text-white p-2 rounded-xl bg-white/5 border border-white/10 focus:outline-none cursor-pointer",
      "aria-label": "Toggle Navigation"
    },
    mobileMenuOpen ? /* @__PURE__ */ React.createElement(X, { size: 20 }) : /* @__PURE__ */ React.createElement(Menu, { size: 20 })
  ))), mobileMenuOpen && /* @__PURE__ */ React.createElement("div", { className: "md:hidden bg-[#0E1E15]/95 border-b border-white/10 px-6 py-6 space-y-4 text-white" }, /* @__PURE__ */ React.createElement(
    "a",
    {
      href: "#hero",
      onClick: () => setMobileMenuOpen(false),
      className: "block text-sm font-medium text-white/80 hover:text-[#96CD7B]"
    },
    "Explore"
  ), /* @__PURE__ */ React.createElement(
    "a",
    {
      href: "#reviews",
      onClick: () => setMobileMenuOpen(false),
      className: "block text-sm font-medium text-white/80 hover:text-[#96CD7B]"
    },
    "Community"
  ), /* @__PURE__ */ React.createElement(
    "a",
    {
      href: "#journey",
      onClick: () => setMobileMenuOpen(false),
      className: "block text-sm font-medium text-white/80 hover:text-[#96CD7B]"
    },
    "The Loop"
  ), /* @__PURE__ */ React.createElement(
    "a",
    {
      href: "#pulse",
      onClick: () => setMobileMenuOpen(false),
      className: "block text-sm font-medium text-white/80 hover:text-[#96CD7B]"
    },
    "Pulse AI"
  ), /* @__PURE__ */ React.createElement(
    "a",
    {
      href: "#pricing",
      onClick: () => setMobileMenuOpen(false),
      className: "block text-sm font-medium text-white/80 hover:text-[#96CD7B]"
    },
    "Pricing"
  ), isLoggedIn && /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => {
        setMobileMenuOpen(false);
        handleSignOut();
      },
      className: "block text-sm font-medium text-red-400 pt-2"
    },
    "Sign out"
  )));
}
