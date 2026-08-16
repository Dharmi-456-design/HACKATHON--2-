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
