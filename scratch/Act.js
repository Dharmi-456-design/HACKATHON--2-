import { useState, useEffect } from "react";
import {
  Sparkles,
  Check,
  RefreshCw,
  Clock,
  Leaf,
  Shield,
  Flame,
  Globe,
  Droplets,
  Bird,
  Compass,
  Heart,
  Share2,
  Award,
  Zap,
  ArrowRight,
  Sun,
  FileText
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { apiFetch } from "../lib/api";
import { Badge, Card, Empty, ErrorBanner, Skeleton } from "../components/ui";
const ACT_TRANSLATIONS = {
  en: {
    heroTag: "ENVIRONMENTAL ACTION ENGINE",
    heroTitle: "Do What Fits",
    heroHighlight: "Your Time \u{1F343}",
    heroSubtitle: "Modest, local, high-impact actions. Scale suggestions to your window \u2014 two minutes to sixty minutes.",
    sliderLabel: "AVAILABLE TIME WINDOW",
    minutesSuffix: "Minutes",
    generateBtnTitle: "Generate Eco Actions",
    generateBtnSub: "Get personalized actions",
    tabSuggested: "Suggested Actions",
    tabCompleted: "Field Actions Log",
    completeActionBtn: "\u2713 I Did This Action",
    completedBadge: "Completed & Logged \u2713",
    impactTotal: "Total Impact Contributed",
    actionsDoneCount: "ECO ACTIONS DONE",
    minutesContributed: "MINUTES GIVEN TO NATURE"
  },
  gu: {
    heroTag: "\u0AAA\u0AB0\u0ACD\u0AAF\u0ABE\u0AB5\u0AB0\u0AA3\u0AC0\u0AAF \u0A95\u0ACD\u0AB0\u0ABF\u0AAF\u0ABE \u0A8F\u0AA8\u0ACD\u0A9C\u0ABF\u0AA8",
    heroTitle: "\u0AA4\u0AAE\u0ABE\u0AB0\u0ABE \u0AB8\u0AAE\u0AAF \u0A85\u0AA8\u0AC1\u0AB8\u0ABE\u0AB0",
    heroHighlight: "\u0A95\u0ABE\u0AB0\u0ACD\u0AAF \u0A95\u0AB0\u0ACB \u{1F343}",
    heroSubtitle: "\u0AB8\u0ACD\u0AA5\u0ABE\u0AA8\u0ABF\u0A95 \u0A85\u0AA8\u0AC7 \u0A89\u0A9A\u0ACD\u0A9A-\u0A85\u0AB8\u0AB0\u0A95\u0ABE\u0AB0\u0A95 \u0AAA\u0AB0\u0ACD\u0AAF\u0ABE\u0AB5\u0AB0\u0AA3\u0AC0\u0AAF \u0A95\u0ABE\u0AB0\u0ACD\u0AAF\u0ACB. \u0AE8 \u0AAE\u0ABF\u0AA8\u0ABF\u0A9F\u0AA5\u0AC0 \u0AEC\u0AE6 \u0AAE\u0ABF\u0AA8\u0ABF\u0A9F\u0AA8\u0ABE \u0A97\u0ABE\u0AB3\u0ABE\u0AAE\u0ABE\u0A82 \u0AB8\u0AC2\u0A9A\u0AA8\u0ACB \u0AAE\u0AC7\u0AB3\u0AB5\u0ACB.",
    sliderLabel: "\u0A89\u0AAA\u0AB2\u0AAC\u0ACD\u0AA7 \u0AB8\u0AAE\u0AAF \u0A97\u0ABE\u0AB3\u0ACB",
    minutesSuffix: "\u0AAE\u0ABF\u0AA8\u0ABF\u0A9F",
    generateBtnTitle: "\u0A87\u0A95\u0ACB \u0A95\u0ACD\u0AB0\u0ABF\u0AAF\u0ABE\u0A93 \u0A9C\u0AA8\u0AB0\u0AC7\u0A9F \u0A95\u0AB0\u0ACB",
    generateBtnSub: "\u0AB5\u0ACD\u0AAF\u0A95\u0ACD\u0AA4\u0ABF\u0A97\u0AA4 \u0AB8\u0AC2\u0A9A\u0AA8\u0ACB \u0AAE\u0AC7\u0AB3\u0AB5\u0ACB",
    tabSuggested: "\u0AB8\u0AC2\u0A9A\u0AB5\u0AC7\u0AB2 \u0A95\u0ACD\u0AB0\u0ABF\u0AAF\u0ABE\u0A93",
    tabCompleted: "\u0AAA\u0AC2\u0AB0\u0ACD\u0AA3 \u0A95\u0AB0\u0AC7\u0AB2 \u0A95\u0ABE\u0AB0\u0ACD\u0AAF\u0ACB",
    completeActionBtn: "\u2713 \u0AAE\u0AC7\u0A82 \u0A86 \u0A95\u0ABE\u0AB0\u0ACD\u0AAF \u0AAA\u0AC2\u0AB0\u0ACD\u0AA3 \u0A95\u0AB0\u0ACD\u0AAF\u0AC1\u0A82",
    completedBadge: "\u0AAA\u0AC2\u0AB0\u0ACD\u0AA3 \u0A95\u0AB0\u0ACD\u0AAF\u0AC1\u0A82 \u2713",
    impactTotal: "\u0A95\u0AC1\u0AB2 \u0AAF\u0ACB\u0A97\u0AA6\u0ABE\u0AA8 \u0A85\u0AB8\u0AB0",
    actionsDoneCount: "\u0AAA\u0AC2\u0AB0\u0ACD\u0AA3 \u0A95\u0AB0\u0AC7\u0AB2 \u0A95\u0ABE\u0AB0\u0ACD\u0AAF\u0ACB",
    minutesContributed: "\u0AAA\u0ACD\u0AB0\u0A95\u0AC3\u0AA4\u0ABF\u0AA8\u0AC7 \u0A86\u0AAA\u0AC7\u0AB2\u0AC0 \u0AAE\u0ABF\u0AA8\u0ABF\u0A9F\u0ACB"
  },
  hi: {
    heroTag: "\u092A\u0930\u094D\u092F\u093E\u0935\u0930\u0923 \u0915\u093E\u0930\u094D\u0930\u0935\u093E\u0908 \u0907\u0902\u091C\u0928",
    heroTitle: "\u0905\u092A\u0928\u0947 \u0938\u092E\u092F \u0915\u0947 \u0905\u0928\u0941\u0938\u093E\u0930",
    heroHighlight: "\u0915\u093E\u0930\u094D\u092F \u0915\u0930\u0947\u0902 \u{1F343}",
    heroSubtitle: "\u0938\u094D\u0925\u093E\u0928\u0940\u092F \u0914\u0930 \u0909\u091A\u094D\u091A-\u092A\u094D\u0930\u092D\u093E\u0935 \u0935\u093E\u0932\u0947 \u092A\u0930\u094D\u092F\u093E\u0935\u0930\u0923\u0940\u092F \u0915\u093E\u0930\u094D\u092F\u0964 2 \u092E\u093F\u0928\u091F \u0938\u0947 60 \u092E\u093F\u0928\u091F \u0915\u0940 \u0905\u0935\u0927\u093F \u092E\u0947\u0902 \u0938\u0941\u091D\u093E\u0935 \u092A\u094D\u0930\u093E\u092A\u094D\u0924 \u0915\u0930\u0947\u0902\u0964",
    sliderLabel: "\u0909\u092A\u0932\u092C\u094D\u0927 \u0938\u092E\u092F \u0938\u0940\u092E\u093E",
    minutesSuffix: "\u092E\u093F\u0928\u091F",
    generateBtnTitle: "\u0907\u0915\u094B \u0915\u093E\u0930\u094D\u0930\u0935\u093E\u0907\u092F\u093E\u0902 \u0909\u0924\u094D\u092A\u0928\u094D\u0928 \u0915\u0930\u0947\u0902",
    generateBtnSub: "\u0935\u094D\u092F\u0915\u094D\u0924\u093F\u0917\u0924 \u0938\u0941\u091D\u093E\u0935 \u092A\u094D\u0930\u093E\u092A\u094D\u0924 \u0915\u0930\u0947\u0902",
    tabSuggested: "\u0938\u0941\u091D\u093E\u090F \u0917\u090F \u0915\u093E\u0930\u094D\u092F",
    tabCompleted: "\u092A\u0942\u0930\u094D\u0923 \u0915\u093F\u090F \u0917\u090F \u0915\u093E\u0930\u094D\u092F",
    completeActionBtn: "\u2713 \u092E\u0948\u0902\u0928\u0947 \u092F\u0939 \u0915\u093E\u0930\u094D\u092F \u092A\u0942\u0930\u093E \u0915\u093F\u092F\u093E",
    completedBadge: "\u092A\u0942\u0930\u094D\u0923 \u0915\u093F\u092F\u093E \u0917\u092F\u093E \u2713",
    impactTotal: "\u0915\u0941\u0932 \u092F\u094B\u0917\u0926\u093E\u0928 \u092A\u094D\u0930\u092D\u093E\u0935",
    actionsDoneCount: "\u092A\u0942\u0930\u0947 \u0915\u093F\u090F \u0917\u090F \u0915\u093E\u0930\u094D\u092F",
    minutesContributed: "\u092A\u094D\u0930\u0915\u0943\u0924\u093F \u0915\u094B \u0926\u093F\u090F \u0917\u090F \u092E\u093F\u0928\u091F"
  }
};
export default function Act() {
  const { session } = useAuth();
  const lang = localStorage.getItem("pulse_chat_lang") || "en";
  const t = ACT_TRANSLATIONS[lang] || ACT_TRANSLATIONS.en;
  const token = session?.access_token;
  const toUiAction = (a) => ({
    id: a._id || a.id,
    title: a.title,
    category: a.category,
    minutes: a.minutes,
    status: a.status || "pending",
    image: a.image_url || "https://images.unsplash.com/photo-1511497584788-8767611136f6?auto=format&fit=crop&w=800&q=80",
    description: a.description,
    impactNote: a.impact_note || a.description
  });
  const [actions, setActions] = useState([]);
  const [minutes, setMinutes] = useState(15);
  const [isGenerating, setIsGenerating] = useState(false);
  const [flippedCardId, setFlippedCardId] = useState(null);
  const [activeTab, setActiveTab] = useState("suggested");
  const [actError, setActError] = useState("");
  useEffect(() => {
    if (!token) return;
    apiFetch("/api/actions", {}, token).then((list) => setActions(Array.isArray(list) ? list.map(toUiAction) : [])).catch(() => setActError(""));
  }, [token]);
  const completeAction = (id) => {
    setActError("");
    setActions((prev) => prev.map((a) => a.id === id ? { ...a, status: "completed" } : a));
    if (token && id && !String(id).startsWith("act-")) {
      apiFetch(`/api/actions/${id}`, { method: "PATCH", body: JSON.stringify({ status: "completed" }) }, token).catch(() => {
        setActError("Could not save that action to your log.");
      });
    }
  };
  const handleGenerateActions = async () => {
    setIsGenerating(true);
    setActError("");
    try {
      const created = await apiFetch(
        "/api/actions",
        {
          method: "POST",
          body: JSON.stringify({
            title: `Explore ${minutes}-Min Eco Observation`,
            category: "Habitat",
            minutes,
            status: "pending",
            description: `Dedicated ${minutes} minutes of field observation to document local shade canopy patterns.`,
            impact_note: "Helps map urban biodiversity corridors."
          })
        },
        token
      );
      if (created) {
        setActions((prev) => [typeof toUiAction === "function" ? toUiAction(created) : created, ...prev]);
      }
    } catch (err) {
      setActError(err instanceof Error ? err.message : "Pulse could not generate an action right now.");
    } finally {
      setIsGenerating(false);
    }
  };
  const { isDark } = useTheme();
  const pendingActions = actions.filter((a) => a.status !== "completed");
  const completedActions = actions.filter((a) => a.status === "completed");
  const totalMinutesGiven = completedActions.reduce((acc, b) => acc + b.minutes, 0);
  return /* @__PURE__ */ React.createElement("div", { className: `min-h-screen font-sans transition-colors duration-300 pb-24 relative overflow-hidden ${isDark ? "bg-[#040B06] text-slate-100 selection:bg-[#4ADE80]/30 selection:text-white" : "bg-[#FAF7F0] text-[#0F2418] selection:bg-emerald-200 selection:text-emerald-900"}` }, /* @__PURE__ */ React.createElement("div", { className: "max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8 relative z-10" }, /* @__PURE__ */ React.createElement("div", { className: "relative pt-6 pb-8 space-y-8" }, /* @__PURE__ */ React.createElement(
    "div",
    {
      className: "absolute -top-12 -left-12 -right-12 bottom-0 bg-cover bg-center pointer-events-none opacity-85",
      style: {
        backgroundImage: `url('https://images.unsplash.com/photo-1511497584788-8767611136f6?auto=format&fit=crop&w=1600&q=80')`,
        maskImage: "linear-gradient(to bottom, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.6) 65%, rgba(0,0,0,0) 100%)",
        WebkitMaskImage: "linear-gradient(to bottom, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.6) 65%, rgba(0,0,0,0) 100%)"
      }
    }
  ), /* @__PURE__ */ React.createElement("div", { className: `absolute -top-12 -left-12 -right-12 bottom-0 pointer-events-none ${isDark ? "bg-gradient-to-b from-[#040C07]/75 via-[#040C07]/80 to-[#040B06]" : "bg-gradient-to-b from-[#040C07]/60 via-[#040C07]/40 to-[#FAF7F0]"}` }), /* @__PURE__ */ React.createElement("div", { className: "relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6" }, /* @__PURE__ */ React.createElement("div", { className: "space-y-3 max-w-xl" }, /* @__PURE__ */ React.createElement("span", { className: "inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-[#4ADE80] bg-[#0E2015]/90 px-3.5 py-1 rounded-full border border-[#4ADE80]/40 backdrop-blur-md" }, /* @__PURE__ */ React.createElement(Leaf, { className: "w-3.5 h-3.5" }), t.heroTag), /* @__PURE__ */ React.createElement("h1", { className: "font-display text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight drop-shadow-md" }, t.heroTitle, " ", /* @__PURE__ */ React.createElement("br", null), /* @__PURE__ */ React.createElement("span", { className: "text-white" }, t.heroHighlight.split(" ")[0], " "), /* @__PURE__ */ React.createElement("span", { className: "text-[#4ADE80]" }, t.heroHighlight.split(" ")[1])), /* @__PURE__ */ React.createElement("p", { className: "text-xs sm:text-sm text-slate-200 font-normal leading-relaxed max-w-md drop-shadow" }, t.heroSubtitle)), /* @__PURE__ */ React.createElement("div", { className: "relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center shrink-0 z-10" }, /* @__PURE__ */ React.createElement(
    motion.div,
    {
      animate: { rotate: 360 },
      transition: { duration: 30, repeat: Infinity, ease: "linear" },
      className: "absolute inset-2 rounded-full border border-emerald-500/40 flex items-center justify-center"
    },
    /* @__PURE__ */ React.createElement("div", { className: "absolute top-1 w-1 h-3 bg-[#4ADE80]" }),
    /* @__PURE__ */ React.createElement("div", { className: "absolute bottom-1 w-1 h-3 bg-[#4ADE80]/40" }),
    /* @__PURE__ */ React.createElement("div", { className: "absolute left-1 w-3 h-1 bg-[#4ADE80]/40" }),
    /* @__PURE__ */ React.createElement("div", { className: "absolute right-1 w-3 h-1 bg-[#4ADE80]/40" }),
    /* @__PURE__ */ React.createElement("div", { className: "absolute top-6 right-8 w-2.5 h-2.5 rounded-full bg-[#4ADE80] shadow-[0_0_12px_#4ADE80]" })
  ), /* @__PURE__ */ React.createElement("div", { className: `w-48 h-48 sm:w-52 sm:h-52 rounded-full flex flex-col items-center justify-center text-center p-4 shadow-2xl backdrop-blur-md z-10 space-y-2 border ${isDark ? "bg-[#0E2015]/95 border-[#4ADE80]/40 text-white" : "bg-[#FDFBF7]/95 border-[#E3DDD1] text-[#0F2418] shadow-lg"}` }, /* @__PURE__ */ React.createElement(Leaf, { className: `w-5 h-5 ${isDark ? "text-[#4ADE80]" : "text-[#183B28]"}` }), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", { className: `text-[9px] uppercase font-bold tracking-wider ${isDark ? "text-slate-400" : "text-[#3E5C48]"}` }, t.actionsDoneCount), /* @__PURE__ */ React.createElement("p", { className: `font-display text-3xl font-black ${isDark ? "text-white" : "text-[#0F2418]"}` }, completedActions.length)), /* @__PURE__ */ React.createElement("div", { className: `w-12 h-px ${isDark ? "bg-[#20422E]" : "bg-[#E3DDD1]"}` }), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", { className: `text-[9px] uppercase font-bold tracking-wider ${isDark ? "text-slate-400" : "text-[#3E5C48]"}` }, t.minutesContributed), /* @__PURE__ */ React.createElement("p", { className: `font-display text-2xl font-black ${isDark ? "text-white" : "text-[#0F2418]"}` }, totalMinutesGiven, " ", /* @__PURE__ */ React.createElement("span", { className: `text-xs font-normal ${isDark ? "text-slate-400" : "text-[#3E5C48]"}` }, "MIN")))), /* @__PURE__ */ React.createElement(
    "img",
    {
      src: "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=400&q=80",
      alt: "",
      className: "absolute right-0 bottom-0 w-36 h-36 object-cover opacity-75 mix-blend-screen pointer-events-none filter drop-shadow-[0_0_20px_rgba(74,222,128,0.3)]"
    }
  ))), /* @__PURE__ */ React.createElement("div", { className: `relative z-10 pt-4 border-t space-y-6 ${isDark ? "border-[#20452F]/60" : "border-[#E3DDD1]"}` }, /* @__PURE__ */ React.createElement("div", { className: "flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", { className: `text-[11px] font-bold uppercase tracking-widest ${isDark ? "text-slate-400" : "text-[#3E5C48]"}` }, t.sliderLabel), /* @__PURE__ */ React.createElement("h3", { className: `font-display text-4xl sm:text-5xl font-black mt-1 ${isDark ? "text-white" : "text-[#0F2418]"}` }, minutes, " ", /* @__PURE__ */ React.createElement("span", { className: `font-normal text-2xl sm:text-3xl ${isDark ? "text-[#4ADE80]" : "text-[#183B28]"}` }, t.minutesSuffix))), /* @__PURE__ */ React.createElement(
    motion.button,
    {
      whileHover: { scale: 1.05 },
      whileTap: { scale: 0.95 },
      onClick: handleGenerateActions,
      disabled: isGenerating,
      className: "flex items-center gap-3 bg-transparent cursor-pointer group"
    },
    /* @__PURE__ */ React.createElement("div", { className: `w-14 h-14 rounded-full border flex items-center justify-center transition-all shadow-lg backdrop-blur-md ${isDark ? "bg-[#13271C]/90 border-[#4ADE80]/50 text-[#4ADE80] group-hover:bg-[#4ADE80] group-hover:text-black" : "bg-[#FDFBF7] border-[#C3DEC0] text-[#183B28] group-hover:bg-[#183B28] group-hover:text-white shadow-sm"}` }, /* @__PURE__ */ React.createElement(RefreshCw, { className: `w-6 h-6 ${isGenerating ? "animate-spin" : ""}` })),
    /* @__PURE__ */ React.createElement("div", { className: "text-left" }, /* @__PURE__ */ React.createElement("p", { className: `font-bold text-sm transition-colors ${isDark ? "text-white group-hover:text-[#4ADE80]" : "text-[#0F2418] group-hover:text-[#183B28]"}` }, t.generateBtnTitle), /* @__PURE__ */ React.createElement("p", { className: `text-[11px] ${isDark ? "text-slate-400" : "text-[#3E5C48]"}` }, t.generateBtnSub))
  )), /* @__PURE__ */ React.createElement("div", { className: "relative w-full py-4" }, /* @__PURE__ */ React.createElement("svg", { viewBox: "0 0 800 30", className: "w-full h-8 overflow-visible pointer-events-none" }, /* @__PURE__ */ React.createElement(
    "path",
    {
      d: "M 0 15 Q 200 25, 400 15 T 800 15",
      fill: "none",
      stroke: isDark ? "#20422E" : "#E0D8C8",
      strokeWidth: "3"
    }
  ), /* @__PURE__ */ React.createElement(
    "path",
    {
      d: `M 0 15 Q 200 25, ${minutes * 13} 15`,
      fill: "none",
      stroke: isDark ? "#4ADE80" : "#183B28",
      strokeWidth: "3",
      className: "filter drop-shadow-[0_0_8px_#4ADE80]"
    }
  )), /* @__PURE__ */ React.createElement(
    "input",
    {
      type: "range",
      min: 2,
      max: 60,
      value: minutes,
      onChange: (e) => setMinutes(Number(e.target.value)),
      className: "absolute inset-0 w-full opacity-0 cursor-pointer h-8"
    }
  ), /* @__PURE__ */ React.createElement(
    "div",
    {
      className: `absolute top-1/2 -translate-y-1/2 w-6 h-6 rounded-full border-4 shadow-md pointer-events-none transition-all ${isDark ? "bg-[#4ADE80] border-[#040B06] shadow-[0_0_15px_#4ADE80]" : "bg-[#183B28] border-white"}`,
      style: { left: `calc(${minutes / 60 * 95}% + 10px)` }
    }
  )))), /* @__PURE__ */ React.createElement("div", { className: `flex items-center gap-8 border-b pb-4 relative z-10 ${isDark ? "border-[#20452F]" : "border-[#E3DDD1]"}` }, /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setActiveTab("suggested"),
      className: `flex items-center gap-2 text-sm font-bold transition-all relative pb-2 cursor-pointer ${activeTab === "suggested" ? isDark ? "text-[#4ADE80]" : "text-[#183B28] font-extrabold" : isDark ? "text-slate-400 hover:text-white" : "text-[#3E5C48] hover:text-[#0F2418]"}`
    },
    /* @__PURE__ */ React.createElement(Leaf, { className: "w-4 h-4" }),
    /* @__PURE__ */ React.createElement("span", null, t.tabSuggested, " (", pendingActions.length, ")"),
    activeTab === "suggested" && /* @__PURE__ */ React.createElement(motion.div, { layoutId: "actTab", className: `absolute bottom-0 left-0 right-0 h-0.5 ${isDark ? "bg-[#4ADE80]" : "bg-[#183B28]"}` })
  ), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setActiveTab("completed"),
      className: `flex items-center gap-2 text-sm font-bold transition-all relative pb-2 cursor-pointer ${activeTab === "completed" ? isDark ? "text-[#4ADE80]" : "text-[#183B28] font-extrabold" : isDark ? "text-slate-400 hover:text-white" : "text-[#3E5C48] hover:text-[#0F2418]"}`
    },
    /* @__PURE__ */ React.createElement(FileText, { className: "w-4 h-4" }),
    /* @__PURE__ */ React.createElement("span", null, t.tabCompleted, " (", completedActions.length, ")"),
    activeTab === "completed" && /* @__PURE__ */ React.createElement(motion.div, { layoutId: "actTab", className: `absolute bottom-0 left-0 right-0 h-0.5 ${isDark ? "bg-[#4ADE80]" : "bg-[#183B28]"}` })
  )), activeTab === "suggested" && /* @__PURE__ */ React.createElement("div", { className: "relative z-10" }, actError && /* @__PURE__ */ React.createElement("div", { className: "mb-5 bg-red-500/15 border border-red-500/40 rounded-2xl px-4 py-3 text-xs text-red-500" }, actError), pendingActions.length === 0 && /* @__PURE__ */ React.createElement("div", { className: `border border-dashed rounded-3xl p-10 text-center space-y-3 ${isDark ? "bg-[#13271C] border-[#20422E]" : "bg-[#F2ECE1] border-[#E0D8C8]"}` }, /* @__PURE__ */ React.createElement("p", { className: "text-3xl" }, "\u{1F33F}"), /* @__PURE__ */ React.createElement("p", { className: `font-display text-lg font-bold ${isDark ? "text-white" : "text-[#0F2418]"}` }, "No suggested actions"), /* @__PURE__ */ React.createElement("p", { className: `text-xs max-w-sm mx-auto ${isDark ? "text-slate-400" : "text-[#3E5C48]"}` }, "Pick a time window above and generate an eco action to get started.")), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6" }, pendingActions.map((action) => {
    const isFlipped = flippedCardId === action.id;
    return /* @__PURE__ */ React.createElement(
      "div",
      {
        key: action.id,
        className: "perspective-1000 h-96 cursor-pointer",
        onMouseEnter: () => setFlippedCardId(action.id),
        onMouseLeave: () => setFlippedCardId(null)
      },
      /* @__PURE__ */ React.createElement(
        motion.div,
        {
          className: "w-full h-full relative transition-transform duration-500 transform-style-3d shadow-2xl rounded-3xl",
          animate: { rotateY: isFlipped ? 180 : 0 }
        },
        /* @__PURE__ */ React.createElement("div", { className: `absolute inset-0 backface-hidden rounded-3xl overflow-hidden flex flex-col justify-between border transition-colors ${isDark ? "bg-[#0E2015] border-[#20452F]" : "bg-[#FDFBF7] border-[#E3DDD1] shadow-sm"}` }, /* @__PURE__ */ React.createElement("div", { className: "relative h-44 overflow-hidden" }, /* @__PURE__ */ React.createElement(
          "img",
          {
            src: action.image,
            alt: action.title,
            className: "w-full h-full object-cover transition-transform duration-500 hover:scale-105"
          }
        ), /* @__PURE__ */ React.createElement("div", { className: "absolute top-3 left-3 flex gap-2" }, /* @__PURE__ */ React.createElement("span", { className: `px-3 py-1 rounded-full backdrop-blur-md text-[10px] font-bold border ${isDark ? "bg-[#07130B]/80 text-[#4ADE80] border-[#4ADE80]/40" : "bg-[#E1EFE0] text-[#183B28] border-[#C3DEC0]"}` }, action.category)), /* @__PURE__ */ React.createElement("span", { className: "absolute top-3 right-3 px-3 py-1 rounded-full bg-[#07130B]/80 backdrop-blur-md text-[10px] font-bold text-amber-300 border border-amber-400/40" }, "\u23F1\uFE0F ", action.minutes, " min")), /* @__PURE__ */ React.createElement("div", { className: "p-5 flex-1 flex flex-col justify-between space-y-3" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h3", { className: `font-display text-lg font-bold leading-tight ${isDark ? "text-white" : "text-[#0F2418]"}` }, action.title), /* @__PURE__ */ React.createElement("p", { className: `text-xs mt-2 line-clamp-2 leading-relaxed ${isDark ? "text-slate-300" : "text-[#3E5C48]"}` }, action.description)), /* @__PURE__ */ React.createElement(
          "button",
          {
            onClick: (e) => {
              e.stopPropagation();
              completeAction(action.id);
            },
            className: `w-full py-2.5 rounded-full font-bold text-xs transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer ${isDark ? "bg-[#4ADE80] text-[#07130B] hover:bg-[#3ECE77]" : "bg-[#183B28] text-[#FAF7F0] hover:bg-[#255239]"}`
          },
          /* @__PURE__ */ React.createElement(Check, { className: "w-4 h-4 stroke-[3]" }),
          /* @__PURE__ */ React.createElement("span", null, t.completeActionBtn)
        ))),
        /* @__PURE__ */ React.createElement("div", { className: `absolute inset-0 backface-hidden rotate-y-180 rounded-3xl p-6 flex flex-col justify-between border transition-colors ${isDark ? "bg-[#112318] border-[#4ADE80]/50 text-slate-200" : "bg-[#F2ECE1] border-[#E0D8C8] text-[#0F2418] shadow-sm"}` }, /* @__PURE__ */ React.createElement("div", { className: "space-y-3" }, /* @__PURE__ */ React.createElement("span", { className: `px-3 py-1 rounded-full text-xs font-bold ${isDark ? "bg-[#1A3827] text-[#4ADE80]" : "bg-[#E1EFE0] text-[#183B28]"}` }, "Eco Impact Analysis"), /* @__PURE__ */ React.createElement("h4", { className: `font-display text-base font-bold ${isDark ? "text-white" : "text-[#0F2418]"}` }, action.title), /* @__PURE__ */ React.createElement("p", { className: `text-xs italic leading-relaxed ${isDark ? "text-slate-300" : "text-[#2D4536]"}` }, '"', action.impactNote, '"')), /* @__PURE__ */ React.createElement("div", { className: `pt-2 border-t flex justify-between items-center text-[10px] ${isDark ? "border-[#20422E] text-slate-400" : "border-[#E0D8C8] text-[#3E5C48]"}` }, /* @__PURE__ */ React.createElement("span", null, "Real Field Action"), /* @__PURE__ */ React.createElement("span", { className: `font-bold ${isDark ? "text-[#4ADE80]" : "text-[#183B28]"}` }, "Nature Connection +15")))
      )
    );
  }))), activeTab === "completed" && /* @__PURE__ */ React.createElement("div", { className: "space-y-4 relative z-10" }, completedActions.map((action) => /* @__PURE__ */ React.createElement(
    "div",
    {
      key: action.id,
      className: `p-5 rounded-2xl flex items-center justify-between shadow-md border transition-colors ${isDark ? "bg-[#0E2015] border-[#4ADE80]/40 text-white" : "bg-[#FDFBF7] border-[#E3DDD1] text-[#0F2418]"}`
    },
    /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-4" }, /* @__PURE__ */ React.createElement("img", { src: action.image, alt: "", className: "w-14 h-14 rounded-xl object-cover" }), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h4", { className: `font-display text-base font-bold ${isDark ? "text-white" : "text-[#0F2418]"}` }, action.title), /* @__PURE__ */ React.createElement("p", { className: `text-xs ${isDark ? "text-slate-400" : "text-[#3E5C48]"}` }, action.category, " \xB7 ", action.minutes, " minutes"))),
    /* @__PURE__ */ React.createElement("span", { className: `px-3 py-1 rounded-full text-xs font-bold border ${isDark ? "bg-[#1A3827] text-[#4ADE80] border-[#4ADE80]/30" : "bg-[#E1EFE0] text-[#183B28] border-[#C3DEC0]"}` }, t.completedBadge)
  ))), /* @__PURE__ */ React.createElement("div", { className: "relative py-12 overflow-hidden pointer-events-none z-10" }, /* @__PURE__ */ React.createElement("div", { className: "relative w-full h-16 flex items-center justify-center" }, /* @__PURE__ */ React.createElement(
    motion.div,
    {
      animate: { opacity: [0.3, 0.9, 0.3], x: [-20, 20, -20] },
      transition: { duration: 4, repeat: Infinity, ease: "easeInOut" },
      className: "absolute left-1/4 top-2 w-2 h-2 rounded-full bg-emerald-300 shadow-[0_0_12px_#6EE7B7]"
    }
  ), /* @__PURE__ */ React.createElement(
    motion.div,
    {
      animate: { opacity: [0.4, 1, 0.4], x: [15, -15, 15] },
      transition: { duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 },
      className: "absolute left-1/2 top-8 w-2.5 h-2.5 rounded-full bg-amber-300 shadow-[0_0_14px_#FCD34D]"
    }
  ), /* @__PURE__ */ React.createElement(
    motion.div,
    {
      animate: { opacity: [0.2, 0.8, 0.2], x: [-10, 10, -10] },
      transition: { duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1 },
      className: "absolute right-1/4 top-3 w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_12px_#34D399]"
    }
  ), /* @__PURE__ */ React.createElement("svg", { viewBox: "0 0 1200 120", preserveAspectRatio: "none", className: "w-full h-full opacity-80" }, /* @__PURE__ */ React.createElement(
    "path",
    {
      d: "M 0 60 Q 300 10, 600 70 T 1200 40",
      fill: "none",
      stroke: "url(#waveGrad1)",
      strokeWidth: "3",
      className: "filter drop-shadow-[0_0_12px_rgba(74,222,128,0.5)]"
    }
  ), /* @__PURE__ */ React.createElement(
    "path",
    {
      d: "M 0 40 Q 300 90, 600 30 T 1200 80",
      fill: "none",
      stroke: "url(#waveGrad2)",
      strokeWidth: "1.5",
      strokeDasharray: "4 4",
      opacity: "0.7"
    }
  ), /* @__PURE__ */ React.createElement("defs", null, /* @__PURE__ */ React.createElement("linearGradient", { id: "waveGrad1", x1: "0", y1: "0", x2: "1", y2: "0" }, /* @__PURE__ */ React.createElement("stop", { offset: "0%", stopColor: "#040B06", stopOpacity: "0" }), /* @__PURE__ */ React.createElement("stop", { offset: "30%", stopColor: "#4ADE80", stopOpacity: "0.8" }), /* @__PURE__ */ React.createElement("stop", { offset: "70%", stopColor: "#22C55E", stopOpacity: "0.9" }), /* @__PURE__ */ React.createElement("stop", { offset: "100%", stopColor: "#040B06", stopOpacity: "0" })), /* @__PURE__ */ React.createElement("linearGradient", { id: "waveGrad2", x1: "0", y1: "0", x2: "1", y2: "0" }, /* @__PURE__ */ React.createElement("stop", { offset: "0%", stopColor: "#040B06", stopOpacity: "0" }), /* @__PURE__ */ React.createElement("stop", { offset: "40%", stopColor: "#A7F3D0", stopOpacity: "0.7" }), /* @__PURE__ */ React.createElement("stop", { offset: "80%", stopColor: "#4ADE80", stopOpacity: "0.6" }), /* @__PURE__ */ React.createElement("stop", { offset: "100%", stopColor: "#040B06", stopOpacity: "0" }))))))));
}
