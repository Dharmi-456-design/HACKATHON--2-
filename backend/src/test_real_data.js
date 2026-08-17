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

async function seed15DataPerCollection() {
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
    console.log(`✅ 1. users: 15 active user accounts in database!`);

    const mainUser = users[0];

    // 2. Discoveries (15 Observations)
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

    const fullDiscoveries = discoverySeeds.map((d) => ({
      user: mainUser._id,
      ...d,
      confidence: 'high',
      confidence_pct: 95,
      image_url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=600&q=80',
    }));

    await Discovery.deleteMany({ city: { $in: ['Ahmedabad', 'Gandhinagar'] } });
    await Discovery.insertMany(fullDiscoveries);
    console.log(`✅ 2. discoveries: 15 active species documents in database!`);

    // 3. Community Posts (15 Posts)
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
      image_url: 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?w=600&q=80',
      ...p,
    }));

    await CommunityPost.deleteMany({ city: 'Ahmedabad' });
    await CommunityPost.insertMany(fullPosts);
    console.log(`✅ 3. communityposts: 15 active community post documents in database!`);

    // 4. Places (15 Habitat Locations)
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
      image_url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?w=600&q=80',
      features: ['Native Canopy', 'Bird Hides', 'Quiet Trails'],
    }));

    await Place.deleteMany({ region: 'Gujarat' });
    await Place.insertMany(placeSeeds);
    console.log(`✅ 4. places: 15 active habitat location documents in database!`);

    // 5. Missions (15 Eco Challenges)
    const missionTitles = [
      'Document 3 Local Native Trees', 'Record Morning Bird Calls', 'Plant 1 Pollinator Sapling',
      'Log 3 Soil Moisture Checks', 'Observe 2 Butterfly Species', 'Clean 1 Wetland Shoreline',
      'Map 5 Urban Canopy Trees', 'Record Sunset Bat Emergence', 'Identify 3 Flowering Herbs',
      'Log 1 Bio-Compost Batch', 'Track 2 Migratory Waterbirds', 'Survey Local Micro-Climate',
      'Identify 2 Medicinal Plants', 'Log 1 Silent Forest Walk', 'Share 1 Eco Field Post'
    ];

    const missionSeeds = missionTitles.map((title, idx) => ({
      title,
      category: idx % 2 === 0 ? 'Botanical Observation' : 'Bioacoustics',
      difficulty: idx % 3 === 0 ? '🟡 Medium' : '🟢 Easy',
      xpReward: 100 + idx * 20,
      progress: Math.min(idx, 3),
      total: 3,
      completed: idx % 4 === 0,
      description: `Engage in field citizen science challenge to observe and protect local urban biodiversity.`,
    }));

    await Mission.deleteMany({});
    await Mission.insertMany(missionSeeds);
    console.log(`✅ 5. missions: 15 active mission challenge documents in database!`);

    console.log('\n🎉 ALL DONE! 15+ Documents successfully added to users, discoveries, communityposts, places, and missions!');
    console.log('👉 Open MongoDB Compass -> naturepulse -> click REFRESH (F5)!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding error:', err.message);
    process.exit(1);
  }
}

seed15DataPerCollection();
