const { Place } = require('../models/Nature');
const { isValidId } = require('../utils/natureUtils');

const DEFAULT_PLACES = [
  {
    name: 'Forest Park Edge',
    type: 'forest',
    city: 'Portland',
    region: 'Oregon',
    difficulty: 'easy',
    walk_minutes: 12,
    best_time: 'Early morning',
    description: 'Ancient Douglas fir and fern canopy at the urban boundary.',
    why_it_matters: 'One of the largest urban forest reserves in the United States.',
    habitat: 'Temperate coniferous forest',
    map_x: 35,
    map_y: 42,
    image_url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=600&q=80',
    features: ['Old growth trees', 'Native ferns', 'Stream crossings'],
  },
  {
    name: 'Willamette River Bank',
    type: 'river',
    city: 'Portland',
    region: 'Oregon',
    difficulty: 'easy',
    walk_minutes: 8,
    best_time: 'Dawn or dusk',
    description: 'Riparian wetland margin frequented by great blue herons and ospreys.',
    why_it_matters: 'Critical urban migration corridor for anadromous salmon and waterbirds.',
    habitat: 'Riparian gravel bar & marsh',
    map_x: 62,
    map_y: 58,
    image_url: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=600&q=80',
    features: ['Heron perches', 'Gravel shoreline', 'Tidal mudflats'],
  },
  {
    name: 'Mount Tabor South Slope',
    type: 'volcanic park',
    city: 'Portland',
    region: 'Oregon',
    difficulty: 'moderate',
    walk_minutes: 20,
    best_time: 'Late afternoon',
    description: 'Extinct volcanic cinder cone populated with open oak meadows and songbirds.',
    why_it_matters: 'Oak savanna remnant providing essential acorns and nesting cavities.',
    habitat: 'Oregon white oak savanna',
    map_x: 78,
    map_y: 30,
    image_url: 'https://images.unsplash.com/photo-1426604966848-d7adac402bff?w=600&q=80',
    features: ['Oak meadow', 'Panoramic vistas', 'Woodpecker snags'],
  },
];

const getPlaces = async (req, res) => {
  let places = await Place.find({});
  if (!places.length) {
    places = await Place.insertMany(DEFAULT_PLACES);
  }
  res.json(places);
};

const getPlaceById = async (req, res) => {
  const { id } = req.params;
  let place = null;
  if (isValidId(id)) {
    place = await Place.findById(id);
  }
  if (!place) {
    const places = await Place.find({});
    place = places.find(
      (p) =>
        p._id.toString() === id ||
        p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') === id
    );
  }
  if (!place) {
    return res.status(404).json({ error: 'Place not found' });
  }
  res.json(place);
};

module.exports = { getPlaces, getPlaceById };
