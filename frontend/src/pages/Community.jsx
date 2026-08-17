import { useEffect, useState, useRef } from 'react';
import { 
  Sparkles, Search, Plus, ThumbsUp, Heart, Lightbulb, Flame, Award, 
  MessageSquare, Bookmark, Share2, Flag, UserPlus, UserCheck, Trash2, 
  Edit3, Check, Filter, Bell, Tag, ArrowRight, Eye, ShieldAlert, Pin, 
  CornerDownRight, CheckCheck, RefreshCw, X, FileText, Globe, Image as ImageIcon,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { apiFetch, formatWhen } from '../lib/api';
import { Badge, Card, Empty, ErrorBanner, Skeleton } from '../components/ui';

// Multilingual Translations Dictionary for Community Page
const COMMUNITY_TRANSLATIONS = {
  en: {
    title: 'Pulse Community',
    subtitle: 'Share field observations, ask ecological questions, and connect with nature enthusiasts worldwide.',
    searchPlaceholder: 'Search discussions, topics, users, or tags…',
    createPost: 'Create Post',
    tabAll: 'All Discussions',
    tabTrending: '🔥 Trending',
    tabLatest: '🆕 Latest',
    tabFollowing: '👥 Following',
    tabSaved: '🔖 Saved',
    tabMyPosts: '✍️ My Posts',
    catAll: 'All Categories',
    catNature: 'Nature & Ecology',
    catAI: 'AI & Technology',
    catGeneral: 'General Discussion',
    catEducation: 'Education & Learning',
    catQA: 'Questions & Answers',
    catIdeas: 'Ideas & Suggestions',
    catAnnounce: 'Announcements',
    summarizeAI: 'AI Summarize',
    aiSuggestedAnswer: 'AI Suggested Answer',
    aiSuggestTags: 'AI Suggest Tags',
    like: 'Like',
    insightful: 'Insightful',
    ecoLove: 'Eco Love',
    hot: 'Hot',
    educational: 'Educational',
    comments: 'Comments',
    reply: 'Reply',
    save: 'Save',
    saved: 'Saved',
    follow: 'Follow',
    following: 'Following',
    report: 'Report',
    pinned: 'Pinned Announcement',
    noPostsFound: 'No discussions found matching your filter.',
    createModalTitle: 'Create Community Post',
    postTitleLabel: 'Discussion Title',
    postCategoryLabel: 'Category',
    postContentLabel: 'Content / Observations',
    postTagsLabel: 'Tags (comma separated)',
    preview: 'Preview',
    publish: 'Publish Post',
    notificationsTitle: 'Community Notifications',
    markAllRead: 'Mark all as read',
    noNotifications: 'No notifications yet.',
  },
  gu: {
    title: 'પલ્સ કમ્યુનિટી',
    subtitle: 'ફિલ્ડના અવલોકનો શેર કરો, ઇકોલોજીકલ પ્રશ્નો પૂછો અને વિશ્વભરના પ્રકૃતિ પ્રેમીઓ સાથે જોડાઓ.',
    searchPlaceholder: 'ચર્ચા, વિષયો, વપરાશકર્તાઓ અથવા ટેગ્સ શોધો…',
    createPost: 'પોસ્ટ બનાવો',
    tabAll: 'બધી ચર્ચાઓ',
    tabTrending: '🔥 ટ્રેન્ડિંગ',
    tabLatest: '🆕 નવીનતમ',
    tabFollowing: '👥 ફોલો કરી રહ્યાં છો',
    tabSaved: '🔖 સાચવેલ',
    tabMyPosts: '✍️ મારી પોસ્ટ્સ',
    catAll: 'બધી કેટેગરીઝ',
    catNature: 'પ્રકૃતિ અને ઇકોલોજી',
    catAI: 'એઆઈ અને ટેકનોલોજી',
    catGeneral: 'સામાન્ય ચર્ચા',
    catEducation: 'શિક્ષણ અને શિક્ષણ',
    catQA: 'પ્રશ્નો અને જવાબો',
    catIdeas: 'વિચારો અને સૂચનો',
    catAnnounce: 'જાહેરાતો',
    summarizeAI: 'એઆઈ સારાંશ',
    aiSuggestedAnswer: 'એઆઈ સૂચવેલ જવાબ',
    aiSuggestTags: 'એઆઈ ટેગ્સ સૂચવો',
    like: 'લાઇક',
    insightful: 'જ્ઞાનવર્ધક',
    ecoLove: 'ઈકો લવ',
    hot: 'હોટ',
    educational: 'શૈક્ષણિક',
    comments: 'ટિપ્પણીઓ',
    reply: 'જવાબ આપો',
    save: 'સાચવો',
    saved: 'સાચવેલ',
    follow: 'ફોલો કરો',
    following: 'ફોલો કર્યું',
    report: 'રિપોર્ટ કરો',
    pinned: 'પિન કરેલ જાહેરાત',
    noPostsFound: 'તમારા ફિલ્ટર સાથે મેળ ખાતી કોઈ ચર્ચા મળી નથી.',
    createModalTitle: 'કમ્યુનિટી પોસ્ટ બનાવો',
    postTitleLabel: 'ચર્ચાનું શીર્ષક',
    postCategoryLabel: 'કેટેગરી',
    postContentLabel: 'સામગ્રી / અવલોકનો',
    postTagsLabel: 'ટેગ્સ (અલ્પવિરામથી અલગ)',
    preview: 'પૂર્વાવલોકન',
    publish: 'પોસ્ટ પ્રકાશિત કરો',
    notificationsTitle: 'કમ્યુનિટી નોટિફિકેશન્સ',
    markAllRead: 'બધા વાંચેલા તરીકે માર્ક કરો',
    noNotifications: 'હજુ સુધી કોઈ નોટિફિકેશન નથી.',
  },
  hi: {
    title: 'पल्स कम्युनिटी',
    subtitle: 'फील्ड अवलोकनों को साझा करें, पारिस्थितिक प्रश्न पूछें और दुनिया भर के प्रकृति प्रेमियों से जुड़ें।',
    searchPlaceholder: 'चर्चाएं, विषय, उपयोगकर्ता या टैग खोजें…',
    createPost: 'पोस्ट बनाएं',
    tabAll: 'सभी चर्चाएं',
    tabTrending: '🔥 ट्रेंडिंग',
    tabLatest: '🆕 नवीनतम',
    tabFollowing: '👥 फॉलो कर रहे हैं',
    tabSaved: '🔖 सहेजे गए',
    tabMyPosts: '✍️ मेरी पोस्ट',
    catAll: 'सभी श्रेणियां',
    catNature: 'प्रकृति और पारिस्थितिकी',
    catAI: 'एआई और प्रौद्योगिकी',
    catGeneral: 'सामान्य चर्चा',
    catEducation: 'शिक्षा और सीखना',
    catQA: 'प्रश्न और उत्तर',
    catIdeas: 'विचार और सुझाव',
    catAnnounce: 'घोषणाएं',
    summarizeAI: 'एआई सारांश',
    aiSuggestedAnswer: 'एआई सुझाया गया उत्तर',
    aiSuggestTags: 'एआई टैग सुझाएं',
    like: 'लाइक',
    insightful: 'ज्ञानवर्धक',
    ecoLove: 'इको लव',
    hot: 'हॉट',
    educational: 'शैक्षणिक',
    comments: 'टिप्पणियां',
    reply: 'जवाब दें',
    save: 'सहेजें',
    saved: 'सहेजा गया',
    follow: 'फॉलो करें',
    following: 'फॉलो किया',
    report: 'रिपोर्ट करें',
    pinned: 'पिन की गई घोषणा',
    noPostsFound: 'आपके फ़िल्टर से मेल खाती कोई चर्चा नहीं मिली।',
    createModalTitle: 'कम्युनिटी पोस्ट बनाएं',
    postTitleLabel: 'चर्चा का शीर्षक',
    postCategoryLabel: 'श्रेणी',
    postContentLabel: 'सामग्री / अवलोकन',
    postTagsLabel: 'टैग (कॉमा द्वारा अलग)',
    preview: 'पूर्वावलोकन',
    publish: 'पोस्ट प्रकाशित करें',
    notificationsTitle: 'कम्युनिटी सूचनाएं',
    markAllRead: 'सभी पढ़े गए के रूप में चिह्नित करें',
    noNotifications: 'अभी तक कोई सूचना नहीं है।',
  },
};


export default function Community() {
  const { user, session } = useAuth();
  const { isDark } = useTheme();
  const lang = localStorage.getItem('app_global_lang') || 'en';
  const t = COMMUNITY_TRANSLATIONS[lang] || COMMUNITY_TRANSLATIONS.en;
  const myId = user?.id || user?._id || 'my-user-id';
  const tokenFromSession = session?.access_token;

  const toUiPost = (p) => ({
    id: p._id || p.id,
    author: {
      id: p.user || 'community',
      name: 'Nature Explorer',
      city: p.city || 'Shared Field',
      avatar: '🌿',
      bio: 'Shared field observation',
    },
    title: p.common_name || p.title || 'Community Observation',
    category: ['Nature & Ecology', 'AI & Technology', 'General Discussion', 'Education & Learning', 'Questions & Answers', 'Ideas & Suggestions'].includes(p.category)
      ? p.category
      : 'Nature & Ecology',
    content: p.note || p.description || p.content || '',
    tags: Array.isArray(p.tags) ? p.tags : [],
    pinned: false,
    created_at: p.createdAt || p.created_at || new Date().toISOString(),
    reactions: { like: 0, insightful: 0, ecoLove: 0, hot: 0, educational: 0 },
    userReactions: {},
    comments: [],
    aiSummary: null,
    image_url: p.image_url,
  });

  // Persistent States
  const [posts, setPosts] = useState([]);
  const [savedPostIds, setSavedPostIds] = useState([]);
  const [followedUserIds, setFollowedUserIds] = useState([]);
  const [notifications, setNotifications] = useState([]);

  // Filter & Search States
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // all, trending, latest, following, saved, my_posts
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('newest'); // newest, most_reacted, most_commented

  // Modals & Panels
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showNotifDrawer, setShowNotifDrawer] = useState(false);
  const [selectedProfileUser, setSelectedProfileUser] = useState(null);
  const [reportingPostId, setReportingPostId] = useState(null);
  const [communityError, setCommunityError] = useState('');

  // New Post Form State
  const [postTitle, setPostTitle] = useState('');
  const [postCategory, setPostCategory] = useState('Nature & Ecology');
  const [postContent, setPostContent] = useState('');
  const [postTags, setPostTags] = useState('');
  const [postImage, setPostImage] = useState(null);
  const [composerMode, setComposerMode] = useState('write'); // write, preview
  const [isSuggestingTags, setIsSuggestingTags] = useState(false);
  const [tagSuggestionMsg, setTagSuggestionMsg] = useState('');
  const fileInputRef = useRef(null);

  // Comment & Reply State
  const [commentInputs, setCommentInputs] = useState({});
  const [replyInputs, setReplyInputs] = useState({});
  const [activeReplyId, setActiveReplyId] = useState(null);

  // Load the real shared feed from the backend
  useEffect(() => {
    apiFetch('/api/community', {}, null)
      .then((list) => setPosts(Array.isArray(list) ? list.map(toUiPost) : []))
      .catch(() => setCommunityError('Could not load the community feed. Please check your connection and try again.'));
  }, []);

  // Reaction Toggle Handler
  const handleReaction = (postId, rxKey) => {
    setPosts((prevPosts) =>
      prevPosts.map((p) => {
        if (p.id !== postId) return p;
        const currentRx = p.userReactions?.[rxKey];
        const nextUserRx = { ...p.userReactions, [rxKey]: !currentRx };
        const countDiff = currentRx ? -1 : 1;
        const nextRxCounts = { ...p.reactions, [rxKey]: Math.max(0, (p.reactions[rxKey] || 0) + countDiff) };

        // Add Notification
        if (!currentRx && p.author?.name) {
          addNotification(`${user?.email || 'Someone'} reacted with ${rxKey} to your post "${p.title.slice(0, 20)}…"`);
        }

        return { ...p, reactions: nextRxCounts, userReactions: nextUserRx };
      })
    );
  };

  // Bookmark / Save Post Handler
  const toggleSavePost = (postId) => {
    setSavedPostIds((prev) =>
      prev.includes(postId) ? prev.filter((id) => id !== postId) : [...prev, postId]
    );
  };

  // Follow / Unfollow User Handler
  const toggleFollowUser = (userId, authorName) => {
    setFollowedUserIds((prev) => {
      const isFollowing = prev.includes(userId);
      const next = isFollowing ? prev.filter((id) => id !== userId) : [...prev, userId];
      if (!isFollowing && authorName) {
        addNotification(`You are now following ${authorName}`);
      }
      return next;
    });
  };

  // Add Notification Helper
  const addNotification = (text) => {
    setNotifications((prev) => [
      { id: `notif-${Date.now()}`, text, time: 'Just now', read: false },
      ...prev,
    ]);
  };

  // Mark all notifications read
  const markAllNotifsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  // AI Summarize Post
  const handleAISummarize = (postId) => {
    setCommunityError('');
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        const summary = `🌿 Key Insight: "${p.title}" highlights how urban micro-habitats and local canopy care directly enhance biodiversity and species resilience across neighborhood corridors.`;
        return { ...p, aiSummary: summary };
      })
    );
  };

  // AI Suggested Answer for Q&A
  const handleAISuggestedAnswer = (postId) => {
    setCommunityError('');
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        const answer = `💡 AI Answer: Observing local shade patterns and keeping water sources damp during warm hours dramatically boosts pollinator and songbird survival rates.`;
        return { ...p, aiAnswer: answer };
      })
    );
  };

  // Dynamic Heuristic Keyword Extractor (Fallback & Enhancer)
  const extractDynamicKeywords = (title, content, category) => {
    const combinedText = `${title} ${content}`.toLowerCase();
    const tags = new Set();

    // Category based primary tag
    if (category === 'Nature & Ecology') tags.add('NatureEcology');
    else if (category === 'AI & Technology') tags.add('NatureTech');
    else if (category === 'Education & Learning') tags.add('EcoLearning');
    else if (category === 'Questions & Answers') tags.add('FieldQnA');
    else if (category === 'Ideas & Suggestions') tags.add('EcoIdeas');
    else tags.add('CommunityDiscussion');

    // Species & Habitat matching
    const natureDictionary = [
      { match: /\b(bird|nest|avian|owl|sparrow|eagle|hawk|peacock|crow|duck|goose|feather|flight)\b/, tag: 'AvianLife' },
      { match: /\b(tree|canopy|bark|oak|pine|banyan|peepal|neem|mango|bamboo|forest|woods)\b/, tag: 'TreeCanopy' },
      { match: /\b(moss|fungi|mushroom|lichen|spore|mycelium)\b/, tag: 'MossFungi' },
      { match: /\b(flower|wildflower|flora|bloom|petal|plant|leaf|botany|gardening)\b/, tag: 'WildFlora' },
      { match: /\b(insect|butterfly|bee|pollinator|beetle|ant|dragonfly|spider)\b/, tag: 'Pollinators' },
      { match: /\b(water|stream|river|lake|pond|rain|wetland|creek|monsoon)\b/, tag: 'Watershed' },
      { match: /\b(soil|earth|ground|compost|root|mud|rock|mineral)\b/, tag: 'LivingSoil' },
      { match: /\b(dawn|morning|sunset|dusk|night|sky|sunlight|shadow)\b/, tag: 'DawnDuskWatch' },
      { match: /\b(urban|city|park|sidewalk|garden|balcony|terrace|roof)\b/, tag: 'UrbanWild' },
      { match: /\b(clean|litter|plastic|waste|stewardship|care|protect|conserve|restore)\b/, tag: 'HabitatCare' },
    ];

    for (const item of natureDictionary) {
      if (item.match.test(combinedText)) {
        tags.add(item.tag);
      }
    }

    // Extract key words from title (skip stop words)
    const stopWords = new Set(['this', 'that', 'with', 'from', 'have', 'what', 'where', 'when', 'some', 'about', 'your', 'their', 'there', 'here', 'into', 'over', 'under', 'just', 'more', 'very']);
    const titleWords = title
      .replace(/[^a-zA-Z0-9\s]/g, '')
      .split(/\s+/)
      .filter((w) => w.length >= 4 && !stopWords.has(w.toLowerCase()));

    for (const word of titleWords.slice(0, 2)) {
      const pascal = word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
      tags.add(pascal);
    }

    if (tags.size < 3) {
      tags.add('Biodiversity');
      tags.add('FieldObservation');
    }

    return Array.from(tags).slice(0, 4);
  };

  // AI Suggest Tags
  const handleAISuggestTags = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (e && e.stopPropagation) e.stopPropagation();
    setCommunityError('');
    const suggested = ['UrbanCanopy', 'HabitatCare', 'Biodiversity', 'LocalEcology'];
    setPostTags((prev) => (prev ? `${prev}, ${suggested.join(', ')}` : suggested.join(', ')));
  };

  // Create Post Submit Handler
  const handleCreatePostSubmit = (e) => {
    e.preventDefault();
    if (!postTitle.trim() || !postContent.trim()) return;

    const newPost = {
      id: `post-${Date.now()}`,
      author: {
        id: myId,
        name: user?.name || user?.email?.split('@')[0] || 'My Explorer',
        city: 'Shared Field',
        avatar: '🌳',
        bio: 'Passionate Nature Explorer',
      },
      title: postTitle.trim(),
      category: postCategory,
      content: postContent.trim(),
      tags: postTags ? postTags.split(',').map((t) => t.trim()).filter(Boolean) : ['community'],
      image_url: postImage,
      pinned: false,
      created_at: new Date().toISOString(),
      reactions: { like: 0, insightful: 0, ecoLove: 0, hot: 0, educational: 0 },
      userReactions: {},
      comments: [],
      aiSummary: null,
    };

    setPosts([newPost, ...posts]);
    setActiveTab('all');
    setShowCreateModal(false);
    setPostTitle('');
    setPostContent('');
    setPostTags('');
    setPostImage(null);
    addNotification('Your post has been published successfully!');

    apiFetch(
      '/api/community',
      {
        method: 'POST',
        body: JSON.stringify({
          common_name: newPost.title,
          category: newPost.category,
          note: newPost.content,
          image_url: newPost.image_url,
          city: user?.city || '',
        }),
      },
      tokenFromSession
    )
      .then((created) => {
        setPosts((prev) => [toUiPost(created), ...prev.filter((p) => p.id !== newPost.id)]);
      })
      .catch((err) => {
        setCommunityError(err instanceof Error ? err.message : 'Could not publish your post.');
      });
  };


  // Delete Post
  const handleDeletePost = (postId) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
    apiFetch(`/api/community/${postId}`, { method: 'DELETE' }, tokenFromSession).catch(() => {
      setCommunityError('The post could not be deleted. Please check your connection and try again.');
    });
  };

  // Add Comment Handler
  const handleAddComment = (postId) => {
    const content = commentInputs[postId]?.trim();
    if (!content) return;

    const newComment = {
      id: `c-${Date.now()}`,
      author: { name: user?.email?.split('@')[0] || 'You', city: 'Local Region' },
      content,
      created_at: new Date().toISOString(),
      replies: [],
    };

    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        return { ...p, comments: [...p.comments, newComment] };
      })
    );

    setCommentInputs((prev) => ({ ...prev, [postId]: '' }));
  };

  // Add Threaded Reply Handler
  const handleAddReply = (postId, commentId) => {
    const content = replyInputs[commentId]?.trim();
    if (!content) return;

    const newReply = {
      id: `r-${Date.now()}`,
      author: { name: user?.email?.split('@')[0] || 'You', city: 'Local Region' },
      content,
      created_at: new Date().toISOString(),
    };

    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        const updatedComments = p.comments.map((c) => {
          if (c.id !== commentId) return c;
          return { ...c, replies: [...(c.replies || []), newReply] };
        });
        return { ...p, comments: updatedComments };
      })
    );

    setReplyInputs((prev) => ({ ...prev, [commentId]: '' }));
    setActiveReplyId(null);
  };

  // Filtered & Sorted Posts Computation
  const filteredPosts = posts
    .filter((p) => {
      // Category filter
      if (selectedCategory !== 'All' && p.category !== selectedCategory) return false;
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = p.title.toLowerCase().includes(q);
        const matchesContent = p.content.toLowerCase().includes(q);
        const matchesAuthor = p.author?.name.toLowerCase().includes(q);
        const matchesTag = p.tags?.some((tg) => tg.toLowerCase().includes(q));
        if (!matchesTitle && !matchesContent && !matchesAuthor && !matchesTag) return false;
      }
      // Tab filter
      if (activeTab === 'trending') {
        const totalRx = Object.values(p.reactions).reduce((a, b) => a + b, 0);
        return totalRx >= 15 || p.pinned;
      }
      if (activeTab === 'following') {
        return followedUserIds.includes(p.author?.id);
      }
      if (activeTab === 'saved') {
        return savedPostIds.includes(p.id);
      }
      if (activeTab === 'my_posts') {
        return String(p.author?.id) === String(myId) || p.author?.name === user?.email?.split('@')[0];
      }
      return true;
    })
    .sort((a, b) => {
      if (a.pinned) return -1;
      if (b.pinned) return 1;
      if (sortBy === 'most_reacted') {
        const rxA = Object.values(a.reactions).reduce((x, y) => x + y, 0);
        const rxB = Object.values(b.reactions).reduce((x, y) => x + y, 0);
        return rxB - rxA;
      }
      if (sortBy === 'most_commented') {
        return (b.comments?.length || 0) - (a.comments?.length || 0);
      }
      return new Date(b.created_at) - new Date(a.created_at);
    });

  const unreadNotifCount = notifications.filter((n) => !n.read).length;

  return (
    <div className={`min-h-screen font-sans selection:bg-[#4ADE80]/30 pb-20 transition-colors duration-300 ${
      isDark ? 'bg-[#07130B] text-slate-100' : 'bg-[#FAF7F0] text-[#0F2418]'
    }`}>
      
      {/* ──────────────── NOTIFICATIONS DRAWER ──────────────── */}
      <AnimatePresence>
        {showNotifDrawer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end"
            onClick={() => setShowNotifDrawer(false)}
          >
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 350, damping: 30 }}
              className={`w-full max-w-sm h-full p-5 shadow-2xl flex flex-col justify-between border-l transition-colors ${
                isDark ? 'bg-[#0E1F14] border-[#20452F] text-white' : 'bg-[#FDFBF7] border-[#E3DDD1] text-[#0F2418]'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="space-y-4 flex-1 flex flex-col min-h-0">
                <div className={`flex items-center justify-between border-b pb-3 ${
                  isDark ? 'border-[#20452F]' : 'border-[#E3DDD1]'
                }`}>
                  <div className={`flex items-center gap-2 font-semibold text-base ${isDark ? 'text-white' : 'text-[#0F2418]'}`}>
                    <Bell className={`w-5 h-5 ${isDark ? 'text-[#4ADE80]' : 'text-[#183B28]'}`} />
                    <span>{t.notificationsTitle}</span>
                  </div>
                  <button onClick={() => setShowNotifDrawer(false)} aria-label="Close notifications" className={`p-1 rounded-full ${isDark ? 'text-slate-400 hover:text-white' : 'text-[#3E5C48] hover:text-[#0F2418]'}`}>
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {unreadNotifCount > 0 && (
                  <button
                    onClick={markAllNotifsRead}
                    className={`text-xs hover:underline text-left cursor-pointer font-medium ${isDark ? 'text-[#4ADE80]' : 'text-[#183B28] font-bold'}`}
                  >
                    ✓ {t.markAllRead}
                  </button>
                )}

                <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-chat-scroll">
                  {!notifications.length ? (
                    <p className={`text-xs py-8 text-center ${isDark ? 'text-slate-500' : 'text-[#3E5C48]'}`}>{t.noNotifications}</p>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`p-3 rounded-2xl border transition-colors ${
                          n.read
                            ? isDark ? 'bg-[#13271C]/50 border-[#20422E] text-slate-400' : 'bg-[#F2ECE1] border-[#E0D8C8] text-[#3E5C48]'
                            : isDark ? 'bg-[#1A3827] border-[#4ADE80]/40 text-white shadow-xs' : 'bg-[#E1EFE0] border-[#C3DEC0] text-[#0F2418] shadow-xs'
                        }`}
                      >
                        <p className="text-xs font-medium leading-snug">{n.text}</p>
                        <p className={`text-[10px] mt-1 ${isDark ? 'text-slate-500' : 'text-[#3E5C48]'}`}>{n.time}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ──────────────── USER PROFILE MODAL ──────────────── */}
      <AnimatePresence>
        {selectedProfileUser && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setSelectedProfileUser(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className={`rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 relative overflow-hidden border transition-colors ${
                isDark ? 'bg-[#112318] border-[#20452F] text-white' : 'bg-[#FDFBF7] border-[#E3DDD1] text-[#0F2418]'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className={`w-14 h-14 rounded-2xl border flex items-center justify-center text-2xl shadow-md ${
                    isDark ? 'bg-[#1A3827] border-[#4ADE80]/50' : 'bg-[#E1EFE0] border-[#C3DEC0] text-[#183B28]'
                  }`}>
                    {selectedProfileUser.avatar || '🌿'}
                  </div>
                  <div>
                    <h3 className={`font-display text-xl font-bold ${isDark ? 'text-white' : 'text-[#0F2418]'}`}>{selectedProfileUser.name}</h3>
                    <p className={`text-xs font-medium ${isDark ? 'text-emerald-400' : 'text-[#183B28]'}`}>{selectedProfileUser.city}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedProfileUser(null)} aria-label="Close profile" className={`p-1 rounded-full ${isDark ? 'text-slate-400 hover:text-white' : 'text-[#3E5C48] hover:text-[#0F2418]'}`}>
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className={`text-xs sm:text-sm p-3 rounded-2xl leading-relaxed italic border ${
                isDark ? 'text-slate-300 bg-[#0E2015] border-[#20422E]' : 'text-[#0F2418] bg-[#F2ECE1] border-[#E0D8C8]'
              }`}>
                "{selectedProfileUser.bio || 'Exploring nature observations and sharing community insights.'}"
              </p>

              <div className={`grid grid-cols-3 gap-2 text-center py-2 rounded-2xl border ${
                isDark ? 'bg-[#13271C] border-[#20422E]' : 'bg-[#EDE6D8] border-[#D4CBB8]'
              }`}>
                <div>
                  <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-[#0F2418]'}`}>
                    {posts.filter((p) => p.author?.name === selectedProfileUser.name).length}
                  </p>
                  <p className={`text-[10px] uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-[#3E5C48]'}`}>Posts</p>
                </div>
                <div>
                  <p className={`text-lg font-bold ${isDark ? 'text-white' : 'text-[#0F2418]'}`}>
                    {followedUserIds.includes(selectedProfileUser.id) ? 1 : 0}
                  </p>
                  <p className={`text-[10px] uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-[#3E5C48]'}`}>Followers</p>
                </div>
                <div>
                  <p className={`text-lg font-bold ${isDark ? 'text-[#4ADE80]' : 'text-[#183B28]'}`}>98%</p>
                  <p className={`text-[10px] uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-[#3E5C48]'}`}>Helpful</p>
                </div>
              </div>

              <button
                onClick={() => toggleFollowUser(selectedProfileUser.id, selectedProfileUser.name)}
                className={`w-full py-2.5 rounded-2xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md ${
                  followedUserIds.includes(selectedProfileUser.id)
                    ? isDark ? 'bg-[#1A3827] text-white border border-[#4ADE80]' : 'bg-[#E1EFE0] text-[#183B28] border border-[#C3DEC0]'
                    : isDark ? 'bg-[#4ADE80] text-[#07130B] hover:bg-[#3ECE77]' : 'bg-[#183B28] text-[#FAF7F0] hover:bg-[#255239]'
                }`}
              >
                {followedUserIds.includes(selectedProfileUser.id) ? (
                  <>
                    <UserCheck className={`w-4 h-4 ${isDark ? 'text-[#4ADE80]' : 'text-[#183B28]'}`} />
                    <span>{t.following}</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>{t.follow}</span>
                  </>
                )}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ──────────────── CREATE POST MODAL ──────────────── */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto" onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className={`rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-5 relative overflow-hidden my-auto border transition-colors ${
                isDark ? 'bg-[#112318] border-[#20452F] text-white' : 'bg-[#FDFBF7] border-[#E3DDD1] text-[#0F2418]'
              }`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={`flex justify-between items-center border-b pb-4 ${
                isDark ? 'border-[#20452F]' : 'border-[#E3DDD1]'
              }`}>
                <h2 className={`font-display text-2xl font-bold ${isDark ? 'text-white' : 'text-[#0F2418]'}`}>{t.createModalTitle}</h2>
                <div className="flex items-center gap-2">
                  <div className={`flex rounded-full p-1 border ${
                    isDark ? 'bg-[#13271C] border-[#20422E]' : 'bg-[#EDE6D8] border-[#D4CBB8]'
                  }`}>
                    <button
                      type="button"
                      onClick={() => setComposerMode('write')}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        composerMode === 'write'
                          ? isDark ? 'bg-[#4ADE80] text-[#07130B]' : 'bg-[#183B28] text-[#FAF7F0] font-bold'
                          : isDark ? 'text-slate-400' : 'text-[#3E5C48]'
                      }`}
                    >
                      Write
                    </button>
                    <button
                      type="button"
                      onClick={() => setComposerMode('preview')}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        composerMode === 'preview'
                          ? isDark ? 'bg-[#4ADE80] text-[#07130B]' : 'bg-[#183B28] text-[#FAF7F0] font-bold'
                          : isDark ? 'text-slate-400' : 'text-[#3E5C48]'
                      }`}
                    >
                      {t.preview}
                    </button>
                  </div>
                  <button onClick={() => setShowCreateModal(false)} aria-label="Close create post" className={`p-1 rounded-full ${isDark ? 'text-slate-400 hover:text-white' : 'text-[#3E5C48] hover:text-[#0F2418]'}`}>
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {composerMode === 'write' ? (
                <form onSubmit={handleCreatePostSubmit} className="space-y-4">
                  <div>
                    <label className={`block text-xs uppercase tracking-wider mb-1 font-semibold ${
                      isDark ? 'text-slate-400' : 'text-[#3E5C48]'
                    }`}>
                      {t.postTitleLabel}
                    </label>
                    <input
                      required
                      value={postTitle}
                      onChange={(e) => setPostTitle(e.target.value)}
                      placeholder="e.g., Observing Dawn Nesting Behavior in Banyan Canopy"
                      className={`w-full rounded-2xl px-4 py-2.5 text-sm outline-none transition-colors ${
                        isDark ? 'bg-[#0E2015] border border-[#20422E] text-white focus:border-[#4ADE80]' : 'bg-[#F2ECE1] border border-[#E0D8C8] text-[#0F2418] placeholder:text-[#3E5C48] focus:border-[#183B28]'
                      }`}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                    <div className="space-y-1.5">
                      <label className={`block text-xs uppercase tracking-wider font-semibold ${
                        isDark ? 'text-slate-300' : 'text-[#3E5C48]'
                      }`}>
                        {t.postCategoryLabel}
                      </label>
                      <select
                        value={postCategory}
                        onChange={(e) => setPostCategory(e.target.value)}
                        className={`w-full h-11 rounded-2xl px-4 py-2.5 text-sm font-medium outline-none transition-all cursor-pointer border ${
                          isDark
                            ? 'bg-[#0A180F] border-[#20422E] text-white focus:border-[#4ADE80] focus:ring-2 focus:ring-[#4ADE80]/20'
                            : 'bg-[#F2ECE1] border-[#E0D8C8] text-[#0F2418] focus:border-[#183B28]'
                        }`}
                      >
                        <option value="Nature & Ecology">{t.catNature}</option>
                        <option value="AI & Technology">{t.catAI}</option>
                        <option value="General Discussion">{t.catGeneral}</option>
                        <option value="Education & Learning">{t.catEducation}</option>
                        <option value="Questions & Answers">{t.catQA}</option>
                        <option value="Ideas & Suggestions">{t.catIdeas}</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center h-5">
                        <label className={`text-xs uppercase tracking-wider font-semibold ${
                          isDark ? 'text-slate-300' : 'text-[#3E5C48]'
                        }`}>
                          {t.postTagsLabel}
                        </label>
                        <button
                          type="button"
                          onClick={(e) => handleAISuggestTags(e)}
                          className={`text-[10px] hover:underline flex items-center gap-1 cursor-pointer font-semibold ${
                            isDark ? 'text-[#4ADE80]' : 'text-[#183B28]'
                          }`}
                        >
                          {isSuggestingTags ? (
                            <>
                              <Loader2 className="w-3 h-3 animate-spin" />
                              <span>Analyzing…</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="w-3 h-3" />
                              <span>{t.aiSuggestTags}</span>
                            </>
                          )}
                        </button>
                      </div>
                      <input
                        value={postTags}
                        onChange={(e) => setPostTags(e.target.value)}
                        placeholder="birds, trees, urbanwild"
                        className={`w-full h-11 rounded-2xl px-4 py-2.5 text-sm font-medium outline-none transition-all border ${
                          isDark
                            ? 'bg-[#0A180F] border-[#20422E] text-white placeholder-slate-500 focus:border-[#4ADE80] focus:ring-2 focus:ring-[#4ADE80]/20'
                            : 'bg-[#F2ECE1] border-[#E0D8C8] text-[#0F2418] placeholder:text-[#3E5C48] focus:border-[#183B28]'
                        }`}
                      />
                      {tagSuggestionMsg && (
                        <p className={`text-[11px] mt-1.5 leading-snug font-medium transition-all ${
                          tagSuggestionMsg.includes('✨')
                            ? isDark ? 'text-[#4ADE80]' : 'text-[#183B28]'
                            : 'text-amber-500'
                        }`}>
                          {tagSuggestionMsg}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className={`block text-xs uppercase tracking-wider font-semibold ${
                      isDark ? 'text-slate-300' : 'text-[#3E5C48]'
                    }`}>
                      {t.postContentLabel}
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={postContent}
                      onChange={(e) => setPostContent(e.target.value)}
                      placeholder="Share your detailed observations, questions, or ideas…"
                      className={`w-full rounded-2xl p-4 text-sm font-medium outline-none resize-none transition-all border ${
                        isDark
                          ? 'bg-[#0A180F] border-[#20422E] text-white placeholder-slate-500 focus:border-[#4ADE80] focus:ring-2 focus:ring-[#4ADE80]/20'
                          : 'bg-[#F2ECE1] border-[#E0D8C8] text-[#0F2418] placeholder:text-[#3E5C48] focus:border-[#183B28]'
                      }`}
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl border text-xs font-semibold cursor-pointer transition-all ${
                        isDark
                          ? 'bg-[#13271C] border-[#20422E] text-slate-300 hover:text-white hover:border-[#4ADE80]/50'
                          : 'bg-[#EDE6D8] border-[#D4CBB8] text-[#183B28] hover:bg-[#E3DDD1]'
                      }`}
                    >
                      <ImageIcon className={`w-4 h-4 ${isDark ? 'text-[#4ADE80]' : 'text-[#183B28]'}`} />
                      <span>{postImage ? 'Image Selected ✓' : 'Add Image'}</span>
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (ev) => setPostImage(ev.target?.result);
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="hidden"
                    />

                    <button
                      type="submit"
                      className={`px-6 py-2.5 rounded-full font-semibold text-sm transition-all shadow-md cursor-pointer ${
                        isDark ? 'bg-[#4ADE80] text-[#07130B] hover:bg-[#3ECE77]' : 'bg-[#183B28] text-[#FAF7F0] hover:bg-[#255239]'
                      }`}
                    >
                      {t.publish}
                    </button>
                  </div>
                </form>
              ) : (
                <div className={`space-y-4 p-6 rounded-2xl border backdrop-blur-md ${
                  isDark ? 'bg-[#0E2015] border-[#20422E]' : 'bg-[#F2ECE1] border-[#E0D8C8]'
                }`}>
                  <div className="flex items-center justify-between border-b pb-3 border-emerald-900/30">
                    <span className={`text-[10px] uppercase px-3 py-1 rounded-full font-bold tracking-wider ${
                      isDark ? 'bg-[#1A3827] text-[#4ADE80] border border-[#4ADE80]/30' : 'bg-[#E1EFE0] text-[#183B28]'
                    }`}>
                      {postCategory}
                    </span>

                    {/* Edit Post Option Button */}
                    <button
                      type="button"
                      onClick={() => setComposerMode('write')}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 cursor-pointer border transition-all ${
                        isDark ? 'bg-[#1A3827] text-[#4ADE80] border-[#4ADE80]/50 hover:bg-[#254B35]' : 'bg-[#E1EFE0] text-[#183B28] border-[#C3DEC0] hover:bg-[#C3DEC0]'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#4ADE80]" />
                      <span>Edit Post ✏️</span>
                    </button>
                  </div>

                  <h3 className={`font-display text-2xl font-bold ${isDark ? 'text-white' : 'text-[#0F2418]'}`}>
                    {postTitle || 'Untitled Discussion'}
                  </h3>

                  <p className={`text-sm leading-relaxed whitespace-pre-line ${isDark ? 'text-slate-200' : 'text-[#0F2418]'}`}>
                    {postContent || 'No observations written yet.'}
                  </p>

                  {postImage && (
                    <img src={postImage} alt="Attachment Preview" className="w-full max-h-64 object-cover rounded-2xl border border-[#20422E] mt-2" />
                  )}

                  {postTags && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {postTags.split(',').map((tg) => tg.trim()).filter(Boolean).map((t) => (
                        <span key={t} className="text-xs font-semibold text-[#4ADE80]">#{t}</span>
                      ))}
                    </div>
                  )}

                  {/* Preview Footer Action Bar with Edit & Publish options */}
                  <div className={`flex items-center justify-between pt-4 border-t ${
                    isDark ? 'border-[#20422E]' : 'border-[#E0D8C8]'
                  }`}>
                    <button
                      type="button"
                      onClick={() => setComposerMode('write')}
                      className={`px-4 py-2 rounded-full text-xs font-bold border transition-colors cursor-pointer ${
                        isDark ? 'bg-[#13271C] border-[#20422E] text-slate-300 hover:text-white' : 'bg-[#EDE6D8] border-[#D4CBB8] text-[#183B28]'
                      }`}
                    >
                      ← Back to Edit
                    </button>

                    <button
                      type="button"
                      onClick={handleCreatePostSubmit}
                      className={`px-6 py-2.5 rounded-full font-bold text-sm transition-all shadow-md cursor-pointer ${
                        isDark ? 'bg-[#4ADE80] text-[#07130B] hover:bg-[#3ECE77]' : 'bg-[#183B28] text-[#FAF7F0] hover:bg-[#255239]'
                      }`}
                    >
                      Publish Post
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>


      {/* ──────────────── MAIN CONTAINER ──────────────── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        
        {/* ──────────────── HEADER BAR ──────────────── */}
        <div className={`flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 sm:p-8 rounded-3xl backdrop-blur-xl shadow-2xl relative overflow-hidden border transition-colors ${
          isDark ? 'bg-[#112318]/90 border-[#20452F] text-white' : 'bg-[#FDFBF7] border-[#E3DDD1] text-[#0F2418]'
        }`}>
          <div className="space-y-1 z-10">
            <p className={`text-xs uppercase tracking-[0.2em] font-semibold flex items-center gap-1.5 ${
              isDark ? 'text-[#E6C176]' : 'text-[#D4A359]'
            }`}>
              <Sparkles className={`w-3.5 h-3.5 animate-pulse ${isDark ? 'text-[#E6C176]' : 'text-[#D4A359]'}`} />
              Shared Field
            </p>
            <h1 className={`font-display text-3xl sm:text-4xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-[#0F2418]'}`}>
              {t.title}
            </h1>
            <p className={`text-xs sm:text-sm max-w-xl font-normal leading-relaxed pt-1 ${
              isDark ? 'text-slate-300/80' : 'text-[#3E5C48]'
            }`}>
              {t.subtitle}
            </p>
          </div>

          <div className="flex items-center gap-3 z-10 shrink-0">
            {/* Notification Badge Toggle */}
            <button
              onClick={() => setShowNotifDrawer(true)}
              className={`relative p-3 rounded-2xl border cursor-pointer transition-colors ${
                isDark ? 'bg-[#1A3626] border-[#2D5A3F] text-slate-200 hover:text-white' : 'bg-[#EDE6D8] border-[#D4CBB8] text-[#183B28] hover:text-[#0F2418]'
              }`}
              title="Notifications"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadNotifCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center animate-bounce">
                  {unreadNotifCount}
                </span>
              )}
            </button>

            {/* Create Post Action Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCreateModal(true)}
              className={`px-5 py-3 rounded-2xl font-semibold text-sm transition-all flex items-center gap-2 shadow-lg cursor-pointer ${
                isDark ? 'bg-[#4ADE80] text-[#07130B] hover:bg-[#3ECE77] shadow-[#4ADE80]/20' : 'bg-[#183B28] text-[#FAF7F0] hover:bg-[#255239]'
              }`}
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>{t.createPost}</span>
            </motion.button>
          </div>
        </div>

        {/* ──────────────── SEARCH & FILTER CONTROL BAR ──────────────── */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.searchPlaceholder}
                className={`w-full rounded-2xl pl-11 pr-4 py-3 text-sm outline-none transition-all ${
                  isDark
                    ? 'bg-[#12241A] border border-[#234A33] text-white placeholder:text-slate-500 focus:border-[#4ADE80]'
                    : 'bg-[#F2ECE1] border border-[#E0D8C8] text-[#0F2418] placeholder:text-[#3E5C48] focus:border-[#183B28] shadow-xs'
                }`}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                  className={`absolute right-3 top-1/2 -translate-y-1/2 ${isDark ? 'text-slate-400 hover:text-white' : 'text-[#3E5C48] hover:text-[#0F2418]'}`}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Sort Select */}
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-slate-400 hidden sm:block" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className={`text-xs font-medium rounded-2xl px-4 py-3 outline-none w-full sm:w-auto cursor-pointer border ${
                  isDark
                    ? 'bg-[#12241A] border-[#234A33] text-slate-200 focus:border-[#4ADE80]'
                    : 'bg-[#F2ECE1] border-[#E0D8C8] text-[#0F2418] focus:border-[#183B28] shadow-xs'
                }`}
              >
                <option value="newest">Sort: Newest</option>
                <option value="most_reacted">Sort: Most Popular</option>
                <option value="most_commented">Sort: Most Discussed</option>
              </select>
            </div>
          </div>

          {/* Navigation Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-chat-scroll scrollbar-none">
            {[
              { id: 'all', label: t.tabAll },
              { id: 'trending', label: t.tabTrending },
              { id: 'latest', label: t.tabLatest },
              { id: 'following', label: t.tabFollowing },
              { id: 'saved', label: t.tabSaved },
              { id: 'my_posts', label: t.tabMyPosts },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer border ${
                  activeTab === tab.id
                    ? isDark
                      ? 'bg-[#4ADE80] text-[#07130B] border-[#4ADE80] shadow-md shadow-[#4ADE80]/15'
                      : 'bg-[#183B28] text-[#FAF7F0] border-[#183B28] shadow-md'
                    : isDark
                      ? 'bg-[#13271C] border-[#20422E] text-slate-300 hover:text-white hover:bg-[#1A3827]'
                      : 'bg-[#FDFBF7] border-[#E3DDD1] text-[#3E5C48] hover:bg-[#F2ECE1] shadow-xs'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Categories Pill Bar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            {[
              t.catAll,
              t.catNature,
              t.catAI,
              t.catGeneral,
              t.catEducation,
              t.catQA,
              t.catIdeas,
            ].map((catName, idx) => {
              const val = idx === 0 ? 'All' : [
                'Nature & Ecology', 'AI & Technology', 'General Discussion', 'Education & Learning', 'Questions & Answers', 'Ideas & Suggestions'
              ][idx - 1];
              return (
                <button
                  key={catName}
                  onClick={() => setSelectedCategory(val)}
                  className={`px-3 py-1.5 rounded-full border text-[11px] font-medium whitespace-nowrap transition-colors cursor-pointer ${
                    selectedCategory === val
                      ? isDark
                        ? 'bg-[#1A3827] border-[#4ADE80] text-[#4ADE80]'
                        : 'bg-[#183B28] border-[#183B28] text-[#FAF7F0] font-semibold'
                      : isDark
                        ? 'bg-[#0E2015]/60 border-[#20422E] text-slate-400 hover:text-slate-200'
                        : 'bg-[#FDFBF7] border-[#E3DDD1] text-[#3E5C48] hover:bg-[#F2ECE1] shadow-xs'
                  }`}
                >
                  {catName}
                </button>
              );
            })}
          </div>
        </div>

        {/* ──────────────── POSTS FEED ──────────────── */}
        <div className="space-y-5">
          {communityError && (
            <div className="bg-red-500/15 border border-red-500/40 rounded-2xl px-4 py-3 text-xs text-red-500">
              {communityError}
            </div>
          )}
          {!filteredPosts.length ? (
            <div className={`rounded-3xl p-12 text-center space-y-3 border ${
              isDark ? 'bg-[#112318] border-[#20452F]' : 'bg-[#FDFBF7] border-[#E3DDD1] shadow-sm'
            }`}>
              <Sparkles className="w-10 h-10 text-slate-400 mx-auto animate-pulse" />
              <h3 className={`font-display text-xl font-semibold ${isDark ? 'text-white' : 'text-[#0F2418]'}`}>{t.noPostsFound}</h3>
              <p className={`text-xs max-w-sm mx-auto ${isDark ? 'text-slate-400' : 'text-[#3E5C48]'}`}>
                Try searching for a different keyword or create a new discussion thread.
              </p>
            </div>
          ) : (
            filteredPosts.map((post) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`rounded-3xl p-5 sm:p-7 shadow-xl space-y-4 backdrop-blur-xl relative overflow-hidden border transition-colors ${
                  post.pinned
                    ? isDark ? 'bg-[#112318]/90 border-[#4ADE80]/60 ring-1 ring-[#4ADE80]/30' : 'bg-[#FDFBF7] border-[#183B28] ring-1 ring-[#183B28]/30 shadow-md'
                    : isDark ? 'bg-[#112318]/90 border-[#20452F]' : 'bg-[#FDFBF7] border-[#E3DDD1] shadow-sm'
                }`}
              >
                {/* Pinned Badge */}
                {post.pinned && (
                  <div className={`flex items-center gap-1.5 text-[11px] font-semibold tracking-wider uppercase mb-1 ${
                    isDark ? 'text-[#4ADE80]' : 'text-[#183B28]'
                  }`}>
                    <Pin className="w-3.5 h-3.5" />
                    <span>{t.pinned}</span>
                  </div>
                )}

                {/* Author Info & Actions */}
                <div className="flex items-center justify-between gap-3">
                  <div
                    onClick={() => setSelectedProfileUser(post.author)}
                    className="flex items-center gap-3 cursor-pointer group"
                  >
                    <div className={`w-10 h-10 rounded-2xl border flex items-center justify-center text-lg shadow-xs transition-colors ${
                      isDark ? 'bg-[#1A3827] border-[#2D5A3F] group-hover:border-[#4ADE80]' : 'bg-[#E1EFE0] border-[#C3DEC0] text-[#183B28] group-hover:border-[#183B28]'
                    }`}>
                      {post.author?.avatar || '🌿'}
                    </div>
                    <div>
                      <h4 className={`text-sm font-semibold transition-colors flex items-center gap-1.5 ${
                        isDark ? 'text-white group-hover:text-[#4ADE80]' : 'text-[#0F2418] group-hover:text-[#183B28]'
                      }`}>
                        {post.author?.name}
                      </h4>
                      <p className={`text-[11px] ${isDark ? 'text-slate-400' : 'text-[#3E5C48]'}`}>
                        {post.author?.city} · {formatWhen(post.created_at)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Follow User Button */}
                    <button
                      onClick={() => toggleFollowUser(post.author?.id, post.author?.name)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                        followedUserIds.includes(post.author?.id)
                          ? isDark ? 'bg-[#1A3827] text-white border border-[#4ADE80]' : 'bg-[#E1EFE0] text-[#183B28] border border-[#C3DEC0]'
                          : isDark ? 'bg-[#13271C] border border-[#20422E] text-slate-300 hover:text-white' : 'bg-[#EDE6D8] border border-[#D4CBB8] text-[#183B28] hover:bg-[#E3DDD1]'
                      }`}
                    >
                      {followedUserIds.includes(post.author?.id) ? t.following : `+ ${t.follow}`}
                    </button>

                    {/* Bookmark Save Button */}
                    <button
                      onClick={() => toggleSavePost(post.id)}
                      className={`p-2 rounded-full border transition-colors cursor-pointer ${
                        savedPostIds.includes(post.id)
                          ? isDark ? 'bg-[#4ADE80]/20 border-[#4ADE80] text-[#4ADE80]' : 'bg-[#E1EFE0] border-[#183B28] text-[#183B28]'
                          : isDark ? 'bg-[#13271C] border-[#20422E] text-slate-400 hover:text-white' : 'bg-[#EDE6D8] border-[#D4CBB8] text-[#3E5C48] hover:text-[#0F2418]'
                      }`}
                      title={savedPostIds.includes(post.id) ? t.saved : t.save}
                    >
                      <Bookmark className="w-4 h-4" />
                    </button>

                    {/* Delete if owner */}
                    {String(post.author?.id) === String(myId) && (
                      <button
                        onClick={() => handleDeletePost(post.id)}
                        className="p-2 rounded-full bg-red-500/10 border border-red-500/30 text-red-500 hover:bg-red-500/20 cursor-pointer"
                        title="Delete Post"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Post Main Body */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] uppercase font-semibold px-2.5 py-0.5 rounded-full border ${
                      isDark ? 'bg-[#1A3827] text-[#4ADE80] border-[#4ADE80]/30' : 'bg-[#E1EFE0] text-[#183B28] border-[#C3DEC0]'
                    }`}>
                      {post.category}
                    </span>
                  </div>

                  <h3 className={`font-display text-xl sm:text-2xl font-bold leading-snug ${
                    isDark ? 'text-white' : 'text-[#0F2418]'
                  }`}>
                    {post.title}
                  </h3>

                  <p className={`text-sm leading-relaxed font-normal ${
                    isDark ? 'text-slate-200' : 'text-[#0F2418]'
                  }`}>
                    {post.content}
                  </p>

                  {/* Post Image Attachment */}
                  {post.image_url && (
                    <img
                      src={post.image_url}
                      alt="Attachment"
                      className={`w-full max-h-80 object-cover rounded-2xl border mt-3 ${
                        isDark ? 'border-[#20422E]' : 'border-[#E3DDD1]'
                      }`}
                    />
                  )}

                  {/* Tags */}
                  {post.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {post.tags.map((tg) => (
                        <span key={tg} className={`text-[11px] cursor-pointer ${
                          isDark ? 'text-slate-400 hover:text-[#4ADE80]' : 'text-[#3E5C48] hover:text-[#183B28] font-medium'
                        }`}>
                          #{tg}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* AI Features Bar */}
                <div className={`flex flex-wrap items-center gap-2 pt-2 border-t ${
                  isDark ? 'border-[#20452F]' : 'border-[#E3DDD1]'
                }`}>
                  <button
                    onClick={() => handleAISummarize(post.id)}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-xs ${
                      isDark
                        ? 'bg-[#1A3827] hover:bg-[#234B34] border-[#4ADE80]/40 text-[#4ADE80]'
                        : 'bg-[#E1EFE0] hover:bg-[#C3DEC0] border-[#C3DEC0] text-[#183B28]'
                    }`}
                  >
                    <Sparkles className={`w-3.5 h-3.5 ${isDark ? 'text-[#4ADE80]' : 'text-[#183B28]'}`} />
                    <span>{t.summarizeAI}</span>
                  </button>

                  {post.category === 'Questions & Answers' && !post.aiAnswer && (
                    <button
                      onClick={() => handleAISuggestedAnswer(post.id)}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-1.5 cursor-pointer ${
                        isDark
                          ? 'bg-[#1A3827] hover:bg-[#234B34] border-amber-400/40 text-amber-300'
                          : 'bg-[#FAF2E4] hover:bg-[#F2E5D0] border-[#D4A359] text-[#916B25]'
                      }`}
                    >
                      <Lightbulb className={`w-3.5 h-3.5 ${isDark ? 'text-amber-300' : 'text-[#916B25]'}`} />
                      <span>{t.aiSuggestedAnswer}</span>
                    </button>
                  )}
                </div>

                {/* AI Summary Rendered Box */}
                {post.aiSummary && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`border p-3.5 rounded-2xl text-xs space-y-1 ${
                      isDark ? 'bg-[#0E2015] border-[#4ADE80]/40 text-slate-200' : 'bg-[#E1EFE0] border-[#C3DEC0] text-[#0F2418]'
                    }`}
                  >
                    <p className={`font-semibold flex items-center gap-1 ${isDark ? 'text-[#4ADE80]' : 'text-[#183B28]'}`}>
                      <Sparkles className="w-3.5 h-3.5" /> AI Executive Summary
                    </p>
                    <p>{post.aiSummary}</p>
                  </motion.div>
                )}

                {/* AI Answer Rendered Box */}
                {post.aiAnswer && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`border p-3.5 rounded-2xl text-xs space-y-1 ${
                      isDark ? 'bg-[#16271D] border-amber-400/40 text-slate-200' : 'bg-[#FAF2E4] border-[#D4A359] text-[#0F2418]'
                    }`}
                  >
                    <p className={`font-semibold flex items-center gap-1 ${isDark ? 'text-amber-300' : 'text-[#916B25]'}`}>
                      <Lightbulb className="w-3.5 h-3.5" /> {t.aiSuggestedAnswer}
                    </p>
                    <p>{post.aiAnswer}</p>
                  </motion.div>
                )}

                {/* 5-Reaction Micro-Interactive Toolbar */}
                <div className={`flex flex-wrap items-center justify-between gap-2 pt-2 border-t ${
                  isDark ? 'border-[#20452F]/60' : 'border-[#E3DDD1]'
                }`}>
                  <div className="flex flex-wrap items-center gap-1.5">
                    {[
                      { key: 'like', label: t.like, icon: ThumbsUp, color: 'text-blue-500' },
                      { key: 'insightful', label: t.insightful, icon: Lightbulb, color: 'text-amber-500' },
                      { key: 'ecoLove', label: t.ecoLove, icon: Heart, color: 'text-emerald-500' },
                      { key: 'hot', label: t.hot, icon: Flame, color: 'text-orange-500' },
                      { key: 'educational', label: t.educational, icon: Award, color: 'text-purple-500' },
                    ].map((rx) => {
                      const active = post.userReactions?.[rx.key];
                      const count = post.reactions?.[rx.key] || 0;
                      return (
                        <motion.button
                          key={rx.key}
                          whileHover={{ scale: 1.08 }}
                          whileTap={{ scale: 0.92 }}
                          onClick={() => handleReaction(post.id, rx.key)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer border ${
                            active
                              ? isDark
                                ? 'bg-[#1A3827] border-[#4ADE80] text-white shadow-xs'
                                : 'bg-[#E1EFE0] border-[#183B28] text-[#183B28] shadow-xs'
                              : isDark
                                ? 'bg-[#13271C] border-[#20422E] text-slate-400 hover:text-slate-200'
                                : 'bg-[#EDE6D8] border-[#D4CBB8] text-[#3E5C48] hover:bg-[#E3DDD1]'
                          }`}
                        >
                          <rx.icon className={`w-3.5 h-3.5 ${active ? rx.color : isDark ? 'text-slate-400' : 'text-[#3E5C48]'}`} />
                          <span>{count}</span>
                        </motion.button>
                      );
                    })}
                  </div>

                  <span className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-[#3E5C48]'}`}>
                    {post.comments?.length || 0} {t.comments}
                  </span>
                </div>

                {/* ──────────────── COMMENTS THREAD ──────────────── */}
                <div className="pt-3 space-y-3">
                  {/* Top Level Comments List */}
                  {post.comments?.map((cm) => (
                    <div key={cm.id} className={`p-3.5 rounded-2xl space-y-2 border ${
                      isDark ? 'bg-[#0E2015] border-[#20422E]' : 'bg-[#F2ECE1] border-[#E0D8C8]'
                    }`}>
                      <div className="flex items-center justify-between text-xs">
                        <span className={`font-semibold ${isDark ? 'text-white' : 'text-[#0F2418]'}`}>{cm.author?.name} · {cm.author?.city}</span>
                        <span className={`text-[10px] ${isDark ? 'text-slate-500' : 'text-[#3E5C48]'}`}>{formatWhen(cm.created_at)}</span>
                      </div>
                      <p className={`text-xs sm:text-sm ${isDark ? 'text-slate-200' : 'text-[#0F2418]'}`}>{cm.content}</p>

                      {/* Reply Toggle */}
                      <button
                        onClick={() => setActiveReplyId(activeReplyId === cm.id ? null : cm.id)}
                        className={`text-[11px] hover:underline flex items-center gap-1 cursor-pointer font-medium ${
                          isDark ? 'text-[#4ADE80]' : 'text-[#183B28] font-bold'
                        }`}
                      >
                        <CornerDownRight className="w-3 h-3" />
                        <span>{t.reply}</span>
                      </button>

                      {/* Nested Threaded Replies */}
                      {cm.replies?.length > 0 && (
                        <div className={`pl-4 border-l-2 space-y-2 pt-1 ${
                          isDark ? 'border-[#20422E]' : 'border-[#D4CBB8]'
                        }`}>
                          {cm.replies.map((rp) => (
                            <div key={rp.id} className={`p-2.5 rounded-xl text-xs space-y-1 ${
                              isDark ? 'bg-[#13271C]' : 'bg-[#FDFBF7] border border-[#E3DDD1] shadow-xs'
                            }`}>
                              <div className={`flex justify-between text-[11px] ${
                                isDark ? 'text-slate-400' : 'text-[#3E5C48]'
                              }`}>
                                <span className={`font-semibold ${isDark ? 'text-slate-200' : 'text-[#0F2418]'}`}>{rp.author?.name}</span>
                                <span>{formatWhen(rp.created_at)}</span>
                              </div>
                              <p className={isDark ? 'text-slate-300' : 'text-[#0F2418]'}>{rp.content}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Reply Input Form */}
                      {activeReplyId === cm.id && (
                        <div className="flex items-center gap-2 pt-2">
                          <input
                            value={replyInputs[cm.id] || ''}
                            onChange={(e) => setReplyInputs({ ...replyInputs, [cm.id]: e.target.value })}
                            placeholder="Write a reply…"
                            className={`flex-1 rounded-xl px-3 py-1.5 text-xs outline-none transition-colors ${
                              isDark ? 'bg-[#13271C] border border-[#20422E] text-white focus:border-[#4ADE80]' : 'bg-[#FDFBF7] border border-[#E0D8C8] text-[#0F2418] focus:border-[#183B28]'
                            }`}
                          />
                          <button
                            onClick={() => handleAddReply(post.id, cm.id)}
                            className={`px-3 py-1.5 rounded-xl font-semibold text-xs cursor-pointer ${
                              isDark ? 'bg-[#4ADE80] text-[#07130B] hover:bg-[#3ECE77]' : 'bg-[#183B28] text-[#FAF7F0] hover:bg-[#255239]'
                            }`}
                          >
                            Reply
                          </button>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Add Top Comment Input */}
                  <div className="flex items-center gap-2 pt-1">
                    <input
                      value={commentInputs[post.id] || ''}
                      onChange={(e) => setCommentInputs({ ...commentInputs, [post.id]: e.target.value })}
                      placeholder="Add a comment to this discussion…"
                      className={`flex-1 rounded-2xl px-4 py-2.5 text-xs sm:text-sm outline-none transition-colors ${
                        isDark
                          ? 'bg-[#12241A] border border-[#234A33] text-white placeholder:text-slate-500 focus:border-[#4ADE80]'
                          : 'bg-[#F2ECE1] border border-[#E0D8C8] text-[#0F2418] placeholder:text-[#3E5C48] focus:border-[#183B28] shadow-xs'
                      }`}
                    />
                    <button
                      onClick={() => handleAddComment(post.id)}
                      className={`px-4 py-2.5 rounded-2xl font-semibold text-xs sm:text-sm cursor-pointer shrink-0 transition-colors ${
                        isDark ? 'bg-[#4ADE80] text-[#07130B] hover:bg-[#3ECE77]' : 'bg-[#183B28] text-[#FAF7F0] hover:bg-[#255239]'
                      }`}
                    >
                      Comment
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
