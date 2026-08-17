import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Check, RefreshCw, MapPin, Clock, Leaf, Sun, Compass, Sparkles, Trophy, Flame } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { apiFetch, formatWhen } from "../lib/api";
import { Badge, Card, ConnectionRing, DimBars, GhostButton, PrimaryButton, Skeleton, TYPE_LABEL } from "../components/ui";
import BestTimeToExplore from "../components/BestTimeToExplore";
const SUNLIT_FOREST_IMG = "https://plus.unsplash.com/premium_photo-1667076649924-d784d205cbba?auto=format&fit=crop&w=1600&q=80";
export default function Dashboard() {
  const { session, user } = useAuth();
  const { isDark } = useTheme();
  const token = session?.access_token;
  const EMPTY_SCORE = { observe: 0, explore: 0, learn: 0, act: 0, return_dim: 0, overall: 0 };
  const [profile, setProfile] = useState(null);
  const [score, setScore] = useState(EMPTY_SCORE);
  const [missions, setMissions] = useState([]);
  const [places, setPlaces] = useState([]);
  const [discoveries, setDiscoveries] = useState([]);
  const [actions, setActions] = useState([]);
  const [streak, setStreak] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const load = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    setError("");
    let failed = 0;
    const safe = (promise) => Promise.resolve(promise).catch(() => {
      failed += 1;
      return null;
    });
    try {
      const [p, s, m, pl, d, a, st] = await Promise.all([
        safe(apiFetch("/api/profile", {}, token)),
        safe(apiFetch("/api/connection", {}, token)),
        safe(apiFetch("/api/missions", {}, token)),
        safe(apiFetch("/api/places")),
        safe(apiFetch("/api/discoveries", {}, token)),
        safe(apiFetch("/api/actions", {}, token)),
        safe(apiFetch("/api/streak", {}, token))
      ]);
      setProfile(p && typeof p === "object" ? p : null);
      setScore(s && typeof s === "object" && s.overall !== void 0 ? s : EMPTY_SCORE);
      setMissions(Array.isArray(m) ? m.map((x) => ({ ...x, id: x.id || x._id })) : []);
      setPlaces(Array.isArray(pl) ? pl.map((x) => ({ ...x, id: x.id || x._id })) : []);
      setDiscoveries(Array.isArray(d) ? d.map((x) => ({ ...x, id: x.id || x._id })) : []);
      setActions(Array.isArray(a) ? a.map((x) => ({ ...x, id: x.id || x._id })) : []);
      setStreak(st && typeof st === "object" && typeof st.streak === "number" ? st.streak : null);
      setError("");
    } catch {
      setError("");
    } finally {
      setLoading(false);
    }
  }, [token]);
  useEffect(() => {
    load();
  }, [load]);
  const safeMissions = Array.isArray(missions) ? missions : [];
  const today = (/* @__PURE__ */ new Date()).toISOString().slice(0, 10);
  const todayMissions = safeMissions.filter((m) => m && (m.scheduled_date === today || m.status !== "completed")).slice(0, 4);
  const featured = todayMissions[0] || safeMissions[0];
  const generate = async () => {
    setBusy(true);
    try {
      const data = await apiFetch("/api/missions", { method: "POST", body: JSON.stringify({ generate: true, force: true }) }, token);
      setMissions(Array.isArray(data) ? data.map((x) => ({ ...x, id: x.id || x._id })) : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Pulse could not write missions");
    } finally {
      setBusy(false);
    }
  };
  const complete = async (id) => {
    try {
      await apiFetch(`/api/missions/${id}`, { method: "PATCH", body: JSON.stringify({ status: "completed" }) }, token);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not complete");
    }
  };
  if (loading) {
    return /* @__PURE__ */ React.createElement("div", { className: `min-h-screen p-6 space-y-6 ${isDark ? "bg-[#040B06]" : "bg-[#F8F9FA]"}` }, /* @__PURE__ */ React.createElement(Skeleton, { className: "h-64 rounded-3xl" }), /* @__PURE__ */ React.createElement("div", { className: "grid lg:grid-cols-3 gap-6" }, /* @__PURE__ */ React.createElement(Skeleton, { className: "lg:col-span-2 h-96 rounded-3xl" }), /* @__PURE__ */ React.createElement(Skeleton, { className: "h-96 rounded-3xl" })));
  }
  const hour = (/* @__PURE__ */ new Date()).getHours();
  const greet = hour < 11 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const cardBg = isDark ? "bg-[#0E2015] border-[#20452F] text-slate-100" : "bg-[#FDFBF7] border-[#E3DDD1] text-[#0F2418] shadow-xl";
  const subCardBg = isDark ? "bg-[#07150C] border-[#20422E]" : "bg-[#F2ECE1] border-[#E0D8C8]";
  const accentText = isDark ? "text-[#4ADE80]" : "text-[#183B28]";
  return /* @__PURE__ */ React.createElement("div", { className: `min-h-screen font-sans transition-colors duration-300 pb-24 relative overflow-hidden ${isDark ? "bg-[#040B06] text-slate-100 selection:bg-[#4ADE80]/30 selection:text-white" : "bg-[#FAF7F0] text-[#0F2418] selection:bg-emerald-200 selection:text-emerald-900"}` }, /* @__PURE__ */ React.createElement("div", { className: "max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8 relative z-10" }, /* @__PURE__ */ React.createElement("div", { className: `relative border rounded-3xl p-6 sm:p-10 shadow-2xl overflow-hidden min-h-[280px] flex flex-col justify-between group ${isDark ? "border-[#20452F]" : "border-[#183B28]/20"}` }, /* @__PURE__ */ React.createElement(
    "div",
    {
      className: "absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105",
      style: { backgroundImage: `url('${SUNLIT_FOREST_IMG}')` }
    }
  ), /* @__PURE__ */ React.createElement("div", { className: `absolute inset-0 ${isDark ? "bg-gradient-to-r from-[#040C07] via-[#040C07]/85 to-[#040C07]/35" : "bg-gradient-to-r from-[#0E1E15]/90 via-[#0E1E15]/75 to-[#0E1E15]/25"}` }), /* @__PURE__ */ React.createElement("div", { className: "space-y-3 max-w-2xl relative z-10" }, /* @__PURE__ */ React.createElement("span", { className: `inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full border text-xs font-semibold backdrop-blur-md ${isDark ? "bg-[#0E2015]/90 text-[#4ADE80] border-[#4ADE80]/40" : "bg-emerald-950/80 text-emerald-300 border-emerald-400/40"}` }, /* @__PURE__ */ React.createElement(Leaf, { className: "w-3.5 h-3.5" }), "NATURE RELATIONSHIP DASHBOARD"), /* @__PURE__ */ React.createElement("h1", { className: "font-display text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight drop-shadow-md" }, greet, ", ", /* @__PURE__ */ React.createElement("span", { className: "text-[#4ADE80]" }, profile?.display_name || user?.email?.split("@")[0] || "Explorer")), /* @__PURE__ */ React.createElement("p", { className: "text-xs sm:text-sm text-slate-200 font-normal leading-relaxed drop-shadow" }, profile?.city ? `${profile.city}${profile.region ? ", " + profile.region : ""} \xB7 ` : "", "Discover what is around you, why it matters, and your ecological impact before sunset.")), /* @__PURE__ */ React.createElement("div", { className: "relative z-10 pt-4 flex flex-wrap items-center justify-between gap-4 border-t border-white/15" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-4 text-xs font-semibold text-slate-200" }, typeof streak === "number" && /* @__PURE__ */ React.createElement("span", { className: "flex items-center gap-1.5 text-amber-400" }, /* @__PURE__ */ React.createElement(Flame, { className: "w-4 h-4" }), " ", streak, " Day Streak"), /* @__PURE__ */ React.createElement("span", { className: "flex items-center gap-1.5 text-[#4ADE80]" }, /* @__PURE__ */ React.createElement(Trophy, { className: "w-4 h-4" }), " Level ", score.overall >= 80 ? 4 : score.overall >= 60 ? 3 : score.overall >= 40 ? 2 : 1, " Eco Explorer")), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: generate,
      disabled: busy,
      className: "px-5 py-2.5 rounded-full bg-[#4ADE80] text-[#07130B] font-bold text-xs hover:bg-[#3ECE77] transition-all shadow-lg flex items-center gap-2 cursor-pointer disabled:opacity-50"
    },
    /* @__PURE__ */ React.createElement(RefreshCw, { className: `w-3.5 h-3.5 ${busy ? "animate-spin" : ""}` }),
    /* @__PURE__ */ React.createElement("span", null, busy ? "Listening\u2026" : "New Missions")
  ))), error && /* @__PURE__ */ React.createElement("p", { className: "text-sm text-red-400 bg-red-950/50 border border-red-500/30 p-3 rounded-2xl" }, error), /* @__PURE__ */ React.createElement("div", { className: "relative z-10" }, /* @__PURE__ */ React.createElement(BestTimeToExplore, null)), /* @__PURE__ */ React.createElement("div", { className: "grid lg:grid-cols-3 gap-6 relative z-10" }, /* @__PURE__ */ React.createElement("div", { className: `lg:col-span-2 border rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between ${cardBg}` }, /* @__PURE__ */ React.createElement("div", { className: "relative h-56 sm:h-64 overflow-hidden group" }, /* @__PURE__ */ React.createElement(
    "img",
    {
      src: SUNLIT_FOREST_IMG,
      alt: "Sunlit Forest",
      className: "w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
    }
  ), /* @__PURE__ */ React.createElement("div", { className: `absolute inset-0 bg-gradient-to-t ${isDark ? "from-[#0E2015] via-[#0E2015]/40" : "from-slate-900 via-slate-900/40"} to-transparent` }), /* @__PURE__ */ React.createElement("div", { className: "absolute bottom-5 left-6 right-6 text-white space-y-1" }, /* @__PURE__ */ React.createElement("span", { className: "text-[10px] uppercase font-bold tracking-widest text-[#4ADE80] bg-[#07130B]/80 px-3 py-1 rounded-full border border-[#4ADE80]/30 backdrop-blur-md" }, "Today's Featured Mission"), /* @__PURE__ */ React.createElement("h2", { className: "font-display text-2xl sm:text-3xl font-bold mt-2" }, featured?.title || "Listen to Tree Canopy at Dawn"))), /* @__PURE__ */ React.createElement("div", { className: "p-6 space-y-4" }, featured ? /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("div", { className: "flex flex-wrap gap-2" }, /* @__PURE__ */ React.createElement(Badge, null, TYPE_LABEL[featured.mission_type] || featured.mission_type || "Exploration"), /* @__PURE__ */ React.createElement(Badge, { tone: "ink" }, /* @__PURE__ */ React.createElement(Clock, { size: 10, className: "mr-1 inline" }), " ", featured.duration_minutes || 15, " min"), /* @__PURE__ */ React.createElement(Badge, { tone: "gold" }, featured.status || "in_progress")), /* @__PURE__ */ React.createElement("p", { className: `text-xs sm:text-sm leading-relaxed ${isDark ? "text-slate-300" : "text-[#3E5C48]"}` }, featured.description || "Find a shaded Peepal or Banyan canopy and observe dawn birdsong frequency."), featured.why_it_matters && /* @__PURE__ */ React.createElement("p", { className: `text-xs italic leading-relaxed p-3 rounded-2xl border ${isDark ? "text-[#4ADE80] bg-[#07150C] border-[#20422E]" : "text-[#183B28] bg-[#E1EFE0] border-[#C3DEC0]"}` }, "\u201C", featured.why_it_matters, "\u201D"), /* @__PURE__ */ React.createElement("div", { className: `flex items-center gap-1.5 text-xs ${isDark ? "text-slate-400" : "text-[#3E5C48]"}` }, /* @__PURE__ */ React.createElement(MapPin, { size: 12, className: accentText }), /* @__PURE__ */ React.createElement("span", null, featured.location_hint || "Sabarmati Riverfront Park Sector B")), /* @__PURE__ */ React.createElement("div", { className: "pt-2 flex flex-wrap gap-3" }, featured.status !== "completed" && /* @__PURE__ */ React.createElement(PrimaryButton, { onClick: () => complete(featured.id) }, /* @__PURE__ */ React.createElement(Check, { size: 14 }), " Mark Mission Completed"), /* @__PURE__ */ React.createElement(Link, { to: "/app/lens", className: `inline-flex items-center gap-2 rounded-full border text-xs font-bold px-5 py-2.5 transition-all ${isDark ? "border-[#20422E] bg-[#13271C] text-white hover:bg-[#1A3827]" : "border-[#183B28] bg-[#E1EFE0] text-[#183B28] hover:bg-[#D4E8D2]"}` }, "Open Nature Lens"))) : /* @__PURE__ */ React.createElement("p", { className: "text-xs text-slate-400" }, 'No active missions right now. Click "New Missions" to generate.'))), /* @__PURE__ */ React.createElement("div", { className: `border rounded-3xl p-6 shadow-2xl flex flex-col items-center justify-between text-center space-y-4 ${cardBg}` }, /* @__PURE__ */ React.createElement("div", { className: "w-full text-left" }, /* @__PURE__ */ React.createElement("span", { className: `text-[10px] uppercase font-bold tracking-wider ${isDark ? "text-slate-400" : "text-[#3E5C48]"}` }, "Nature Connection"), /* @__PURE__ */ React.createElement("h3", { className: `font-display text-xl font-bold mt-0.5 ${isDark ? "text-white" : "text-[#0F2418]"}` }, "Ecological Score")), /* @__PURE__ */ React.createElement(ConnectionRing, { score }), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", { className: `font-display text-4xl font-extrabold ${isDark ? "text-white" : "text-[#0F2418]"}` }, score.overall, /* @__PURE__ */ React.createElement("span", { className: `text-lg font-normal ${isDark ? "text-slate-400" : "text-[#3E5C48]"}` }, "/100")), /* @__PURE__ */ React.createElement("p", { className: `text-xs font-semibold mt-1 ${accentText}` }, score.overall >= 80 ? "Commander Level 4" : score.overall >= 60 ? "Commander Level 3" : score.overall >= 40 ? "Commander Level 2" : "Commander Level 1")), /* @__PURE__ */ React.createElement(DimBars, { score })), /* @__PURE__ */ React.createElement("div", { className: `border rounded-3xl p-6 shadow-2xl space-y-4 ${cardBg}` }, /* @__PURE__ */ React.createElement("div", { className: `flex items-center justify-between border-b pb-3 ${isDark ? "border-[#20422E]" : "border-[#E3DDD1]"}` }, /* @__PURE__ */ React.createElement("h3", { className: `font-display text-lg font-bold ${isDark ? "text-white" : "text-[#0F2418]"}` }, "More For Today"), /* @__PURE__ */ React.createElement(Link, { to: "/app/missions", className: `text-xs hover:underline flex items-center gap-1 font-semibold ${accentText}` }, "All ", /* @__PURE__ */ React.createElement(ArrowRight, { size: 12 }))), /* @__PURE__ */ React.createElement("div", { className: "space-y-3" }, todayMissions.slice(1, 4).map((m) => /* @__PURE__ */ React.createElement("div", { key: m.id, className: `rounded-2xl border p-3.5 space-y-1 ${subCardBg}` }, /* @__PURE__ */ React.createElement("div", { className: "flex items-start justify-between gap-2" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", { className: `text-xs font-bold line-clamp-1 ${isDark ? "text-white" : "text-[#0F2418]"}` }, m.title), /* @__PURE__ */ React.createElement("p", { className: `text-[10px] mt-0.5 ${isDark ? "text-slate-400" : "text-[#3E5C48]"}` }, TYPE_LABEL[m.mission_type] || m.mission_type, " \xB7 ", m.duration_minutes, "m")), m.status !== "completed" && /* @__PURE__ */ React.createElement("button", { onClick: () => complete(m.id), className: `text-[10px] font-bold hover:underline shrink-0 ${accentText}` }, "Done")))), !todayMissions.slice(1).length && /* @__PURE__ */ React.createElement("p", { className: "text-xs text-slate-400" }, "Complete the featured mission to unlock more."))), /* @__PURE__ */ React.createElement("div", { className: `border rounded-3xl p-6 shadow-2xl space-y-4 ${cardBg}` }, /* @__PURE__ */ React.createElement("div", { className: `flex items-center justify-between border-b pb-3 ${isDark ? "border-[#20422E]" : "border-[#E3DDD1]"}` }, /* @__PURE__ */ React.createElement("h3", { className: `font-display text-lg font-bold ${isDark ? "text-white" : "text-[#0F2418]"}` }, "Nearby Nature"), /* @__PURE__ */ React.createElement(Link, { to: "/app/places", className: `text-xs hover:underline flex items-center gap-1 font-semibold ${accentText}` }, "Map ", /* @__PURE__ */ React.createElement(ArrowRight, { size: 12 }))), /* @__PURE__ */ React.createElement("div", { className: "space-y-3" }, places.slice(0, 3).map((p) => /* @__PURE__ */ React.createElement("div", { key: p.id, className: `flex items-center gap-3 border p-2.5 rounded-2xl ${subCardBg}` }, /* @__PURE__ */ React.createElement("img", { src: p.image_url || SUNLIT_FOREST_IMG, alt: "", className: "w-12 h-12 rounded-xl object-cover shrink-0" }), /* @__PURE__ */ React.createElement("div", { className: "min-w-0" }, /* @__PURE__ */ React.createElement("p", { className: `text-xs font-bold truncate ${isDark ? "text-white" : "text-[#0F2418]"}` }, p.name), /* @__PURE__ */ React.createElement("p", { className: `text-[10px] font-semibold ${accentText}` }, p.type, " \xB7 ", p.walk_minutes || 10, " min walk")))))), /* @__PURE__ */ React.createElement("div", { className: `border rounded-3xl p-6 shadow-2xl space-y-4 ${cardBg}` }, /* @__PURE__ */ React.createElement("div", { className: `flex items-center justify-between border-b pb-3 ${isDark ? "border-[#20422E]" : "border-[#E3DDD1]"}` }, /* @__PURE__ */ React.createElement("h3", { className: `font-display text-lg font-bold ${isDark ? "text-white" : "text-[#0F2418]"}` }, "Recent Discoveries"), /* @__PURE__ */ React.createElement(Link, { to: "/app/lens", className: `text-xs hover:underline flex items-center gap-1 font-semibold ${accentText}` }, "Lens ", /* @__PURE__ */ React.createElement(ArrowRight, { size: 12 }))), /* @__PURE__ */ React.createElement("div", { className: "space-y-3" }, discoveries.slice(0, 3).map((d) => /* @__PURE__ */ React.createElement("div", { key: d.id, className: `border p-3 rounded-2xl space-y-0.5 ${subCardBg}` }, /* @__PURE__ */ React.createElement("p", { className: `text-xs font-bold ${isDark ? "text-white" : "text-[#0F2418]"}` }, d.common_name), /* @__PURE__ */ React.createElement("p", { className: `text-[10px] ${isDark ? "text-slate-400" : "text-[#3E5C48]"}` }, d.category, " \xB7 ", formatWhen(d.created_at)))), !discoveries.length && /* @__PURE__ */ React.createElement("p", { className: "text-xs text-slate-400" }, "Photograph species nearby using Nature Lens."))), /* @__PURE__ */ React.createElement("div", { className: `lg:col-span-3 border rounded-3xl p-6 shadow-2xl space-y-4 ${cardBg}` }, /* @__PURE__ */ React.createElement("div", { className: `flex items-center justify-between border-b pb-3 ${isDark ? "border-[#20422E]" : "border-[#E3DDD1]"}` }, /* @__PURE__ */ React.createElement("h3", { className: `font-display text-lg font-bold ${isDark ? "text-white" : "text-[#0F2418]"}` }, "Environmental Action Engine"), /* @__PURE__ */ React.createElement(Link, { to: "/app/act", className: `text-xs hover:underline flex items-center gap-1 font-semibold ${accentText}` }, "Engine ", /* @__PURE__ */ React.createElement(ArrowRight, { size: 12 }))), /* @__PURE__ */ React.createElement("div", { className: "grid sm:grid-cols-2 lg:grid-cols-4 gap-3" }, actions.slice(0, 4).map((a) => /* @__PURE__ */ React.createElement("div", { key: a.id, className: `rounded-2xl border p-4 space-y-2 ${subCardBg}` }, /* @__PURE__ */ React.createElement("span", { className: `px-2.5 py-0.5 rounded-full text-[10px] font-bold ${isDark ? "bg-[#1A3827] text-[#4ADE80]" : "bg-[#E1EFE0] text-[#183B28]"}` }, a.category), /* @__PURE__ */ React.createElement("p", { className: `text-xs font-bold ${isDark ? "text-white" : "text-[#0F2418]"}` }, a.title), /* @__PURE__ */ React.createElement("p", { className: `text-[10px] ${isDark ? "text-slate-400" : "text-[#3E5C48]"}` }, a.minutes, " min \xB7 ", a.status))))))));
}
