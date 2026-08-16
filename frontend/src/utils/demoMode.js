// ─── NaturePulse Demo Mode ────────────────────────────────────────────────────
// Activated by: VITE_DEMO_MODE=true OR Ctrl+Shift+D
// Auto-fallback: if real API fails or times out after 6s

export function isDemoMode() {
  return (
    import.meta.env.VITE_DEMO_MODE === 'true' ||
    sessionStorage.getItem('np_demo') === '1'
  );
}

export function toggleDemo() {
  if (sessionStorage.getItem('np_demo') === '1') {
    sessionStorage.removeItem('np_demo');
  } else {
    sessionStorage.setItem('np_demo', '1');
  }
  window.location.reload();
}

if (typeof window !== 'undefined') {
  window.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.shiftKey && e.key === 'D') {
      e.preventDefault();
      toggleDemo();
    }
  });
}

export const DEMO_SPECIES = [
  {
    common_name: 'Indian Myna',
    scientific_name: 'Acridotheres tristis',
    confidence: 'high',
    confidence_pct: 94,
    category: 'birds',
    identified: true,
    description:
      'A stocky brown bird with a bright yellow eye-patch and bill. White wing patches are visible in flight. Highly adaptable to urban environments, often seen foraging on the ground near humans.',
    why_it_matters:
      'Mynas are nature\'s pest controllers — a single bird eats hundreds of insects daily. Their bold presence in cities means urban green spaces are functioning enough to support vertebrate wildlife.',
    experience_suggestion:
      'Sit quietly near a fruiting tree at dawn. Watch how the Myna communicates — it uses over 17 distinct calls. Notice how it tilts its head before pecking, reading the ground with one eye.',
    ecological_role:
      'Omnivore and seed disperser. Helps control insect populations in urban gardens.',
    visible_features: ['Yellow eye-patch and bill', 'Brown body with black head', 'White wing patches', 'Yellow legs', 'Loud varied calls'],
    photo_coach_tip:
      'Get to eye level — crouch down. Wait for it to face you. Shoot in golden hour (within 1 hour of sunrise) for a warm catchlight in the yellow eye.',
    look_closer_steps: [
      { step: 1, title: 'Watch the feet', instruction: 'For 2 minutes, only watch the feet — it scratches, grips, pivots. Count how many different movements you see.', duration_seconds: 120 },
      { step: 2, title: 'Listen for alarm call', instruction: 'Make a slow movement. The alarm call is sharper and more repetitive — other birds nearby will also react.', duration_seconds: 90 },
      { step: 3, title: 'Track its foraging pattern', instruction: 'Follow one bird for 3 minutes. Does it have a territory? Notice which patches of ground it returns to.', duration_seconds: 180 },
    ],
    uncertainty_note: null,
  },
  {
    common_name: 'Champa (Plumeria)',
    scientific_name: 'Plumeria rubra',
    confidence: 'high',
    confidence_pct: 97,
    category: 'flowers',
    identified: true,
    description:
      'Creamy-white to pale yellow petals with a golden center, thick waxy texture, and intensely sweet fragrance strongest at dusk and dawn.',
    why_it_matters:
      'Champa is a keystone species for night-pollinating hawk moths. Its fragrance is released at night — a reminder that nature operates on timescales we often miss.',
    experience_suggestion:
      'Visit the same Champa tree at morning, afternoon, and just after sunset. The fragrance intensity will be dramatically different each time.',
    ecological_role:
      'Night-pollinator host. Provides nectar for hawk moths, bees, and butterflies. Fallen flowers feed ground insects.',
    visible_features: ['Five waxy petals white-to-yellow', 'Golden yellow center', 'Thick milky sap in stem', 'Forked succulent branches'],
    photo_coach_tip:
      'Photograph a single bloom from directly above with the golden center filling the frame. Use soft overcast light — harsh sunlight washes out the delicate petal gradients.',
    look_closer_steps: [
      { step: 1, title: 'Smell the gradient', instruction: 'Move the bloom slowly to your nose over 30 seconds. Describe 3 distinct fragrance notes you detect.', duration_seconds: 60 },
      { step: 2, title: 'Find the pollen trail', instruction: 'Look inside the flower tube with a torch. Check 5 flowers — are some more "visited" than others?', duration_seconds: 120 },
      { step: 3, title: 'Feel the wax', instruction: 'Gently rub a petal. The waxy surface makes the flower visible to moths in moonlight.', duration_seconds: 60 },
    ],
    uncertainty_note: null,
  },
  {
    common_name: 'Banyan Tree (Aerial Root)',
    scientific_name: 'Ficus benghalensis',
    confidence: 'medium',
    confidence_pct: 71,
    category: 'trees',
    identified: true,
    description:
      'A thick rope-like prop root descending from a horizontal branch. Smooth grey bark, often colonized by mosses and small ferns at the base.',
    why_it_matters:
      'India\'s national tree — one of the largest single-organism structures on Earth. Its aerial roots create micro-habitats for over 300 species of birds, insects, and reptiles.',
    experience_suggestion:
      'Press both palms against the aerial root. This root began as a tiny filament dropped from a branch — thickening over years. Try to estimate how old it might be by its diameter.',
    ecological_role:
      'Keystone species. Figs are a critical year-round food source when other fruits fail. Aerial roots create structural complexity.',
    visible_features: ['Thick rope-like descending root', 'Grey smooth bark', 'Moss and lichen at base', 'Multiple roots creating a forest-within-a-tree'],
    photo_coach_tip:
      'Wide-angle shot from the base looking up gives the root\'s full sky-to-ground journey. Add a hand for scale.',
    look_closer_steps: [
      { step: 1, title: 'Count the inhabitants', instruction: 'Examine one square foot of root surface for 3 minutes. Count every distinct living thing — lichens, mosses, ants, spiders, beetles.', duration_seconds: 180 },
      { step: 2, title: 'Trace the water path', instruction: 'Pour a small amount of water at the top of the root. Watch how it channels moisture directly to the ground.', duration_seconds: 90 },
      { step: 3, title: 'Feel the tension', instruction: 'Push gently against the root. Notice the slight give — it is still living, adjusting direction each season.', duration_seconds: 60 },
    ],
    uncertainty_note:
      'Confidence is medium — image shows only the root, not canopy or leaves. A Ficus religiosa (Peepal) is also possible.',
  },
];

export function demoAnalyze() {
  const species = DEMO_SPECIES[Math.floor(Math.random() * DEMO_SPECIES.length)];
  return new Promise((resolve) => setTimeout(() => resolve({ ...species }), 3000));
}

export function demoWeeklyRecap() {
  return new Promise((resolve) =>
    setTimeout(
      () =>
        resolve({
          slides: [
            { title: 'You explored 5 days this week', stat: '5', stat_label: 'days outside', description: 'That is more than 80% of NaturePulse users this week.' },
            { title: 'You discovered 3 species', stat: '3', stat_label: 'new species', description: 'Indian Myna, Champa Flower, and Banyan Root.', species_list: ['Indian Myna', 'Champa (Plumeria)', 'Banyan Tree'] },
            { title: 'Your top find was the Champa', stat: '97%', stat_label: 'confidence', description: 'The Champa\'s night-fragrance and moth relationship was this week\'s most fascinating discovery.', top_species: DEMO_SPECIES[1] },
          ],
          total_species: 3,
          total_days: 5,
          streak: 4,
        }),
      1500
    )
  );
}

export function demoStreak() {
  return new Promise((resolve) =>
    setTimeout(() => resolve({ streak: 4, last_active: new Date().toISOString() }), 400)
  );
}
