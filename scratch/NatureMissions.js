import { useState, useEffect } from "react";
import {
  Sparkles,
  ShieldCheck,
  Trophy,
  Flame,
  Zap,
  Target,
  Clock,
  CheckCircle2,
  ChevronRight,
  Play,
  Plus,
  Trash2,
  X,
  Wand2,
  Compass,
  MapPin,
  Award,
  RotateCcw,
  ArrowLeft,
  Check,
  Layers,
  AlertCircle,
  BarChart2,
  Star,
  Radio,
  Leaf,
  Users,
  Feather,
  Trees,
  Crown
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../contexts/AuthContext";
import { useTheme } from "../contexts/ThemeContext";
import { apiFetch, formatWhen } from "../lib/api";
import { Badge, Card, Empty, ErrorBanner, Skeleton } from "../components/ui";
const MISSION_TRANSLATIONS = {
  en: {
    heroTag: "Good Morning, Explorer \u{1F33F}",
    heroTitle: "Your Eco Guide",
    heroHighlight: "Better Tomorrow",
    heroSubtitle1: "Ask. Learn. Protect.",
    heroSubtitle2: "Together we create a sustainable future.",
    createMissionBtn: "Create Custom Mission",
    generateAIBtn: "\u2728 Generate Challenge",
    tabPath: "\u{1F5FA}\uFE0F Mission Path",
    tabActive: "\u26A1 Active Missions",
    tabCompleted: "\u{1F3C6} Completed",
    tabCreate: "\u270D\uFE0F Custom Creator",
    catLearning: "\u{1F4DA} Learning",
    catProductivity: "\u26A1 Productivity",
    catCreativity: "\u{1F3A8} Creativity",
    catExploration: "\u{1F30D} Exploration",
    catGoals: "\u{1F3AF} Personal Goals",
    catAI: "\u{1F916} Challenges",
    diffEasy: "\u{1F7E2} Easy",
    diffMedium: "\u{1F7E1} Medium",
    diffHard: "\u{1F534} Hard",
    diffExpert: "\u{1F7E3} Expert",
    startMission: "Start Mission",
    continueMission: "Continue Mission",
    completeStep: "Mark Step Complete",
    missionCompleted: "Mission Completed! \u{1F389}",
    earnedXP: "XP Earned",
    levelTitle: "Level 4 Commander",
    xpLabel: "Eco XP",
    streakLabel: "Streak",
    aiAssistantHint: "Need a hint or breakdown for this step?",
    achievementsTitle: "\u{1F3C6} Ecological Milestone Badges",
    leaderboardTitle: "\u{1F310} Community Eco Leaderboard"
  },
  gu: {
    heroTag: "\u0AB6\u0AC1\u0AAD \u0AB8\u0AB5\u0ABE\u0AB0, \u0A8F\u0A95\u0ACD\u0AB8\u0AAA\u0ACD\u0AB2\u0ACB\u0AB0\u0AB0 \u{1F33F}",
    heroTitle: "\u0AA4\u0AAE\u0ABE\u0AB0\u0ACB \u0A87\u0A95\u0ACB \u0A97\u0ABE\u0A87\u0AA1",
    heroHighlight: "\u0A89\u0A9C\u0ACD\u0A9C\u0AB5\u0AB3 \u0AAD\u0AB5\u0ABF\u0AB7\u0ACD\u0AAF \u0AAE\u0ABE\u0A9F\u0AC7",
    heroSubtitle1: "\u0AAA\u0AC2\u0A9B\u0ACB. \u0AB6\u0AC0\u0A96\u0ACB. \u0AB0\u0A95\u0ACD\u0AB7\u0AA3 \u0A95\u0AB0\u0ACB.",
    heroSubtitle2: "\u0AB8\u0ABE\u0AA5\u0AC7 \u0AAE\u0AB3\u0AC0\u0AA8\u0AC7 \u0A86\u0AAA\u0AA3\u0AC7 \u0A8F\u0A95 \u0A9F\u0A95\u0ABE\u0A89 \u0AAD\u0AB5\u0ABF\u0AB7\u0ACD\u0AAF \u0AAC\u0AA8\u0ABE\u0AB5\u0AC0\u0A8F \u0A9B\u0AC0\u0A8F.",
    createMissionBtn: "\u0A95\u0AB8\u0ACD\u0A9F\u0AAE \u0AAE\u0ABF\u0AB6\u0AA8 \u0AAC\u0AA8\u0ABE\u0AB5\u0ACB",
    generateAIBtn: "\u2728 \u0AAA\u0AA1\u0A95\u0ABE\u0AB0 \u0A9C\u0AA8\u0AB0\u0AC7\u0A9F \u0A95\u0AB0\u0ACB",
    tabPath: "\u{1F5FA}\uFE0F \u0AAE\u0ABF\u0AB6\u0AA8 \u0AAA\u0ABE\u0AA5",
    tabActive: "\u26A1 \u0AB8\u0A95\u0ACD\u0AB0\u0ABF\u0AAF \u0AAE\u0ABF\u0AB6\u0AA8\u0ACB",
    tabCompleted: "\u{1F3C6} \u0AAA\u0AC2\u0AB0\u0ACD\u0AA3 \u0A95\u0AB0\u0AC7\u0AB2",
    tabCreate: "\u270D\uFE0F \u0A95\u0AB8\u0ACD\u0A9F\u0AAE \u0A95\u0ACD\u0AB0\u0ABF\u0A8F\u0A9F\u0AB0",
    catLearning: "\u{1F4DA} \u0AB6\u0ABF\u0A95\u0ACD\u0AB7\u0AA3",
    catProductivity: "\u26A1 \u0A89\u0AA4\u0ACD\u0AAA\u0ABE\u0AA6\u0A95\u0AA4\u0ABE",
    catCreativity: "\u{1F3A8} \u0AB8\u0AB0\u0ACD\u0A9C\u0AA8\u0ABE\u0AA4\u0ACD\u0AAE\u0A95\u0AA4\u0ABE",
    catExploration: "\u{1F30D} \u0AB8\u0A82\u0AB6\u0ACB\u0AA7\u0AA8",
    catGoals: "\u{1F3AF} \u0AB2\u0A95\u0ACD\u0AB7\u0ACD\u0AAF\u0ACB",
    catAI: "\u{1F916} \u0AAA\u0AA1\u0A95\u0ABE\u0AB0\u0ACB",
    diffEasy: "\u{1F7E2} \u0AB8\u0AB0\u0AB3",
    diffMedium: "\u{1F7E1} \u0AAE\u0AA7\u0ACD\u0AAF\u0AAE",
    diffHard: "\u{1F534} \u0A95\u0AA0\u0ABF\u0AA8",
    diffExpert: "\u{1F7E3} \u0AA8\u0ABF\u0AB7\u0ACD\u0AA3\u0ABE\u0AA4",
    startMission: "\u0AAE\u0ABF\u0AB6\u0AA8 \u0AB6\u0AB0\u0AC2 \u0A95\u0AB0\u0ACB",
    continueMission: "\u0A9A\u0ABE\u0AB2\u0AC1 \u0AB0\u0ABE\u0A96\u0ACB",
    completeStep: "\u0AAA\u0A97\u0AB2\u0AC1\u0A82 \u0AAA\u0AC2\u0AB0\u0ACD\u0AA3 \u0AAE\u0ABE\u0AB0\u0ACD\u0A95 \u0A95\u0AB0\u0ACB",
    missionCompleted: "\u0AAE\u0ABF\u0AB6\u0AA8 \u0AAA\u0AC2\u0AB0\u0ACD\u0AA3 \u0AA5\u0AAF\u0AC1\u0A82! \u{1F389}",
    earnedXP: "XP \u0AAE\u0AC7\u0AB3\u0AB5\u0ACD\u0AAF\u0AC1\u0A82",
    levelTitle: "\u0AB2\u0AC7\u0AB5\u0AB2 4 \u0A95\u0AAE\u0ABE\u0AA8\u0ACD\u0AA1\u0AB0",
    xpLabel: "\u0A87\u0A95\u0ACB XP",
    streakLabel: "\u0AB6\u0ACD\u0AB0\u0AC7\u0AA3\u0AC0",
    aiAssistantHint: "\u0A86 \u0AAA\u0A97\u0AB2\u0ABE \u0AAE\u0ABE\u0A9F\u0AC7 \u0AB8\u0A82\u0A95\u0AC7\u0AA4 \u0A9C\u0ACB\u0A88\u0A8F \u0A9B\u0AC7?",
    achievementsTitle: "\u{1F3C6} \u0A87\u0A95\u0ACB\u0AB2\u0ACB\u0A9C\u0AC0\u0A95\u0AB2 \u0AB8\u0ABF\u0AA6\u0ACD\u0AA7\u0ABF \u0AAC\u0AC7\u0A9C",
    leaderboardTitle: "\u{1F310} \u0A95\u0AAE\u0ACD\u0AAF\u0AC1\u0AA8\u0ABF\u0A9F\u0AC0 \u0AB2\u0AC0\u0AA1\u0AB0\u0AAC\u0ACB\u0AB0\u0ACD\u0AA1"
  },
  hi: {
    heroTag: "\u0936\u0941\u092D \u092A\u094D\u0930\u092D\u093E\u0924, \u090F\u0915\u094D\u0938\u092A\u094D\u0932\u094B\u0930\u0930 \u{1F33F}",
    heroTitle: "\u0906\u092A\u0915\u093E \u0907\u0915\u094B \u0917\u093E\u0907\u0921",
    heroHighlight: "\u092C\u0947\u0939\u0924\u0930 \u0915\u0932 \u0915\u0947 \u0932\u093F\u090F",
    heroSubtitle1: "\u092A\u0942\u091B\u0947\u0902\u0964 \u0938\u0940\u0916\u0947\u0902\u0964 \u0930\u0915\u094D\u0937\u093E \u0915\u0930\u0947\u0902\u0964",
    heroSubtitle2: "\u0938\u093E\u0925 \u092E\u093F\u0932\u0915\u0930 \u0939\u092E \u090F\u0915 \u091F\u093F\u0915\u093E\u090A \u092D\u0935\u093F\u0937\u094D\u092F \u092C\u0928\u093E\u0924\u0947 \u0939\u0948\u0902\u0964",
    createMissionBtn: "\u0915\u0938\u094D\u091F\u092E \u092E\u093F\u0936\u0928 \u092C\u0928\u093E\u090F\u0902",
    generateAIBtn: "\u2728 \u091A\u0941\u0928\u094C\u0924\u0940 \u092C\u0928\u093E\u090F\u0902",
    tabPath: "\u{1F5FA}\uFE0F \u092E\u093F\u0936\u0928 \u092A\u0925",
    tabActive: "\u26A1 \u0938\u0915\u094D\u0930\u093F\u092F \u092E\u093F\u0936\u0928",
    tabCompleted: "\u{1F3C6} \u092A\u0942\u0930\u093E \u0915\u093F\u092F\u093E \u0917\u092F\u093E",
    tabCreate: "\u270D\uFE0F \u0915\u0938\u094D\u091F\u092E \u0915\u094D\u0930\u093F\u090F\u091F\u0930",
    catLearning: "\u{1F4DA} \u0938\u0940\u0916\u0928\u093E",
    catProductivity: "\u26A1 \u0909\u0924\u094D\u092A\u093E\u0926\u0915\u0924\u093E",
    catCreativity: "\u{1F3A8} \u0930\u091A\u0928\u093E\u0924\u094D\u092E\u0915\u0924\u093E",
    catExploration: "\u{1F30D} \u0916\u094B\u091C",
    catGoals: "\u{1F3AF} \u0935\u094D\u092F\u0915\u094D\u0924\u093F\u0917\u0924 \u0932\u0915\u094D\u0937\u094D\u092F",
    catAI: "\u{1F916} \u091A\u0941\u0928\u094C\u0924\u093F\u092F\u093E\u0902",
    diffEasy: "\u{1F7E2} \u0906\u0938\u093E\u0928",
    diffMedium: "\u{1F7E1} \u092E\u0927\u094D\u092F\u092E",
    diffHard: "\u{1F534} \u0915\u0920\u093F\u0928",
    diffExpert: "\u{1F7E3} \u0935\u093F\u0936\u0947\u0937\u091C\u094D\u091E",
    startMission: "\u092E\u093F\u0936\u0928 \u0936\u0941\u0930\u0942 \u0915\u0930\u0947\u0902",
    continueMission: "\u091C\u093E\u0930\u0940 \u0930\u0916\u0947\u0902",
    completeStep: "\u091A\u0930\u0923 \u092A\u0942\u0930\u093E \u091A\u093F\u0939\u094D\u0928\u093F\u0924 \u0915\u0930\u0947\u0902",
    missionCompleted: "\u092E\u093F\u0936\u0928 \u092A\u0942\u0930\u093E \u0939\u0941\u0906! \u{1F389}",
    earnedXP: "XP \u0905\u0930\u094D\u091C\u093F\u0924",
    levelTitle: "\u0932\u0947\u0935\u0932 4 \u0915\u092E\u093E\u0902\u0921\u0930",
    xpLabel: "\u0907\u0915\u094B XP",
    streakLabel: "\u0938\u094D\u091F\u094D\u0930\u0940\u0915",
    aiAssistantHint: "\u0907\u0938 \u091A\u0930\u0923 \u0915\u0947 \u0932\u093F\u090F \u0938\u0902\u0915\u0947\u0924 \u091A\u093E\u0939\u093F\u090F?",
    achievementsTitle: "\u{1F3C6} \u092A\u093E\u0930\u093F\u0938\u094D\u0925\u093F\u0924\u093F\u0915 \u0909\u092A\u0932\u092C\u094D\u0927\u093F \u092C\u0948\u091C",
    leaderboardTitle: "\u{1F310} \u0915\u092E\u094D\u092F\u0941\u0928\u093F\u091F\u0940 \u0932\u0940\u0921\u0930\u092C\u094B\u0930\u094D\u0921"
  }
};
export default function NatureMissions() {
  const { session, user } = useAuth();
  const lang = localStorage.getItem("pulse_chat_lang") || "en";
  const t = MISSION_TRANSLATIONS[lang] || MISSION_TRANSLATIONS.en;
  const token = session?.access_token;
  const toUiMission = (m) => {
    const type = m.mission_type || "explore";
    const status = m.status || "not_started";
    const xpReward = type === "learn" ? 250 : type === "explore" ? 180 : type === "act" ? 200 : 100;
    const categoryMap = { observe: "Exploration", explore: "Learning", learn: "Challenges", act: "Personal Goals" };
    const difficulty = !m.duration_minutes ? "Medium" : m.duration_minutes <= 10 ? "Easy" : m.duration_minutes <= 20 ? "Medium" : "Hard";
    const steps = Array.isArray(m.steps) && m.steps.length ? m.steps : [
      { id: `${m._id || m.id}-s1`, text: m.description || m.title, done: status === "completed" },
      { id: `${m._id || m.id}-s2`, text: m.why_it_matters ? `Reflect: ${m.why_it_matters}` : "Log your observations in Nature Pulse", done: status === "completed" },
      { id: `${m._id || m.id}-s3`, text: "Share your findings with the community", done: status === "completed" }
    ];
    return {
      id: m._id || m.id,
      title: m.title,
      category: categoryMap[type] || "Exploration",
      difficulty,
      duration: m.duration_minutes ? `${m.duration_minutes} min` : "15 min",
      xpReward,
      status,
      steps,
      aiHint: m.location_hint || "Stay observant of micro-climate shifts near foliage."
    };
  };
  const [missions, setMissions] = useState([]);
  const [totalXP, setTotalXP] = useState(0);
  const [streakDays, setStreakDays] = useState(0);
  const [activeTab, setActiveTab] = useState("path");
  const [selectedMission, setSelectedMission] = useState(null);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [generatePrompt, setGeneratePrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [missionError, setMissionError] = useState("");
  const [customTitle, setCustomTitle] = useState("");
  const [customCategory, setCustomCategory] = useState("Exploration");
  const [customDifficulty, setCustomDifficulty] = useState("Easy");
  useEffect(() => {
    if (!token) return;
    Promise.all([
      apiFetch("/api/missions", {}, token),
      apiFetch("/api/streak", {}, token)
    ]).then(([list, streakData]) => {
      const ui = Array.isArray(list) ? list.map(toUiMission) : [];
      setMissions(ui);
      setTotalXP(ui.filter((m) => m.status === "completed").reduce((sum, m) => sum + m.xpReward, 0));
      if (streakData && typeof streakData.streak === "number") setStreakDays(streakData.streak);
    }).catch(() => setMissionError(""));
  }, [token]);
  const pushMissionStatus = (mission) => {
    if (!token || !mission.id || String(mission.id).startsWith("m-")) return;
    apiFetch(`/api/missions/${mission.id}`, { method: "PATCH", body: JSON.stringify({ status: mission.status }) }, token).catch(() => {
      setMissionError("Your mission progress could not be saved. Please check your connection and try again.");
    });
  };
  const toggleStep = (missionId, stepId) => {
    setMissions(
      (prev) => prev.map((m) => {
        if (m.id !== missionId) return m;
        const updatedSteps = m.steps.map((s) => s.id === stepId ? { ...s, done: !s.done } : s);
        const allDone = updatedSteps.every((s) => s.done);
        const nextStatus = allDone ? "completed" : "in_progress";
        if (allDone && m.status !== "completed") {
          setTotalXP((xp) => xp + m.xpReward);
        }
        const updatedMission = { ...m, steps: updatedSteps, status: nextStatus };
        pushMissionStatus(updatedMission);
        if (selectedMission?.id === missionId) setSelectedMission(updatedMission);
        return updatedMission;
      })
    );
  };
  const handleGenerateAIMission = async (e) => {
    e.preventDefault();
    if (!generatePrompt.trim()) return;
    setIsGenerating(true);
    setMissionError("");
    try {
      const created = await apiFetch(
        "/api/missions",
        { method: "POST", body: JSON.stringify({ generate: true, count: 1, minutes: 15 }) },
        token
      );
      const list = Array.isArray(created) ? created : [created];
      const uiMissions = list.map(toUiMission);
      setMissions((prev) => [...uiMissions, ...prev]);
      setSelectedMission(uiMissions[0]);
      setShowGenerateModal(false);
      setGeneratePrompt("");
    } catch (err) {
      setMissionError(err instanceof Error ? err.message : "Pulse could not generate a mission right now.");
    } finally {
      setIsGenerating(false);
    }
  };
  const handleCreateCustomMission = async (e) => {
    e.preventDefault();
    if (!customTitle.trim()) return;
    setMissionError("");
    const typeMap = { Exploration: "observe", Learning: "explore", Creativity: "learn", "Personal Goals": "act" };
    const duration = customDifficulty === "\u{1F534} Hard" ? 25 : customDifficulty === "\u{1F7E1} Medium" ? 15 : 10;
    const xpReward = customDifficulty === "\u{1F534} Hard" ? 250 : customDifficulty === "\u{1F7E1} Medium" ? 180 : 100;
    const newMission = {
      id: `m-${Date.now()}`,
      title: customTitle.trim(),
      category: customCategory,
      difficulty: customDifficulty,
      duration: `${duration} min`,
      xpReward,
      status: "in_progress",
      steps: [
        { id: `${Date.now()}-cs1`, text: "Prepare observation area and tools", done: false },
        { id: `${Date.now()}-cs2`, text: "Execute main mission objective", done: false },
        { id: `${Date.now()}-cs3`, text: "Record final reflection note", done: false }
      ],
      aiHint: "Stay observant of micro-climate shifts near foliage."
    };
    setMissions([newMission, ...missions]);
    setCustomTitle("");
    setActiveTab("path");
    setSelectedMission(newMission);
    if (token) {
      try {
        const created = await apiFetch(
          "/api/missions",
          {
            method: "POST",
            body: JSON.stringify({
              title: customTitle.trim(),
              description: customTitle.trim(),
              mission_type: typeMap[customCategory] || "explore",
              duration_minutes: duration,
              status: "in_progress"
            })
          },
          token
        );
        setMissions((prev) => [toUiMission(created), ...prev.filter((m) => m.id !== newMission.id)]);
        setSelectedMission(toUiMission(created));
      } catch (err) {
        setMissionError(err instanceof Error ? err.message : "Could not create mission.");
      }
    }
  };
  const handleDeleteMission = (missionId) => {
    setMissions((prev) => prev.filter((m) => m.id !== missionId));
    if (selectedMission?.id === missionId) setSelectedMission(null);
    if (token && missionId && !String(missionId).startsWith("m-")) {
      apiFetch(`/api/missions/${missionId}`, { method: "DELETE" }, token).catch(() => {
        setMissionError("The mission could not be deleted. Please check your connection and try again.");
      });
    }
  };
  const completedCount = missions.filter((m) => m.status === "completed").length;
  const badges = [
    { id: "b1", name: "First Steps", icon: "\u{1F331}", unlocked: completedCount >= 1, desc: "Complete your first mission" },
    { id: "b2", name: "Canopy Guardian", icon: "\u{1F33F}", unlocked: completedCount >= 3, desc: "Complete 3 missions" },
    { id: "b3", name: "Pollinator Protector", icon: "\u{1F98B}", unlocked: completedCount >= 5, desc: "Complete 5 missions" },
    { id: "b4", name: "Master Eco Scholar", icon: "\u{1F451}", unlocked: completedCount >= 10, desc: "Complete 10 missions" }
  ];
  const impactStats = [
    { rank: 1, name: user?.name || "You", xp: `${totalXP.toLocaleString()} XP`, streak: `${streakDays} Day${streakDays === 1 ? "" : "s"}`, badge: "Your Mission Path" }
  ];
  const { isDark } = useTheme();
  return /* @__PURE__ */ React.createElement("div", { className: `min-h-screen font-sans transition-colors duration-300 pb-24 relative overflow-hidden ${isDark ? "bg-[#040B06] text-slate-100 selection:bg-[#4ADE80]/30 selection:text-white" : "bg-[#FAF7F0] text-[#0F2418] selection:bg-emerald-200 selection:text-emerald-900"}` }, /* @__PURE__ */ React.createElement(AnimatePresence, null, showGenerateModal && /* @__PURE__ */ React.createElement(
    motion.div,
    {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
      className: "fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4",
      onClick: () => setShowGenerateModal(false)
    },
    /* @__PURE__ */ React.createElement(
      motion.div,
      {
        initial: { scale: 0.9, y: 20 },
        animate: { scale: 1, y: 0 },
        exit: { scale: 0.9, y: 20 },
        className: `rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 border transition-colors ${isDark ? "bg-[#112318] border-[#4ADE80]/40 text-white" : "bg-[#FDFBF7] border-[#E3DDD1] text-[#0F2418] shadow-sm"}`,
        onClick: (e) => e.stopPropagation()
      },
      /* @__PURE__ */ React.createElement("div", { className: `flex justify-between items-center border-b pb-3 ${isDark ? "border-[#20452F]" : "border-[#E3DDD1]"}` }, /* @__PURE__ */ React.createElement("h3", { className: `font-display text-xl font-bold flex items-center gap-2 ${isDark ? "text-white" : "text-[#0F2418]"}` }, /* @__PURE__ */ React.createElement(Zap, { className: `w-5 h-5 ${isDark ? "text-[#4ADE80]" : "text-[#183B28]"}` }), /* @__PURE__ */ React.createElement("span", null, "Generate Challenge")), /* @__PURE__ */ React.createElement("button", { onClick: () => setShowGenerateModal(false), className: `cursor-pointer ${isDark ? "text-slate-400 hover:text-white" : "text-[#3E5C48] hover:text-[#0F2418]"}` }, /* @__PURE__ */ React.createElement(X, { className: "w-5 h-5" }))),
      /* @__PURE__ */ React.createElement("form", { onSubmit: handleGenerateAIMission, className: "space-y-4" }, missionError && /* @__PURE__ */ React.createElement("div", { className: "bg-red-500/15 border border-red-500/40 rounded-2xl px-4 py-3 text-xs text-red-500" }, missionError), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: `block text-xs uppercase tracking-wider mb-1 font-semibold ${isDark ? "text-slate-400" : "text-[#3E5C48]"}` }, "Challenge Idea or Goal"), /* @__PURE__ */ React.createElement(
        "textarea",
        {
          required: true,
          rows: 3,
          value: generatePrompt,
          onChange: (e) => setGeneratePrompt(e.target.value),
          placeholder: "e.g., Learn how swallowtail butterflies find urban flowering plants...",
          className: `w-full rounded-2xl p-3.5 text-xs sm:text-sm outline-none resize-none transition-colors border ${isDark ? "bg-[#0E2015] border-[#20422E] text-white focus:border-[#4ADE80]" : "bg-[#F2ECE1] border-[#E0D8C8] text-[#0F2418] focus:border-[#183B28]"}`
        }
      )), /* @__PURE__ */ React.createElement(
        "button",
        {
          type: "submit",
          disabled: isGenerating,
          className: `w-full py-3 rounded-full font-bold text-sm cursor-pointer shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 transition-all ${isDark ? "bg-[#4ADE80] text-[#07130B] hover:bg-[#3ECE77]" : "bg-[#183B28] text-[#FAF7F0] hover:bg-[#255239]"}`
        },
        /* @__PURE__ */ React.createElement(Zap, { className: "w-4 h-4" }),
        /* @__PURE__ */ React.createElement("span", null, isGenerating ? "Synthesizing Mission\u2026" : "Generate Mission")
      ))
    )
  )), /* @__PURE__ */ React.createElement("div", { className: "max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8 relative z-10" }, /* @__PURE__ */ React.createElement("div", { className: "relative border border-[#20452F] rounded-3xl p-6 sm:p-10 shadow-2xl overflow-hidden min-h-[300px] flex flex-col justify-between group" }, /* @__PURE__ */ React.createElement(
    "div",
    {
      className: "absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105",
      style: { backgroundImage: `url('https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1600&q=80')` }
    }
  ), /* @__PURE__ */ React.createElement("div", { className: "absolute inset-0 bg-gradient-to-r from-[#040C07] via-[#040C07]/90 to-[#040C07]/40" }), /* @__PURE__ */ React.createElement("div", { className: "space-y-3 max-w-xl relative z-10" }, /* @__PURE__ */ React.createElement("span", { className: "inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#0E2015]/90 text-[#4ADE80] border border-[#4ADE80]/40 text-xs font-semibold backdrop-blur-md" }, t.heroTag), /* @__PURE__ */ React.createElement("h1", { className: "font-display text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight drop-shadow-md" }, t.heroTitle, " ", /* @__PURE__ */ React.createElement("br", null), "for a ", /* @__PURE__ */ React.createElement("span", { className: "text-[#4ADE80]" }, t.heroHighlight)), /* @__PURE__ */ React.createElement("div", { className: "space-y-0.5 text-xs sm:text-sm text-slate-200" }, /* @__PURE__ */ React.createElement("p", { className: "font-semibold text-slate-100" }, t.heroSubtitle1), /* @__PURE__ */ React.createElement("p", { className: "text-slate-300/90" }, t.heroSubtitle2))), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-2 sm:grid-cols-4 gap-3 pt-6 relative z-10" }, /* @__PURE__ */ React.createElement("div", { className: `p-3.5 rounded-2xl flex items-center justify-between shadow-lg backdrop-blur-md border ${isDark ? "bg-[#0A1A10]/95 border-[#20422E]" : "bg-[#FDFBF7]/95 border-[#E3DDD1]"}` }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", { className: `text-[10px] uppercase font-semibold ${isDark ? "text-emerald-400" : "text-[#183B28]"}` }, t.xpLabel), /* @__PURE__ */ React.createElement("p", { className: `font-display text-xl font-extrabold mt-0.5 ${isDark ? "text-white" : "text-[#0F2418]"}` }, totalXP.toLocaleString())), /* @__PURE__ */ React.createElement("span", { className: "text-lg" }, "\u{1F33F}")), /* @__PURE__ */ React.createElement("div", { className: `p-3.5 rounded-2xl flex items-center justify-between shadow-lg backdrop-blur-md border ${isDark ? "bg-[#0A1A10]/95 border-[#20422E]" : "bg-[#FDFBF7]/95 border-[#E3DDD1]"}` }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", { className: `text-[10px] uppercase font-semibold ${isDark ? "text-slate-400" : "text-[#3E5C48]"}` }, t.streakLabel), /* @__PURE__ */ React.createElement("p", { className: `font-display text-xl font-extrabold mt-0.5 ${isDark ? "text-white" : "text-[#0F2418]"}` }, streakDays, " Days")), /* @__PURE__ */ React.createElement("span", { className: "text-lg" }, "\u{1F525}")), /* @__PURE__ */ React.createElement("div", { className: `p-3.5 rounded-2xl flex items-center justify-between shadow-lg backdrop-blur-md border ${isDark ? "bg-[#0A1A10]/95 border-[#20422E]" : "bg-[#FDFBF7]/95 border-[#E3DDD1]"}` }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", { className: `text-[10px] uppercase font-semibold ${isDark ? "text-slate-400" : "text-[#3E5C48]"}` }, t.Quests || "Quests"), /* @__PURE__ */ React.createElement("p", { className: `font-display text-xl font-extrabold mt-0.5 ${isDark ? "text-white" : "text-[#0F2418]"}` }, missions.filter((m) => m.status === "completed").length, " / ", missions.length)), /* @__PURE__ */ React.createElement("span", { className: "text-lg" }, "\u2B50")), /* @__PURE__ */ React.createElement("div", { className: `p-3.5 rounded-2xl flex items-center justify-between shadow-lg backdrop-blur-md border ${isDark ? "bg-[#0A1A10]/95 border-[#20422E]" : "bg-[#FDFBF7]/95 border-[#E3DDD1]"}` }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("p", { className: `text-[10px] uppercase font-semibold ${isDark ? "text-slate-400" : "text-[#3E5C48]"}` }, "Rank"), /* @__PURE__ */ React.createElement("p", { className: `font-display text-sm sm:text-base font-extrabold mt-0.5 ${isDark ? "text-[#4ADE80]" : "text-[#183B28]"}` }, "Eco Guardian")), /* @__PURE__ */ React.createElement("div", { className: `w-8 h-8 rounded-full flex items-center justify-center text-xs border ${isDark ? "bg-purple-950/80 border-purple-400/50" : "bg-[#E1EFE0] border-[#C3DEC0]"}` }, "\u{1F7E3}")))), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2 overflow-x-auto pb-2 custom-chat-scroll scrollbar-none" }, [
    { id: "path", label: t.tabPath },
    { id: "active", label: t.tabActive },
    { id: "completed", label: t.tabCompleted },
    { id: "create", label: t.tabCreate }
  ].map((tab) => /* @__PURE__ */ React.createElement(
    "button",
    {
      key: tab.id,
      onClick: () => setActiveTab(tab.id),
      className: `px-5 py-2.5 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${activeTab === tab.id ? isDark ? "bg-[#4ADE80] text-[#07130B] shadow-md shadow-[#4ADE80]/15" : "bg-[#183B28] text-[#FAF7F0] shadow-md" : isDark ? "bg-[#13271C] border border-[#20422E] text-slate-300 hover:text-white hover:bg-[#1A3827]" : "bg-[#FDFBF7] border border-[#E3DDD1] text-[#0F2418] hover:bg-[#F2ECE1] shadow-xs"}`
    },
    tab.label
  ))), (activeTab === "path" || activeTab === "active" || activeTab === "completed") && /* @__PURE__ */ React.createElement("div", { className: "space-y-8" }, /* @__PURE__ */ React.createElement("div", { className: `rounded-3xl p-6 sm:p-10 space-y-8 shadow-2xl relative overflow-hidden border transition-colors ${isDark ? "bg-[#0E2015] border-[#20452F]" : "bg-[#FDFBF7] border-[#E3DDD1] shadow-sm"}` }, /* @__PURE__ */ React.createElement("div", { className: "flex justify-between items-center" }, /* @__PURE__ */ React.createElement("h3", { className: `font-display text-2xl font-bold ${isDark ? "text-white" : "text-[#0F2418]"}` }, "Ecological Checkpoint Mission Trail"), /* @__PURE__ */ React.createElement("span", { className: `text-xs font-semibold ${isDark ? "text-[#4ADE80]" : "text-[#183B28]"}` }, "Tap any Mission to Expand Checklist")), missions.length === 0 && /* @__PURE__ */ React.createElement("div", { className: `border border-dashed rounded-3xl p-10 text-center space-y-3 ${isDark ? "bg-[#13271C] border-[#20422E]" : "bg-[#F2ECE1] border-[#E0D8C8]"}` }, /* @__PURE__ */ React.createElement("p", { className: "text-3xl" }, "\u{1F33F}"), /* @__PURE__ */ React.createElement("p", { className: `font-display text-lg font-bold ${isDark ? "text-white" : "text-[#0F2418]"}` }, "No missions yet"), /* @__PURE__ */ React.createElement("p", { className: `text-xs max-w-sm mx-auto ${isDark ? "text-slate-400" : "text-[#3E5C48]"}` }, "Generate a challenge from the lightning button, create a custom mission, or finish onboarding to get your first mission set."), /* @__PURE__ */ React.createElement(
    "button",
    {
      onClick: () => setShowGenerateModal(true),
      className: `mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-full font-bold text-xs cursor-pointer ${isDark ? "bg-[#4ADE80] text-[#07130B] hover:bg-[#3ECE77]" : "bg-[#183B28] text-[#FAF7F0] hover:bg-[#255239]"}`
    },
    /* @__PURE__ */ React.createElement(Zap, { className: "w-4 h-4" }),
    "Generate Challenge"
  )), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5" }, (activeTab === "active" ? missions.filter((m) => m.status !== "completed") : activeTab === "completed" ? missions.filter((m) => m.status === "completed") : missions).map((mission) => {
    const isSelected = selectedMission?.id === mission.id;
    const completedStepsCount = mission.steps.filter((s) => s.done).length;
    const progressPct = Math.round(completedStepsCount / mission.steps.length * 100);
    const isDone = mission.status === "completed" || progressPct === 100;
    return /* @__PURE__ */ React.createElement(
      motion.div,
      {
        key: mission.id,
        whileHover: { scale: 1.04 },
        onClick: () => setSelectedMission(mission),
        className: `p-5 rounded-3xl border transition-all cursor-pointer shadow-xl relative overflow-hidden flex flex-col justify-between h-56 ${isSelected ? isDark ? "bg-[#1A3827] border-[#4ADE80] shadow-[#4ADE80]/30" : "bg-[#E1EFE0] border-[#183B28] text-[#0F2418] shadow-md ring-1 ring-[#183B28]" : isDone ? isDark ? "bg-[#0E2015] border-[#4ADE80]/40" : "bg-[#F2ECE1] border-[#C3DEC0] text-[#0F2418]" : isDark ? "bg-[#13271C] border-[#20422E] hover:border-[#4ADE80]/50 text-white" : "bg-[#FDFBF7] border-[#E3DDD1] hover:border-[#183B28] text-[#0F2418] shadow-sm"}`
      },
      /* @__PURE__ */ React.createElement("div", { className: "space-y-2" }, /* @__PURE__ */ React.createElement("div", { className: "flex justify-between items-center" }, /* @__PURE__ */ React.createElement("span", { className: `text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${isDark ? "bg-[#0E2015] text-[#4ADE80] border-[#4ADE80]/30" : "bg-[#E1EFE0] text-[#183B28] border-[#C3DEC0]"}` }, mission.difficulty), /* @__PURE__ */ React.createElement("span", { className: `text-xs font-bold ${isDark ? "text-amber-400" : "text-amber-700"}` }, "+", mission.xpReward, " XP")), /* @__PURE__ */ React.createElement("h4", { className: `font-display text-base font-bold line-clamp-2 mt-1 ${isDark ? "text-white" : "text-[#0F2418]"}` }, mission.title)),
      /* @__PURE__ */ React.createElement("div", { className: `space-y-2 pt-2 border-t ${isDark ? "border-[#20422E]" : "border-[#E3DDD1]"}` }, /* @__PURE__ */ React.createElement("div", { className: `flex justify-between items-center text-[11px] ${isDark ? "text-slate-400" : "text-[#3E5C48]"}` }, /* @__PURE__ */ React.createElement("span", null, completedStepsCount, "/", mission.steps.length, " Steps"), /* @__PURE__ */ React.createElement("span", { className: `font-bold ${isDark ? "text-[#4ADE80]" : "text-[#183B28]"}` }, progressPct, "%")), /* @__PURE__ */ React.createElement("div", { className: `w-full h-2 rounded-full overflow-hidden ${isDark ? "bg-[#0E2015]" : "bg-[#EDE6D8]"}` }, /* @__PURE__ */ React.createElement(
        "div",
        {
          className: `h-full rounded-full transition-all duration-300 ${isDark ? "bg-[#4ADE80]" : "bg-[#183B28]"}`,
          style: { width: `${progressPct}%` }
        }
      )))
    );
  }))), /* @__PURE__ */ React.createElement("div", { className: `rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl border transition-colors ${isDark ? "bg-[#0E2015] border-[#20452F]" : "bg-[#FDFBF7] border-[#E3DDD1] shadow-sm"}` }, /* @__PURE__ */ React.createElement("div", { className: `flex justify-between items-center border-b pb-4 ${isDark ? "border-[#20452F]" : "border-[#E3DDD1]"}` }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h3", { className: `font-display text-2xl font-bold ${isDark ? "text-white" : "text-[#0F2418]"}` }, t.achievementsTitle), /* @__PURE__ */ React.createElement("p", { className: `text-xs ${isDark ? "text-slate-400" : "text-[#3E5C48]"}` }, "Complete missions to unlock regional badges")), /* @__PURE__ */ React.createElement(Trophy, { className: "w-6 h-6 text-amber-500" })), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" }, badges.map((badge) => /* @__PURE__ */ React.createElement(
    "div",
    {
      key: badge.id,
      className: `p-4 rounded-2xl border flex items-center gap-3.5 transition-all ${badge.unlocked ? isDark ? "bg-[#13271C] border-[#4ADE80]/50 text-white" : "bg-[#E1EFE0] border-[#C3DEC0] text-[#0F2418]" : isDark ? "bg-[#07150C] border-[#20422E] opacity-60 text-slate-400" : "bg-[#F2ECE1] border-[#E0D8C8] opacity-60 text-[#3E5C48]"}`
    },
    /* @__PURE__ */ React.createElement("div", { className: `w-12 h-12 rounded-2xl border flex items-center justify-center text-2xl shrink-0 ${isDark ? "bg-[#1A3827] border-[#4ADE80]/40" : "bg-[#FDFBF7] border-[#C3DEC0]"}` }, badge.icon),
    /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h4", { className: `font-display text-sm font-bold ${isDark ? "text-white" : "text-[#0F2418]"}` }, badge.name), /* @__PURE__ */ React.createElement("p", { className: `text-[10px] ${isDark ? "text-slate-400" : "text-[#3E5C48]"}` }, badge.desc))
  )))), /* @__PURE__ */ React.createElement("div", { className: `rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl border transition-colors ${isDark ? "bg-[#0E2015] border-[#20452F]" : "bg-[#FDFBF7] border-[#E3DDD1] shadow-sm"}` }, /* @__PURE__ */ React.createElement("div", { className: `flex justify-between items-center border-b pb-4 ${isDark ? "border-[#20452F]" : "border-[#E3DDD1]"}` }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h3", { className: `font-display text-2xl font-bold ${isDark ? "text-white" : "text-[#0F2418]"}` }, t.leaderboardTitle), /* @__PURE__ */ React.createElement("p", { className: `text-xs ${isDark ? "text-slate-400" : "text-[#3E5C48]"}` }, "Your mission path progress this week")), /* @__PURE__ */ React.createElement(Users, { className: `w-6 h-6 ${isDark ? "text-[#4ADE80]" : "text-[#183B28]"}` })), /* @__PURE__ */ React.createElement("div", { className: "space-y-3" }, impactStats.map((user2) => /* @__PURE__ */ React.createElement(
    "div",
    {
      key: user2.rank,
      className: `p-4 rounded-2xl border flex items-center justify-between transition-all ${user2.rank === 2 ? isDark ? "bg-[#1A3827] border-[#4ADE80] text-white shadow-md" : "bg-[#E1EFE0] border-[#183B28] text-[#0F2418]" : isDark ? "bg-[#13271C] border-[#20422E] text-slate-300" : "bg-[#F2ECE1] border-[#E0D8C8] text-[#0F2418]"}`
    },
    /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-4" }, /* @__PURE__ */ React.createElement("span", { className: `w-8 h-8 rounded-full font-bold flex items-center justify-center text-xs ${user2.rank === 1 ? "bg-amber-400 text-black" : user2.rank === 2 ? "bg-[#4ADE80] text-black" : isDark ? "bg-[#0E2015] text-slate-400" : "bg-[#EDE6D8] text-[#0F2418]"}` }, "#", user2.rank), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("h4", { className: `font-display text-sm font-bold ${isDark ? "text-white" : "text-[#0F2418]"}` }, user2.name), /* @__PURE__ */ React.createElement("p", { className: `text-[10px] ${isDark ? "text-slate-400" : "text-[#3E5C48]"}` }, user2.badge))),
    /* @__PURE__ */ React.createElement("div", { className: "text-right" }, /* @__PURE__ */ React.createElement("span", { className: `text-sm font-extrabold ${isDark ? "text-[#4ADE80]" : "text-[#183B28]"}` }, user2.xp), /* @__PURE__ */ React.createElement("p", { className: `text-[10px] ${isDark ? "text-slate-400" : "text-[#3E5C48]"}` }, user2.streak))
  ))))), activeTab === "create" && /* @__PURE__ */ React.createElement("div", { className: `rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl border transition-colors ${isDark ? "bg-[#0E2015] border-[#20452F]" : "bg-[#FDFBF7] border-[#E3DDD1] shadow-sm"}` }, /* @__PURE__ */ React.createElement("h3", { className: `font-display text-2xl font-bold ${isDark ? "text-white" : "text-[#0F2418]"}` }, "Create Custom Mission Objective"), /* @__PURE__ */ React.createElement("form", { onSubmit: handleCreateCustomMission, className: "space-y-4" }, missionError && /* @__PURE__ */ React.createElement("div", { className: "bg-red-500/15 border border-red-500/40 rounded-2xl px-4 py-3 text-xs text-red-500" }, missionError), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: `block text-xs uppercase tracking-wider mb-1 font-semibold ${isDark ? "text-slate-400" : "text-[#3E5C48]"}` }, "Mission Title"), /* @__PURE__ */ React.createElement(
    "input",
    {
      required: true,
      value: customTitle,
      onChange: (e) => setCustomTitle(e.target.value),
      placeholder: "e.g., Document 3 native tree shade canopies in your neighborhood...",
      className: `w-full rounded-2xl px-4 py-3 text-sm outline-none transition-colors border ${isDark ? "bg-[#13271C] border-[#20422E] text-white focus:border-[#4ADE80]" : "bg-[#F2ECE1] border-[#E0D8C8] text-[#0F2418] focus:border-[#183B28]"}`
    }
  )), /* @__PURE__ */ React.createElement("div", { className: "grid grid-cols-1 sm:grid-cols-2 gap-4" }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: `block text-xs uppercase tracking-wider mb-1 font-semibold ${isDark ? "text-slate-400" : "text-[#3E5C48]"}` }, "Category"), /* @__PURE__ */ React.createElement(
    "select",
    {
      value: customCategory,
      onChange: (e) => setCustomCategory(e.target.value),
      className: `w-full text-xs rounded-2xl px-4 py-3 outline-none border transition-colors ${isDark ? "bg-[#13271C] border-[#20422E] text-white focus:border-[#4ADE80]" : "bg-[#F2ECE1] border-[#E0D8C8] text-[#0F2418] focus:border-[#183B28]"}`
    },
    /* @__PURE__ */ React.createElement("option", { value: "Exploration" }, "Exploration"),
    /* @__PURE__ */ React.createElement("option", { value: "Learning" }, "Learning"),
    /* @__PURE__ */ React.createElement("option", { value: "Creativity" }, "Creativity"),
    /* @__PURE__ */ React.createElement("option", { value: "Personal Goals" }, "Personal Goals")
  )), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("label", { className: `block text-xs uppercase tracking-wider mb-1 font-semibold ${isDark ? "text-slate-400" : "text-[#3E5C48]"}` }, "Difficulty"), /* @__PURE__ */ React.createElement(
    "select",
    {
      value: customDifficulty,
      onChange: (e) => setCustomDifficulty(e.target.value),
      className: `w-full text-xs rounded-2xl px-4 py-3 outline-none border transition-colors ${isDark ? "bg-[#13271C] border-[#20422E] text-white focus:border-[#4ADE80]" : "bg-[#F2ECE1] border-[#E0D8C8] text-[#0F2418] focus:border-[#183B28]"}`
    },
    /* @__PURE__ */ React.createElement("option", { value: "Easy" }, "Easy (100 XP)"),
    /* @__PURE__ */ React.createElement("option", { value: "Medium" }, "Medium (180 XP)"),
    /* @__PURE__ */ React.createElement("option", { value: "Hard" }, "Hard (250 XP)")
  ))), /* @__PURE__ */ React.createElement(
    "button",
    {
      type: "submit",
      className: `w-full py-3.5 rounded-2xl font-bold text-sm transition-all shadow-xl cursor-pointer ${isDark ? "bg-[#4ADE80] text-[#07130B] hover:bg-[#3ECE77]" : "bg-[#183B28] text-[#FAF7F0] hover:bg-[#255239]"}`
    },
    "Create & Add Mission"
  ))), selectedMission && /* @__PURE__ */ React.createElement(
    motion.div,
    {
      initial: { opacity: 0, y: 12 },
      animate: { opacity: 1, y: 0 },
      className: `rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 border transition-colors ${isDark ? "bg-[#112318] border-[#4ADE80]/50" : "bg-[#FDFBF7] border-[#E3DDD1] shadow-xl"}`
    },
    /* @__PURE__ */ React.createElement("div", { className: `flex justify-between items-start border-b pb-4 ${isDark ? "border-[#20452F]" : "border-[#E3DDD1]"}` }, /* @__PURE__ */ React.createElement("div", { className: "space-y-1" }, /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ React.createElement("span", { className: `px-3 py-1 rounded-full text-xs font-bold ${isDark ? "bg-[#1A3827] text-[#4ADE80]" : "bg-[#E1EFE0] text-[#183B28]"}` }, selectedMission.category), /* @__PURE__ */ React.createElement("span", { className: `text-xs font-bold ${isDark ? "text-amber-400" : "text-amber-700"}` }, "+", selectedMission.xpReward, " XP Reward")), /* @__PURE__ */ React.createElement("h3", { className: `font-display text-2xl font-bold ${isDark ? "text-white" : "text-[#0F2418]"}` }, selectedMission.title)), /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-2" }, /* @__PURE__ */ React.createElement(
      "button",
      {
        onClick: () => handleDeleteMission(selectedMission.id),
        className: "p-2 rounded-full bg-red-500/10 border border-red-500/30 text-red-500 hover:bg-red-500/20 cursor-pointer",
        title: "Delete Mission"
      },
      /* @__PURE__ */ React.createElement(Trash2, { className: "w-4 h-4" })
    ), /* @__PURE__ */ React.createElement("button", { onClick: () => setSelectedMission(null), className: `cursor-pointer ${isDark ? "text-slate-400 hover:text-white" : "text-[#3E5C48] hover:text-[#0F2418]"}` }, /* @__PURE__ */ React.createElement(X, { className: "w-5 h-5" })))),
    /* @__PURE__ */ React.createElement("div", { className: "space-y-3" }, /* @__PURE__ */ React.createElement("p", { className: `text-xs uppercase tracking-wider font-bold ${isDark ? "text-slate-400" : "text-[#3E5C48]"}` }, "Action Steps & Checklist"), selectedMission.steps.map((step) => /* @__PURE__ */ React.createElement(
      "div",
      {
        key: step.id,
        onClick: () => toggleStep(selectedMission.id, step.id),
        className: `flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer ${step.done ? isDark ? "bg-[#1A3827] border-[#4ADE80] text-slate-200" : "bg-[#E1EFE0] border-[#183B28] text-[#0F2418]" : isDark ? "bg-[#0E2015] border-[#20422E] text-white hover:border-[#4ADE80]/40" : "bg-[#F2ECE1] border-[#E0D8C8] text-[#0F2418] hover:border-[#183B28]"}`
      },
      /* @__PURE__ */ React.createElement("div", { className: "flex items-center gap-3" }, /* @__PURE__ */ React.createElement("div", { className: `w-6 h-6 rounded-full border flex items-center justify-center text-xs font-bold ${step.done ? isDark ? "bg-[#4ADE80] border-[#4ADE80] text-[#07130B]" : "bg-[#183B28] border-[#183B28] text-[#FAF7F0]" : isDark ? "border-slate-500" : "border-[#D4CBB8]"}` }, step.done && "\u2713"), /* @__PURE__ */ React.createElement("span", { className: `text-xs sm:text-sm font-medium ${step.done ? "line-through opacity-75" : ""}` }, step.text)),
      /* @__PURE__ */ React.createElement("span", { className: `text-[11px] font-semibold ${isDark ? "text-[#4ADE80]" : "text-[#183B28]"}` }, step.done ? "Done" : "Tap to complete")
    )))
  )));
}
