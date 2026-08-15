const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./src/models/User');
const Issue = require('./src/models/Issue');
const Comment = require('./src/models/Comment');
const { POINTS_PER_RESOLUTION } = require('./src/services/pointsService');

dotenv.config();

const seedUsers = [
  { name: 'Admin Green', email: 'admin@greenwatch.app', password: 'Admin@12345', role: 'admin', points: 0 },
  { name: 'Maya Chen', email: 'maya@greenwatch.app', password: 'Citizen@123', role: 'citizen', points: 10 },
  { name: 'Leo Santos', email: 'leo@greenwatch.app', password: 'Citizen@123', role: 'citizen', points: 5 },
  { name: 'Priya Patel', email: 'priya@greenwatch.app', password: 'Citizen@123', role: 'citizen', points: 0 },
];

const seedIssues = [
  {
    title: 'Illegal dumping behind Riverside Park',
    description:
      'Several bags of construction debris have been dumped behind the park entrance near the old gate.',
    category: 'illegal_dumping',
    status: 'in_progress',
    priority: 'high',
    coordinates: [-122.4194, 37.7749],
    address: 'Riverside Park, San Francisco',
    images: [],
  },
  {
    title: 'Trash overflow at downtown bus stop',
    description:
      'Public bins are overflowing with fast food wrappers and plastic bottles. Needs a pickup soon.',
    category: 'litter',
    status: 'acknowledged',
    priority: 'medium',
    coordinates: [-122.4075, 37.7879],
    address: 'Market St & 5th St, San Francisco',
    images: [],
  },
  {
    title: 'Diesel smoke from delivery trucks',
    description:
      'Delivery trucks idle for 20+ minutes every morning emitting thick black smoke near the school.',
    category: 'pollution',
    status: 'reported',
    priority: 'high',
    coordinates: [-122.4453, 37.7563],
    address: 'Mission District, San Francisco',
    images: [],
  },
  {
    title: 'Dead fish in the lake near the boardwalk',
    description:
      'Noticed dozens of dead fish along the eastern shore. Water smells unusual and looks discolored.',
    category: 'water_contamination',
    status: 'resolved',
    priority: 'high',
    coordinates: [-122.463, 37.769],
    address: 'Lake Merced, San Francisco',
    images: [],
  },
  {
    title: 'Cleared hillside losing trees',
    description:
      'Trees have been cut down on the hillside behind the community garden. Erosion is already visible.',
    category: 'deforestation',
    status: 'reported',
    priority: 'medium',
    coordinates: [-122.4521, 37.7338],
    address: 'Twin Peaks area, San Francisco',
    images: [],
  },
  {
    title: 'Abandoned mattress on sidewalk',
    description:
      'A mattress and other bulky waste have been left on the sidewalk for over a week, blocking pedestrians.',
    category: 'litter',
    status: 'resolved',
    priority: 'low',
    coordinates: [-122.4125, 37.7702],
    address: 'Bernal Heights, San Francisco',
    images: [],
  },
  {
    title: 'Chemical smell near the industrial drain',
    description:
      'Strong chemical odor coming from the storm drain near the warehouses. Suspect an illegal discharge.',
    category: 'pollution',
    status: 'acknowledged',
    priority: 'high',
    coordinates: [-122.3841, 37.768],
    address: 'Bayview District, San Francisco',
    images: [],
  },
  {
    title: 'Overgrown weeds in the playground',
    description:
      'Weeds and thorn bushes have overgrown the playground edges making the area hard to use.',
    category: 'other',
    status: 'reported',
    priority: 'low',
    coordinates: [-122.4313, 37.764],
    address: 'Dolores Park, San Francisco',
    images: [],
  },
];

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const userCount = await User.countDocuments();
    if (userCount === 0) {
      await User.create(seedUsers);
      console.log('Created seed users');
    } else {
      console.log('Users already exist, skipping user seed');
    }

    const users = await User.find();
    const byEmail = Object.fromEntries(users.map((u) => [u.email, u]));

    const issueCount = await Issue.countDocuments();
    if (issueCount === 0) {
      const citizenEmails = seedUsers.filter((u) => u.role === 'citizen').map((u) => u.email);
      const admin = byEmail['admin@greenwatch.app'];

      const created = [];
      for (const [i, data] of seedIssues.entries()) {
        const reporter = byEmail[citizenEmails[i % citizenEmails.length]];
        const isResolved = data.status === 'resolved';
        created.push(
          await Issue.create({
            title: data.title,
            description: data.description,
            category: data.category,
            images: data.images,
            location: { type: 'Point', coordinates: data.coordinates },
            address: data.address,
            status: data.status,
            priority: data.priority,
            reportedBy: reporter._id,
            statusHistory: [
              { status: 'reported', changedBy: reporter._id, changedAt: new Date(Date.now() - 10 * 86400000), note: 'Issue reported' },
              ...(data.status !== 'reported'
                ? [{ status: data.status, changedBy: admin._id, changedAt: new Date(Date.now() - 2 * 86400000), note: 'Status updated by admin' }]
                : []),
            ],
            createdAt: new Date(Date.now() - 10 * 86400000),
            updatedAt: data.status === 'resolved' ? new Date(Date.now() - 2 * 86400000) : new Date(),
          })
        );

        if (isResolved) {
          const points = reporter.points + POINTS_PER_RESOLUTION;
          await User.updateOne({ _id: reporter._id }, { points });
        }
      }

      await Comment.create([
        {
          issue: created[0]._id,
          user: byEmail['maya@greenwatch.app']._id,
          text: 'Thanks for flagging this! I saw the same trucks there last weekend.',
        },
        {
          issue: created[0]._id,
          user: byEmail['leo@greenwatch.app']._id,
          text: 'The city crew is scheduled to inspect this area next week.',
        },
        {
          issue: created[3]._id,
          user: byEmail['priya@greenwatch.app']._id,
          text: 'Great news that this got resolved so quickly!',
        },
      ]);
      console.log('Created seed issues and comments');
    } else {
      console.log('Issues already exist, skipping issue seed');
    }

    await mongoose.disconnect();
    console.log('Seed complete');
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err.message);
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
  }
}

run();
