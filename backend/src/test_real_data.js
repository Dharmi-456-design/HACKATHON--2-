import React from 'react';
  
  const Test_real_data = () =>  {
	return (
	  <div>
	  </div>
	);
  }
  
  export default Test_real_data;
  const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('./models/User');
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

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://DharmiPatel:Dharmi_123@cluster0.em7zd3b.mongodb.net/naturepulse';

// Unique Image Map per species item
const SPECIES_IMAGES = [
  'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?w=600&q=80', // Banyan
  'https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=600&q=80', // Peafowl
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80', // Amaltas
  'https://images.unsplash.com/photo-1535083783855-76ae62b2914e?w=600&q=80', // Butterfly
  'https://images.unsplash.com/photo-1522920193220-370744220b2a?w=600&q=80', // Asian Koel
  'https://images.unsplash.com/photo-1515586838455-8f8f940d6853?w=600&q=80', // Tulsi
  'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?w=600&q=80', // Neem Tree
  'https://images.unsplash.com/photo-1618083842247-49f39546059d?w=600&q=80', // Bee eater
  'https://images.unsplash.com/photo-1549608276-5786777e6587?w=600&q=80', // Sunbird
  'https://images.unsplash.com/photo-1589656966895-2f33e7653819?w=600&q=80', // Porcupine
  'https://images.unsplash.com/photo-1511497584788-87676104235f?w=600&q=80', // Fungi
  'https://images.unsplash.com/photo-1504450758481-7338eba7524a?w=600&q=80', // Lizard / Calotes
  'https://images.unsplash.com/photo-1534067783941-51c9c23ecefd?w=600&q=80', // Plumbago
  'https://images.unsplash.com/photo-1444464666168-49d633b86797?w=600&q=80', // Bulbul
  'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=600&q=80', // Moss
];

// Unique Image Map per Place
const PLACE_IMAGES = [
  'https://images.unsplash.com/photo-1448375240586-882707db888b?w=600&q=80',
  'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=600&q=80',
  'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=600&q=80',
  'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?w=600&q=80',
  'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80',
  'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?w=600&q=80',
  'https://images.unsplash.com/photo-1535083783855-76ae62b2914e?w=600&q=80',
  'https://images.unsplash.com/photo-1511497584788-87676104235f?w=600&q=80',
  'https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=600&q=80',
  'https://images.unsplash.com/photo-1504450758481-7338eba7524a?w=600&q=80',
  'https://images.unsplash.com/photo-1534067783941-51c9c23ecefd?w=600&q=80',
  'https://images.unsplash.com/photo-1444464666168-49d633b86797?w=600&q=80',
  'https://images.unsplash.com/photo-1522920193220-370744220b2a?w=600&q=80',
  'https://images.unsplash.com/photo-1589656966895-2f33e7653819?w=600&q=80',
  'https://images.unsplash.com/photo-1618083842247-49f39546059d?w=600&q=80',
];

async function seedUniqueImagesData() {
  try {
    console.log('🌱 Connecting to MongoDB Atlas:', MONGODB_URI);
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas successfully!\n');

    // 1. Users (15 Users)
    const userNames = [
      'Aarav Patel', 'Ananya Sharma', 'Priya Mehta', 'Rohan Joshi', 'Kavya Nair',
      'Devansh Shah', 'Isha Verma', 'Aditya Kulkarni', 'Diya Trivedi', 'Siddharth Rao',
      'Meera Deshmukh', 'Yash Singhania', 'Riya Merchant', 'Kabir Gill', 'Tanvi Parekh'
    ];

    const users = [];
    for (let i = 0; i < userNames.length; i++) {
      const email = `explorer_${i + 1}@naturepulse.org`;
      let existing = await User.findOne({ email });
      if (!existing) {
        existing = await User.create({
          name: userNames[i],
          email,
          password: 'Password123!',
          role: 'citizen',
        });
      }
      users.push(existing);
    }

    const mainUser = users[0];

    // 2. Discoveries (15 Observations with UNIQUE IMAGES)
    const discoverySeeds = [
      { common_name: 'Sacred Banyan Tree', scientific_name: 'Ficus benghalensis', category: 'trees', city: 'Ahmedabad', place_name: 'Parimal Garden Canopy', notes: 'Ancient canopy providing massive shade footprint and micro-habitat.' },
      { common_name: 'Indian Peafowl', scientific_name: 'Pavo cristatus', category: 'birds', city: 'Ahmedabad', place_name: 'Sabarmati Wetland', notes: 'Male peafowl displaying iridescent train feathers along morning roosting trees.' },
      { common_name: 'Golden Shower Tree', scientific_name: 'Cassia fistula', category: 'flowers', city: 'Gandhinagar', place_name: 'Indroda Heritage Park', notes: 'Vibrant yellow pendulous racemes blooming during late spring heat.' },
      { common_name: 'Common Emigrant Butterfly', scientific_name: 'Catopsilia pomona', category: 'insects', city: 'Ahmedabad', place_name: 'Thol Lake Wetland', notes: 'Pale lemon-yellow butterfly fluttering near nectar-rich wild herbs.' },
      { common_name: 'Asian Koel', scientific_name: 'Eudynamys scolopaceus', category: 'birds', city: 'Ahmedabad', place_name: 'Parimal Garden Canopy', notes: 'Distinctive melodious call recorded at 6:15 AM near dense mango canopy.' },
      { common_name: 'Holy Basil / Tulsi', scientific_name: 'Ocimum tenuiflorum', category: 'flowers', city: 'Ahmedabad', place_name: 'Community Herbal Sanctuary', notes: 'Aromatic purple spikes attracting honey bees and native pollinators.' },
      { common_name: 'Neem Tree', scientific_name: 'Azadirachta indica', category: 'trees', city: 'Ahmedabad', place_name: 'Science City Park', notes: 'Evergreen dense canopy filtering air pollutants and cooling street level temperature.' },
      { common_name: 'Green Bee-Eater', scientific_name: 'Merops orientalis', category: 'birds', city: 'Gandhinagar', place_name: 'Indroda Heritage Park', notes: 'Bright emerald plumage bird sallying for flying dragonflies from wire perches.' },
      { common_name: 'Purple Sunbird', scientific_name: 'Cinnyris asiaticus', category: 'birds', city: 'Ahmedabad', place_name: 'Parimal Garden Canopy', notes: 'Tiny iridescent breeding male sipping nectar from bougainvillea blossoms.' },
      { common_name: 'Indian Crested Porcupine', scientific_name: 'Hystrix indica', category: 'mammals', city: 'Gandhinagar', place_name: 'Indroda Heritage Park', notes: 'Quill shed discovered near subterranean burrow complex in nocturnal ravine.' },
      { common_name: 'Bioluminescent Wood Fungi', scientific_name: 'Mycena chlorophos', category: 'fungi', city: 'Gandhinagar', place_name: 'Indroda Heritage Park', notes: 'Soft green glow observed on wet decaying logs after heavy rainfall.' },
      { common_name: 'Garden Lizard / Calotes', scientific_name: 'Calotes versicolor', category: 'reptiles', city: 'Ahmedabad', place_name: 'Sabarmati Wetland', notes: 'Male displaying crimson throat coloration during sunbathing session.' },
      { common_name: 'Plumbago Blue Bush', scientific_name: 'Plumbago auriculata', category: 'flowers', city: 'Ahmedabad', place_name: 'Parimal Garden Canopy', notes: 'Sky blue flower clusters blooming continuously along shaded pathways.' },
      { common_name: 'Red-Vented Bulbul', scientific_name: 'Pycnonotus cafer', category: 'birds', city: 'Ahmedabad', place_name: 'Thol Lake Wetland', notes: 'Lively chatter recorded near fruiting banyan figs.' },
      { common_name: 'Velvet Mallow Moss', scientific_name: 'Bryum argenteum', category: 'moss', city: 'Ahmedabad', place_name: 'Sabarmati Wetland', notes: 'Silver-green cushion moss storing micro-moisture along shaded sandstone rocks.' },
    ];

    const fullDiscoveries = discoverySeeds.map((d, idx) => ({
      user: mainUser._id,
      ...d,
      confidence: 'high',
      confidence_pct: 95,
      image_url: SPECIES_IMAGES[idx % SPECIES_IMAGES.length],
    }));

    await Discovery.deleteMany({});
    await Discovery.insertMany(fullDiscoveries);
    console.log(`✅ 1. discoveries: 15 active observations updated with 15 UNIQUE SPECIES IMAGES!`);

    // 3. Community Posts (15 Posts with UNIQUE IMAGES)
    const communitySeeds = [
      { common_name: 'Rose-ringed Parakeet Roosting', note: 'Flock of 30+ parakeets gathering at sunset near old Peepal canopy.', location: 'Sabarmati Riverside Park' },
      { common_name: 'Neem Sapling Plantation Drive', note: 'Community volunteers planted 25 shade trees along urban heat corridor today!', location: 'Science City Green Belt' },
      { common_name: 'Bioluminescent Fungi Night Walk', note: 'Guided nocturnal trail exploring emerald glowing fungi in the ravine forest.', location: 'Indroda Heritage Reserve' },
      { common_name: 'Monarch Butterfly Migration Spotting', note: 'Counted 18 butterflies sipping nectar on blooming milkweed flowers.', location: 'Parimal Garden Canopy' },
      { common_name: 'Peafowl Dawn Chorus Recording', note: 'Recorded loud bioacoustic calls reverberating across the early morning mist.', location: 'Thol Bird Sanctuary' },
      { common_name: 'Freshwater Heron Nesting Sightings', note: 'Great egrets and black-crowned night herons constructing nests in reed beds.', location: 'Sabarmati Wetland' },
      { common_name: 'Organic Compost Heap Setup', note: 'Installed 3 community composting units to enrich local soil biodiversity.', location: 'Science City Park' },
      { common_name: 'Wild Honeybee Swarm Protection', note: 'Safely relocated wild honeybee colony without harmful smoke or chemicals.', location: 'Parimal Botanical Garden' },
      { common_name: 'Soil Moisture Sensors Installed', note: 'Deployed IoT soil humidity nodes to monitor urban canopy hydration.', location: 'Forest Park Canopy' },
      { common_name: 'Dragonfly Population Count', note: 'Identified 7 distinct skimmer dragonfly species hovering over freshwater pond.', location: 'Thol Sanctuary' },
      { common_name: 'Native Seed Ball Workshop', note: 'Children made 200 seed balls with native Acacia and Neem seeds for monsoon.', location: 'Sabarmati Park' },
      { common_name: 'Sunset Bat Colony Emergence', note: 'Observed hundreds of fruit bats taking flight into twilight sky.', location: 'Indroda Forest' },
      { common_name: 'Rainwater Harvesting Trail', note: 'Inspected bio-swales absorbing 100% of urban runoff during monsoon storm.', location: 'Science City Belt' },
      { common_name: 'Medicinal Herb Garden Tour', note: 'Guided walk explaining traditional ecological knowledge of Tulsi & Ashwagandha.', location: 'Parimal Garden' },
      { common_name: 'Clean Earth Plastics Cleanup', note: 'Removed 45kg of plastic waste from riparian bird foraging mudflats.', location: 'Sabarmati Wetland' },
    ];

    const fullPosts = communitySeeds.map((p, idx) => ({
      user: users[idx % users.length]._id,
      author_name: users[idx % users.length].name,
      species_name: 'Ecological Observation',
      category: 'bird',
      city: 'Ahmedabad',
      likes_count: 15 + idx * 3,
      comments_count: 3 + idx,
      image_url: SPECIES_IMAGES[(idx + 3) % SPECIES_IMAGES.length],
      ...p,
    }));

    await CommunityPost.deleteMany({});
    await CommunityPost.insertMany(fullPosts);
    console.log(`✅ 2. communityposts: 15 active posts updated with UNIQUE IMAGES!`);

    // 4. Places (15 Habitat Locations with UNIQUE IMAGES)
    const placeNames = [
      'Forest Park Canopy Edge', 'Sabarmati Riverine Wetland', 'Thol Lake Sanctuary', 'Indroda Nature Reserve',
      'Parimal Botanical Garden', 'Law Garden Urban Forest', 'Sundarvan Nature Center', 'Kankaria Lakefront Woods',
      'Science City Bio-Park', 'Vastrapur Wetland Margin', 'SG Highway Green Belt', 'Sarkhej Ancient Tank',
      'Nalsarovar Bird Reserve', 'Gandhinagar Capital Woods', 'Serenity Botanical Sanctuary'
    ];

    const placeSeeds = placeNames.map((name, idx) => ({
      name,
      type: idx % 2 === 0 ? 'forest' : 'wetland',
      city: idx > 12 ? 'Gandhinagar' : 'Ahmedabad',
      region: 'Gujarat',
      difficulty: idx % 3 === 0 ? 'moderate' : 'easy',
      walk_minutes: 10 + idx * 2,
      best_time: '6:30 AM Early Morning',
      description: `Protected ecological habitat reserve supporting rich urban flora and native bird species.`,
      why_it_matters: 'Essential biodiversity sanctuary and shade canopy corridor.',
      habitat: 'Dry deciduous woodland & freshwater wetland',
      map_x: 20 + (idx * 5) % 70,
      map_y: 15 + (idx * 6) % 70,
      image_url: PLACE_IMAGES[idx % PLACE_IMAGES.length],
      features: ['Native Canopy', 'Bird Hides', 'Quiet Trails'],
    }));

    await Place.deleteMany({});
    await Place.insertMany(placeSeeds);
    console.log(`✅ 3. places: 15 habitat reserves updated with UNIQUE IMAGES!`);

    console.log('\n🎉 SUCCESS! All observations, posts, and places now have UNIQUE & DISTINCT high-res species images!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding error:', err.message);
    process.exit(1);
  }
}

seedUniqueImagesData();
