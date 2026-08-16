const ROLE_BY_CATEGORY = {
  'Nature & Ecology': 'Field Observation',
  'AI & Technology': 'Pulse AI Explorer',
  'General Discussion': 'Community Member',
  'Education & Learning': 'Nature Educator',
  'Questions & Answers': 'Community Member',
  'Ideas & Suggestions': 'Community Member',
};

const handleFrom = (city, name) => {
  const base = city || name || 'nature_explorer';
  return `@${String(base).toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '')}`;
};

export const DEFAULT_TESTIMONIALS = [
  {
    id: 't-1',
    name: 'Sarah Lin',
    handle: '@sarah_lin',
    role: 'Urban Botanist',
    city: 'Seattle, WA',
    quote: 'It completely changed how I walk through the neighborhood. I notice the micro-canopies of moss on every stone wall now.',
    tag: 'Nature & Ecology',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&q=80',
    species: 'Silvery Bryum Moss',
    upvotes: 42,
  },
  {
    id: 't-2',
    name: 'Marcus Vance',
    handle: '@marcus_v',
    role: 'Habitat Naturalist',
    city: 'Portland, OR',
    quote: 'The 10-minute field missions fit into my morning commute perfectly. It respects my time and gets me looking at real biodiversity.',
    tag: 'Field Observation',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&q=80',
    species: 'Douglas Fir Cones',
    upvotes: 38,
  },
  {
    id: 't-3',
    name: 'Elena Rostova',
    handle: '@elena_birds',
    role: 'Canopy Observer',
    city: 'Vancouver, BC',
    quote: 'I love that NaturePulse does not hallucinate Latin names when uncertain. It gives grounded, cautious ecological guidance.',
    tag: 'Pulse AI Explorer',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=120&q=80',
    species: 'Black-Capped Chickadee',
    upvotes: 29,
  },
  {
    id: 't-4',
    name: 'David K.',
    handle: '@david_eco',
    role: 'Ecology Student',
    city: 'Austin, TX',
    quote: 'The 5-dimensional connection metric makes tracking ecological relationships feel authentic and deeply rewarding.',
    tag: 'Education & Learning',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&q=80',
    species: 'Live Oak Lichen',
    upvotes: 35,
  }
];

export const toTestimonial = (p) => {
  const note = p.note || p.description || '';
  const species = p.common_name || '';
  const city = p.city || 'Shared Field';
  const category = p.category || 'Field Observation';
  return {
    id: p._id || p.id,
    name: p.author_name || 'Nature Explorer',
    handle: handleFrom(city, p.author_name),
    role: ROLE_BY_CATEGORY[p.category] || 'Field Observation',
    city,
    quote: note,
    tag: category,
    avatar: p.image_url || '',
    species,
    upvotes: p.upvotes || 0,
    createdAt: p.createdAt,
  };
};
