const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const {
  Profile,
  Discovery,
  JournalEntry,
  Mission,
  Place,
  Story,
  CommunityPost,
  Action,
  ChatThread,
} = require('./models/Nature');

dotenv.config();
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/naturepulse';

async function seedDatabase() {
  try {
    console.log('🌱 Connecting to MongoDB Atlas for database seeding...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to database:', mongoose.connection.name);

    // 1. Seed Places
    const placeCount = await Place.countDocuments();
    if (placeCount === 0) {
      await Place.insertMany([
        {
          name: 'Forest Park Canopy Edge',
          type: 'forest',
          city: 'Ahmedabad',
          region: 'Gujarat',
          difficulty: 'easy',
          walk_minutes: 12,
          best_time: 'Early morning (6:30 AM)',
          description: 'Ancient canopy reserve with old growth banyan trees and songbird nesting corridors.',
          why_it_matters: 'Essential urban migration sanctuary for local bird species.',
          habitat: 'Dry deciduous urban woodland',
          map_x: 38,
          map_y: 42,
          image_url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=600&q=80',
          features: ['Old growth Banyan', 'Native ferns', 'Peafowl corridor'],
        },
        {
          name: 'Sabarmati Riverine Wetland',
          type: 'river',
          city: 'Ahmedabad',
          region: 'Gujarat',
          difficulty: 'easy',
          walk_minutes: 8,
          best_time: 'Dawn or dusk',
          description: 'Riparian wetland margin frequented by egrets, herons, and migratory waterbirds.',
          why_it_matters: 'Critical aquatic habitat sustaining urban biodiversity.',
          habitat: 'Riparian marsh & gravel bar',
          map_x: 62,
          map_y: 58,
          image_url: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=600&q=80',
          features: ['Heron perches', 'Gravel shoreline', 'Reed beds'],
        },
      ]);
      console.log('✅ Places collection seeded!');
    }

    // 2. Seed Missions
    const missionCount = await Mission.countDocuments();
    if (missionCount === 0) {
      await Mission.insertMany([
        {
          title: 'Document 3 Local Native Trees',
          category: 'Botanical Observation',
          difficulty: '🟢 Easy',
          xpReward: 150,
          progress: 1,
          total: 3,
          completed: false,
          description: 'Use Nature Lens to scan and identify Neem, Peepal, or Banyan trees in your neighborhood.',
        },
        {
          title: 'Record Morning Bird Calls',
          category: 'Bioacoustics',
          difficulty: '🟡 Medium',
          xpReward: 220,
          progress: 2,
          total: 5,
          completed: false,
          description: 'Log 5 distinct bird observations at dawn around local green spaces.',
        },
      ]);
      console.log('✅ Missions collection seeded!');
    }

    // 3. Seed Community Posts
    const postCount = await CommunityPost.countDocuments();
    if (postCount === 0) {
      await CommunityPost.insertMany([
        {
          common_name: 'Rose-ringed Parakeet',
          species_name: 'Psittacula krameri',
          category: 'bird',
          note: 'Observed a vibrant flock of Rose-ringed Parakeets nesting near the old Neem canopy today! Biodiversity is thriving.',
          city: 'Ahmedabad',
          location: 'Sabarmati Riverside Park',
          author_name: 'Aarav Patel',
          likes_count: 24,
          comments_count: 6,
          image_url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=600&q=80',
        },
      ]);
      console.log('✅ CommunityPosts collection seeded!');
    }

    console.log('🎉 Seeding complete! All MongoDB collections are active.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding error:', err.message);
    process.exit(1);
  }
}

seedDatabase();
