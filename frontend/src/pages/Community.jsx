import { useEffect, useState, useRef } from 'react';
import { 
  Sparkles, Search, Plus, ThumbsUp, Heart, Lightbulb, Flame, Award, 
  MessageSquare, Bookmark, Share2, Flag, UserPlus, UserCheck, Trash2, 
  Edit3, Check, Filter, Bell, Tag, ArrowRight, Eye, ShieldAlert, Pin, 
  CornerDownRight, CheckCheck, RefreshCw, X, FileText, Globe, Image as ImageIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
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

// Initial Rich Seed Posts for All Categories & Tabs
const INITIAL_POSTS = [
  {
    id: 'post-101',
    author: { id: 'u1', name: 'Dr. Aarav Patel', city: 'Ahmedabad', avatar: '🌱', bio: 'Botanist & Urban Forest Researcher' },
    title: 'Observing Dawn Nesting Behavior in Banyan Canopy',
    category: 'Nature & Ecology',
    content: 'Spent 45 quiet minutes this dawn observing 3 distinct bird species in the ancient Banyan near the lake. The Indian Myna and Sunbirds show incredible cooperative foraging before sunrise.',
    tags: ['biodiversity', 'birds', 'banyan', 'urbanwild'],
    pinned: true,
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    reactions: { like: 14, insightful: 9, ecoLove: 22, hot: 5, educational: 11 },
    userReactions: { ecoLove: true },
    comments: [
      {
        id: 'c101',
        author: { name: 'Priya Sharma', city: 'Mumbai' },
        content: 'Fascinating observation! Did you notice any temperature drop near the roots?',
        created_at: new Date(Date.now() - 3600000).toISOString(),
        replies: [
          {
            id: 'r101',
            author: { name: 'Dr. Aarav Patel', city: 'Ahmedabad' },
            content: 'Yes! Root canopy area was roughly 2.5°C cooler than the open sidewalk.',
            created_at: new Date(Date.now() - 1800000).toISOString(),
          }
        ]
      }
    ],
    aiSummary: null,
  },
  {
    id: 'post-102',
    author: { id: 'u2', name: 'Rohan Mehta', city: 'Surat', avatar: '🦅', bio: 'Wildlife Photographer' },
    title: 'How can AI Neural Vision improve species identification accuracy?',
    category: 'AI & Technology',
    content: 'When using Nature Lens under low morning light, high ISO noise sometimes affects leaf pattern recognition. How can we leverage multi-frame stacking to improve accuracy?',
    tags: ['ai', 'computer-vision', 'nature-lens', 'tech'],
    pinned: false,
    created_at: new Date(Date.now() - 3600000 * 6).toISOString(),
    reactions: { like: 18, insightful: 25, ecoLove: 14, hot: 12, educational: 17 },
    userReactions: { insightful: true },
    comments: [],
    aiSummary: null,
    aiAnswer: null,
  },
  {
    id: 'post-103',
    author: { id: 'u3', name: 'Neha Gupta', city: 'Delhi', avatar: '🌸', bio: 'Environmental Educator' },
    title: 'Weekly Community Action: Installing Bird Water Dishes Before Summer',
    category: 'Ideas & Suggestions',
    content: 'As temperature rises across urban areas, small shallow water dishes placed in shaded garden corners provide critical hydration for migratory birds and pollinators.',
    tags: ['community-act', 'wildlife', 'conservation'],
    pinned: false,
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
    reactions: { like: 25, insightful: 16, ecoLove: 38, hot: 9, educational: 18 },
    userReactions: { like: true },
    comments: [],
    aiSummary: null,
  },
  {
    id: 'post-104',
    author: { id: 'u4', name: 'Kavita Shah', city: 'Vadodara', avatar: '🦋', bio: 'Micro-climate Specialist' },
    title: 'Sharing Local Neighborhood Micro-Climate Experiences',
    category: 'General Discussion',
    content: 'Notice how humidity levels increase dramatically near urban parks during early morning hours. Let us share observations on micro-climates in your city!',
    tags: ['microclimate', 'humidity', 'urban-parks'],
    pinned: false,
    created_at: new Date(Date.now() - 3600000 * 18).toISOString(),
    reactions: { like: 18, insightful: 12, ecoLove: 20, hot: 6, educational: 14 },
    userReactions: { ecoLove: true },
    comments: [],
    aiSummary: null,
  },
  {
    id: 'post-105',
    author: { id: 'u1', name: 'Dr. Aarav Patel', city: 'Ahmedabad', avatar: '🌱', bio: 'Botanist & Urban Forest Researcher' },
    title: 'Understanding Seasonal Leaf Color Variations & Photosynthesis Efficiency',
    category: 'Education & Learning',
    content: 'A comprehensive guide for students and nature enthusiasts on how chlorophyll breakdown reveals carotenoid and anthocyanin pigments during seasonal transitions.',
    tags: ['photosynthesis', 'botany', 'education'],
    pinned: false,
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
    reactions: { like: 30, insightful: 22, ecoLove: 15, hot: 8, educational: 25 },
    userReactions: { educational: true },
    comments: [],
    aiSummary: null,
  },
  {
    id: 'post-106',
    author: { id: 'u2', name: 'Rohan Mehta', city: 'Surat', avatar: '🦅', bio: 'Wildlife Photographer' },
    title: 'Which species of butterflies visit urban flowering plants in morning hours?',
    category: 'Questions & Answers',
    content: 'Looking for identification pointers on common swallowtail and monarch butterflies observed around city garden flowers between 7 AM and 9 AM.',
    tags: ['butterflies', 'pollinators', 'qa'],
    pinned: false,
    created_at: new Date(Date.now() - 3600000 * 30).toISOString(),
    reactions: { like: 12, insightful: 18, ecoLove: 14, hot: 7, educational: 16 },
    userReactions: { insightful: true },
    comments: [],
    aiSummary: null,
  },
  {
    id: 'post-107',
    author: { id: 'my-user-id', name: 'My Explorer', city: 'Local Region', avatar: '🌳', bio: 'Passionate Nature Explorer' },
    title: 'My Neighborhood Tree Canopy & Bird Sanctuary Journal',
    category: 'Nature & Ecology',
    content: 'Documenting 5 native trees and bird activity in my neighborhood. Observed Sunbirds and Parakeets feeding on flower nectar early this morning!',
    tags: ['my-journal', 'birds', 'trees'],
    pinned: false,
    created_at: new Date(Date.now() - 3600000 * 36).toISOString(),
    reactions: { like: 19, insightful: 11, ecoLove: 24, hot: 5, educational: 9 },
    userReactions: { ecoLove: true },
    comments: [],
    aiSummary: null,
  }
];

export default function Community() {
  const { user } = useAuth();
  const lang = localStorage.getItem('pulse_chat_lang') || 'en';
  const t = COMMUNITY_TRANSLATIONS[lang] || COMMUNITY_TRANSLATIONS.en;

  // Persistent States
  const [posts, setPosts] = useState(() => {
    try {
      const saved = localStorage.getItem('pulse_community_posts_v4');
      return saved ? JSON.parse(saved) : INITIAL_POSTS;
    } catch {
      return INITIAL_POSTS;
    }
  });

  const [savedPostIds, setSavedPostIds] = useState(() => {
    try {
      const saved = localStorage.getItem('pulse_community_saved_v4');
      return saved ? JSON.parse(saved) : ['post-101', 'post-103', 'post-105', 'post-107'];
    } catch {
      return ['post-101'];
    }
  });

  const [followedUserIds, setFollowedUserIds] = useState(() => {
    try {
      const saved = localStorage.getItem('pulse_community_follows_v4');
      return saved ? JSON.parse(saved) : ['u1', 'u2', 'u3', 'u4'];
    } catch {
      return ['u1'];
    }
  });

  const [notifications, setNotifications] = useState(() => {
    try {
      const saved = localStorage.getItem('pulse_community_notifications_v4');
      return saved
        ? JSON.parse(saved)
        : [
            { id: 'n1', text: 'Dr. Aarav Patel liked your comment', time: '2h ago', read: false },
            { id: 'n2', text: 'Priya Sharma started following you', time: '5h ago', read: false },
          ];
    } catch {
      return [];
    }
  });

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

  // New Post Form State
  const [postTitle, setPostTitle] = useState('');
  const [postCategory, setPostCategory] = useState('Nature & Ecology');
  const [postContent, setPostContent] = useState('');
  const [postTags, setPostTags] = useState('');
  const [postImage, setPostImage] = useState(null);
  const [composerMode, setComposerMode] = useState('write'); // write, preview
  const fileInputRef = useRef(null);

  // Comment & Reply State
  const [commentInputs, setCommentInputs] = useState({});
  const [replyInputs, setReplyInputs] = useState({});
  const [activeReplyId, setActiveReplyId] = useState(null);

  // Save Posts to LocalStorage
  useEffect(() => {
    localStorage.setItem('pulse_community_posts_v4', JSON.stringify(posts));
  }, [posts]);

  useEffect(() => {
    localStorage.setItem('pulse_community_saved_v4', JSON.stringify(savedPostIds));
  }, [savedPostIds]);

  useEffect(() => {
    localStorage.setItem('pulse_community_follows_v4', JSON.stringify(followedUserIds));
  }, [followedUserIds]);

  useEffect(() => {
    localStorage.setItem('pulse_community_notifications_v4', JSON.stringify(notifications));
  }, [notifications]);

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
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        const summary = `AI Summary: ${p.title} highlights key field observations on local species shelter patterns and urban biodiversity rhythms.`;
        return { ...p, aiSummary: summary };
      })
    );
  };

  // AI Suggested Answer for Q&A
  const handleAISuggestedAnswer = (postId) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        const answer = `AI Solution: Based on multi-frame camera sensor parameters, increasing shutter speed while maintaining ISO 400 under foliage produces optimal feature edges for species recognition.`;
        return { ...p, aiAnswer: answer };
      })
    );
  };

  // AI Suggest Tags
  const handleAISuggestTags = () => {
    const suggested = ['urban-nature', 'ecological-notes', 'field-observation'];
    const currentList = postTags ? postTags.split(',').map((t) => t.trim()) : [];
    const combined = Array.from(new Set([...currentList, ...suggested])).join(', ');
    setPostTags(combined);
  };

  // Create Post Submit Handler
  const handleCreatePostSubmit = (e) => {
    e.preventDefault();
    if (!postTitle.trim() || !postContent.trim()) return;

    const newPost = {
      id: `post-${Date.now()}`,
      author: {
        id: user?.id || 'my-user-id',
        name: user?.email?.split('@')[0] || 'My Explorer',
        city: 'Local Region',
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
      reactions: { like: 1, insightful: 0, ecoLove: 1, hot: 0, educational: 0 },
      userReactions: { ecoLove: true },
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
  };

  // Delete Post
  const handleDeletePost = (postId) => {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
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
        return p.author?.id === (user?.id || 'my-user-id') || p.author?.name === user?.email?.split('@')[0];
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
    <div className="min-h-screen bg-[#07130B] text-slate-100 font-sans selection:bg-[#4ADE80]/30 selection:text-white pb-20">
      
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
              className="w-full max-w-sm h-full bg-[#0E1F14] border-l border-[#20452F] p-5 shadow-2xl flex flex-col justify-between"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="space-y-4 flex-1 flex flex-col min-h-0">
                <div className="flex items-center justify-between border-b border-[#20452F] pb-3">
                  <div className="flex items-center gap-2 text-white font-semibold text-base">
                    <Bell className="w-5 h-5 text-[#4ADE80]" />
                    <span>{t.notificationsTitle}</span>
                  </div>
                  <button onClick={() => setShowNotifDrawer(false)} className="p-1 rounded-full text-slate-400 hover:text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {unreadNotifCount > 0 && (
                  <button
                    onClick={markAllNotifsRead}
                    className="text-xs text-[#4ADE80] hover:underline text-left cursor-pointer font-medium"
                  >
                    ✓ {t.markAllRead}
                  </button>
                )}

                <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-chat-scroll">
                  {!notifications.length ? (
                    <p className="text-xs text-slate-500 py-8 text-center">{t.noNotifications}</p>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        className={`p-3 rounded-2xl border transition-colors ${
                          n.read ? 'bg-[#13271C]/50 border-[#20422E] text-slate-400' : 'bg-[#1A3827] border-[#4ADE80]/40 text-white shadow-xs'
                        }`}
                      >
                        <p className="text-xs font-medium leading-snug">{n.text}</p>
                        <p className="text-[10px] text-slate-500 mt-1">{n.time}</p>
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
              className="bg-[#112318] border border-[#20452F] rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 relative overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl bg-[#1A3827] border border-[#4ADE80]/50 flex items-center justify-center text-2xl shadow-md">
                    {selectedProfileUser.avatar || '🌿'}
                  </div>
                  <div>
                    <h3 className="font-display text-xl font-bold text-white">{selectedProfileUser.name}</h3>
                    <p className="text-xs text-emerald-400 font-medium">{selectedProfileUser.city}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedProfileUser(null)} className="p-1 rounded-full text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs sm:text-sm text-slate-300 bg-[#0E2015] border border-[#20422E] p-3 rounded-2xl leading-relaxed italic">
                "{selectedProfileUser.bio || 'Exploring nature observations and sharing community insights.'}"
              </p>

              <div className="grid grid-cols-3 gap-2 text-center py-2 bg-[#13271C] rounded-2xl border border-[#20422E]">
                <div>
                  <p className="text-lg font-bold text-white">
                    {posts.filter((p) => p.author?.name === selectedProfileUser.name).length}
                  </p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider">Posts</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-white">
                    {followedUserIds.includes(selectedProfileUser.id) ? 1 : 0}
                  </p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider">Followers</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-[#4ADE80]">98%</p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-wider">Helpful</p>
                </div>
              </div>

              <button
                onClick={() => toggleFollowUser(selectedProfileUser.id, selectedProfileUser.name)}
                className={`w-full py-2.5 rounded-2xl text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md ${
                  followedUserIds.includes(selectedProfileUser.id)
                    ? 'bg-[#1A3827] text-white border border-[#4ADE80]'
                    : 'bg-[#4ADE80] text-[#07130B] hover:bg-[#3ECE77]'
                }`}
              >
                {followedUserIds.includes(selectedProfileUser.id) ? (
                  <>
                    <UserCheck className="w-4 h-4 text-[#4ADE80]" />
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
              className="bg-[#112318] border border-[#20452F] rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl space-y-5 relative overflow-hidden my-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center border-b border-[#20452F] pb-4">
                <h2 className="font-display text-2xl font-bold text-white">{t.createModalTitle}</h2>
                <div className="flex items-center gap-2">
                  <div className="flex rounded-full bg-[#13271C] p-1 border border-[#20422E]">
                    <button
                      type="button"
                      onClick={() => setComposerMode('write')}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        composerMode === 'write' ? 'bg-[#4ADE80] text-[#07130B]' : 'text-slate-400'
                      }`}
                    >
                      Write
                    </button>
                    <button
                      type="button"
                      onClick={() => setComposerMode('preview')}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        composerMode === 'preview' ? 'bg-[#4ADE80] text-[#07130B]' : 'text-slate-400'
                      }`}
                    >
                      {t.preview}
                    </button>
                  </div>
                  <button onClick={() => setShowCreateModal(false)} className="p-1 rounded-full text-slate-400 hover:text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {composerMode === 'write' ? (
                <form onSubmit={handleCreatePostSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1 font-semibold">
                      {t.postTitleLabel}
                    </label>
                    <input
                      required
                      value={postTitle}
                      onChange={(e) => setPostTitle(e.target.value)}
                      placeholder="e.g., Observing Dawn Nesting Behavior in Banyan Canopy"
                      className="w-full bg-[#0E2015] border border-[#20422E] rounded-2xl px-4 py-2.5 text-sm text-white outline-none focus:border-[#4ADE80]"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1 font-semibold">
                        {t.postCategoryLabel}
                      </label>
                      <select
                        value={postCategory}
                        onChange={(e) => setPostCategory(e.target.value)}
                        className="w-full bg-[#0E2015] border border-[#20422E] rounded-2xl px-3 py-2.5 text-sm text-white outline-none focus:border-[#4ADE80]"
                      >
                        <option value="Nature & Ecology">{t.catNature}</option>
                        <option value="AI & Technology">{t.catAI}</option>
                        <option value="General Discussion">{t.catGeneral}</option>
                        <option value="Education & Learning">{t.catEducation}</option>
                        <option value="Questions & Answers">{t.catQA}</option>
                        <option value="Ideas & Suggestions">{t.catIdeas}</option>
                      </select>
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                          {t.postTagsLabel}
                        </label>
                        <button
                          type="button"
                          onClick={handleAISuggestTags}
                          className="text-[10px] text-[#4ADE80] hover:underline flex items-center gap-1 cursor-pointer font-medium"
                        >
                          <Sparkles className="w-3 h-3" />
                          <span>{t.aiSuggestTags}</span>
                        </button>
                      </div>
                      <input
                        value={postTags}
                        onChange={(e) => setPostTags(e.target.value)}
                        placeholder="birds, trees, urbanwild"
                        className="w-full bg-[#0E2015] border border-[#20422E] rounded-2xl px-4 py-2.5 text-sm text-white outline-none focus:border-[#4ADE80]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider text-slate-400 mb-1 font-semibold">
                      {t.postContentLabel}
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={postContent}
                      onChange={(e) => setPostContent(e.target.value)}
                      placeholder="Share your detailed observations, questions, or ideas…"
                      className="w-full bg-[#0E2015] border border-[#20422E] rounded-2xl p-4 text-sm text-white outline-none focus:border-[#4ADE80] resize-none"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#13271C] border border-[#20422E] text-xs text-slate-300 hover:text-white cursor-pointer"
                    >
                      <ImageIcon className="w-4 h-4 text-[#4ADE80]" />
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
                      className="px-6 py-2.5 rounded-full bg-[#4ADE80] text-[#07130B] font-semibold text-sm hover:bg-[#3ECE77] transition-all shadow-md cursor-pointer"
                    >
                      {t.publish}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4 bg-[#0E2015] p-5 rounded-2xl border border-[#20422E]">
                  <span className="text-[10px] uppercase px-2.5 py-1 rounded-full bg-[#1A3827] text-[#4ADE80] font-semibold">
                    {postCategory}
                  </span>
                  <h3 className="font-display text-xl font-bold text-white">{postTitle || 'Untitled Post'}</h3>
                  <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-line">
                    {postContent || 'No content written yet.'}
                  </p>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ──────────────── MAIN CONTAINER ──────────────── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        
        {/* ──────────────── HEADER BAR ──────────────── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#112318]/90 border border-[#20452F] p-6 sm:p-8 rounded-3xl backdrop-blur-xl shadow-2xl relative overflow-hidden">
          <div className="space-y-1 z-10">
            <p className="text-xs uppercase tracking-[0.2em] text-[#E6C176] font-semibold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#E6C176] animate-pulse" />
              Shared Field
            </p>
            <h1 className="font-display text-3xl sm:text-4xl font-bold text-white tracking-tight">
              {t.title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300/80 max-w-xl font-normal leading-relaxed pt-1">
              {t.subtitle}
            </p>
          </div>

          <div className="flex items-center gap-3 z-10 shrink-0">
            {/* Notification Badge Toggle */}
            <button
              onClick={() => setShowNotifDrawer(true)}
              className="relative p-3 rounded-2xl bg-[#1A3626] border border-[#2D5A3F] text-slate-200 hover:text-white cursor-pointer"
              title="Notifications"
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
              className="px-5 py-3 rounded-2xl bg-[#4ADE80] text-[#07130B] font-semibold text-sm hover:bg-[#3ECE77] transition-all flex items-center gap-2 shadow-lg shadow-[#4ADE80]/20 cursor-pointer"
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
                className="w-full bg-[#12241A] border border-[#234A33] rounded-2xl pl-11 pr-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none focus:border-[#4ADE80] transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
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
                className="bg-[#12241A] border border-[#234A33] text-xs font-medium text-slate-200 rounded-2xl px-4 py-3 outline-none focus:border-[#4ADE80] w-full sm:w-auto cursor-pointer"
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
                className={`px-4 py-2 rounded-2xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-[#4ADE80] text-[#07130B] shadow-md shadow-[#4ADE80]/15'
                    : 'bg-[#13271C] border border-[#20422E] text-slate-300 hover:text-white hover:bg-[#1A3827]'
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
                      ? 'bg-[#1A3827] border-[#4ADE80] text-[#4ADE80]'
                      : 'bg-[#0E2015]/60 border-[#20422E] text-slate-400 hover:text-slate-200'
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
          {!filteredPosts.length ? (
            <div className="bg-[#112318] border border-[#20452F] rounded-3xl p-12 text-center space-y-3">
              <Sparkles className="w-10 h-10 text-slate-500 mx-auto animate-pulse" />
              <h3 className="font-display text-xl text-white font-semibold">{t.noPostsFound}</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
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
                className={`bg-[#112318]/90 border rounded-3xl p-5 sm:p-7 shadow-xl space-y-4 backdrop-blur-xl relative overflow-hidden ${
                  post.pinned ? 'border-[#4ADE80]/60 ring-1 ring-[#4ADE80]/30' : 'border-[#20452F]'
                }`}
              >
                {/* Pinned Badge */}
                {post.pinned && (
                  <div className="flex items-center gap-1.5 text-[11px] text-[#4ADE80] font-semibold tracking-wider uppercase mb-1">
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
                    <div className="w-10 h-10 rounded-2xl bg-[#1A3827] border border-[#2D5A3F] flex items-center justify-center text-lg shadow-xs group-hover:border-[#4ADE80] transition-colors">
                      {post.author?.avatar || '🌿'}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white group-hover:text-[#4ADE80] transition-colors flex items-center gap-1.5">
                        {post.author?.name}
                      </h4>
                      <p className="text-[11px] text-slate-400">
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
                          ? 'bg-[#1A3827] text-white border border-[#4ADE80]'
                          : 'bg-[#13271C] border border-[#20422E] text-slate-300 hover:text-white'
                      }`}
                    >
                      {followedUserIds.includes(post.author?.id) ? t.following : `+ ${t.follow}`}
                    </button>

                    {/* Bookmark Save Button */}
                    <button
                      onClick={() => toggleSavePost(post.id)}
                      className={`p-2 rounded-full border transition-colors cursor-pointer ${
                        savedPostIds.includes(post.id)
                          ? 'bg-[#4ADE80]/20 border-[#4ADE80] text-[#4ADE80]'
                          : 'bg-[#13271C] border-[#20422E] text-slate-400 hover:text-white'
                      }`}
                      title={savedPostIds.includes(post.id) ? t.saved : t.save}
                    >
                      <Bookmark className="w-4 h-4" />
                    </button>

                    {/* Delete if owner */}
                    {post.author?.id === (user?.id || 'my-user-id') && (
                      <button
                        onClick={() => handleDeletePost(post.id)}
                        className="p-2 rounded-full bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 cursor-pointer"
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
                    <span className="text-[10px] uppercase font-semibold px-2.5 py-0.5 rounded-full bg-[#1A3827] text-[#4ADE80] border border-[#4ADE80]/30">
                      {post.category}
                    </span>
                  </div>

                  <h3 className="font-display text-xl sm:text-2xl font-bold text-white leading-snug">
                    {post.title}
                  </h3>

                  <p className="text-sm text-slate-200 leading-relaxed font-normal">
                    {post.content}
                  </p>

                  {/* Post Image Attachment */}
                  {post.image_url && (
                    <img
                      src={post.image_url}
                      alt="Attachment"
                      className="w-full max-h-80 object-cover rounded-2xl border border-[#20422E] mt-3"
                    />
                  )}

                  {/* Tags */}
                  {post.tags?.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {post.tags.map((tg) => (
                        <span key={tg} className="text-[11px] text-slate-400 hover:text-[#4ADE80] cursor-pointer">
                          #{tg}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* AI Features Bar */}
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#20452F]">
                  <button
                    onClick={() => handleAISummarize(post.id)}
                    className="px-3 py-1.5 rounded-xl bg-[#1A3827] hover:bg-[#234B34] border border-[#4ADE80]/40 text-xs font-semibold text-[#4ADE80] flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#4ADE80]" />
                    <span>{t.summarizeAI}</span>
                  </button>

                  {post.category === 'Questions & Answers' && !post.aiAnswer && (
                    <button
                      onClick={() => handleAISuggestedAnswer(post.id)}
                      className="px-3 py-1.5 rounded-xl bg-[#1A3827] hover:bg-[#234B34] border border-gold/40 text-xs font-semibold text-gold flex items-center gap-1.5 cursor-pointer"
                    >
                      <Lightbulb className="w-3.5 h-3.5 text-gold" />
                      <span>{t.aiSuggestedAnswer}</span>
                    </button>
                  )}
                </div>

                {/* AI Summary Rendered Box */}
                {post.aiSummary && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#0E2015] border border-[#4ADE80]/40 p-3.5 rounded-2xl text-xs text-slate-200 space-y-1"
                  >
                    <p className="font-semibold text-[#4ADE80] flex items-center gap-1">
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
                    className="bg-[#16271D] border border-gold/40 p-3.5 rounded-2xl text-xs text-slate-200 space-y-1"
                  >
                    <p className="font-semibold text-gold flex items-center gap-1">
                      <Lightbulb className="w-3.5 h-3.5" /> {t.aiSuggestedAnswer}
                    </p>
                    <p>{post.aiAnswer}</p>
                  </motion.div>
                )}

                {/* 5-Reaction Micro-Interactive Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#20452F]/60">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {[
                      { key: 'like', label: t.like, icon: ThumbsUp, color: 'text-blue-400' },
                      { key: 'insightful', label: t.insightful, icon: Lightbulb, color: 'text-amber-400' },
                      { key: 'ecoLove', label: t.ecoLove, icon: Heart, color: 'text-emerald-400' },
                      { key: 'hot', label: t.hot, icon: Flame, color: 'text-orange-400' },
                      { key: 'educational', label: t.educational, icon: Award, color: 'text-purple-400' },
                    ].map((rx) => {
                      const active = post.userReactions?.[rx.key];
                      const count = post.reactions?.[rx.key] || 0;
                      return (
                        <motion.button
                          key={rx.key}
                          whileHover={{ scale: 1.08 }}
                          whileTap={{ scale: 0.92 }}
                          onClick={() => handleReaction(post.id, rx.key)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                            active
                              ? 'bg-[#1A3827] border border-[#4ADE80] text-white shadow-xs'
                              : 'bg-[#13271C] border border-[#20422E] text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <rx.icon className={`w-3.5 h-3.5 ${active ? rx.color : 'text-slate-400'}`} />
                          <span>{count}</span>
                        </motion.button>
                      );
                    })}
                  </div>

                  <span className="text-xs text-slate-400 font-medium">
                    {post.comments?.length || 0} {t.comments}
                  </span>
                </div>

                {/* ──────────────── COMMENTS THREAD ──────────────── */}
                <div className="pt-3 space-y-3">
                  {/* Top Level Comments List */}
                  {post.comments?.map((cm) => (
                    <div key={cm.id} className="bg-[#0E2015] border border-[#20422E] p-3.5 rounded-2xl space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-white">{cm.author?.name} · {cm.author?.city}</span>
                        <span className="text-[10px] text-slate-500">{formatWhen(cm.created_at)}</span>
                      </div>
                      <p className="text-xs sm:text-sm text-slate-200">{cm.content}</p>

                      {/* Reply Toggle */}
                      <button
                        onClick={() => setActiveReplyId(activeReplyId === cm.id ? null : cm.id)}
                        className="text-[11px] text-[#4ADE80] hover:underline flex items-center gap-1 cursor-pointer font-medium"
                      >
                        <CornerDownRight className="w-3 h-3" />
                        <span>{t.reply}</span>
                      </button>

                      {/* Nested Threaded Replies */}
                      {cm.replies?.length > 0 && (
                        <div className="pl-4 border-l-2 border-[#20422E] space-y-2 pt-1">
                          {cm.replies.map((rp) => (
                            <div key={rp.id} className="bg-[#13271C] p-2.5 rounded-xl text-xs space-y-1">
                              <div className="flex justify-between text-[11px] text-slate-400">
                                <span className="font-semibold text-slate-200">{rp.author?.name}</span>
                                <span>{formatWhen(rp.created_at)}</span>
                              </div>
                              <p className="text-slate-300">{rp.content}</p>
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
                            className="flex-1 bg-[#13271C] border border-[#20422E] rounded-xl px-3 py-1.5 text-xs text-white outline-none focus:border-[#4ADE80]"
                          />
                          <button
                            onClick={() => handleAddReply(post.id, cm.id)}
                            className="px-3 py-1.5 rounded-xl bg-[#4ADE80] text-[#07130B] font-semibold text-xs hover:bg-[#3ECE77] cursor-pointer"
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
                      className="flex-1 bg-[#12241A] border border-[#234A33] rounded-2xl px-4 py-2.5 text-xs sm:text-sm text-white placeholder:text-slate-500 outline-none focus:border-[#4ADE80]"
                    />
                    <button
                      onClick={() => handleAddComment(post.id)}
                      className="px-4 py-2.5 rounded-2xl bg-[#4ADE80] text-[#07130B] font-semibold text-xs sm:text-sm hover:bg-[#3ECE77] cursor-pointer shrink-0"
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
