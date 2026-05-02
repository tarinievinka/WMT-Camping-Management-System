const mongoose = require('mongoose');
const Blog = require('./src/models/blog-model/Blog');
const User = require('./src/models/user-model/userModel');
require('dotenv').config();

const seedBlog = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB...');

    const admin = await User.findOne({ role: 'admin' });
    
    if (!admin) {
      console.error('No admin user found. Please create an admin user first.');
      process.exit(1);
    }

    const newBlog = new Blog({
      title: 'Top 5 Hidden Waterfalls You Need to See (Before They Get Famous!)',
      content: `Are you tired of fighting crowds just to get a photo of a waterfall? We’ve done the scouting for you. While everyone else is heading to the main tourist trails, these five "secret" falls offer peace, crystal-clear pools, and the perfect soundtrack of rushing water—all to yourself.

1. The Emerald Veil (The "Secret" Canyon)
Located just 2 miles off the main trail, this 40-foot drop is hidden behind a natural stone arch. The hike is moderate, but the reward is a private turquoise swimming hole.
Tip: Go at noon for the best light through the trees.

2. Whispering Mist Falls
This isn't the tallest fall, but it’s the most atmospheric. The water cascades over moss-covered granite in a series of "stairs." It’s a 4-mile trek, which keeps the casual crowds away.

3. The Twin Cascades
Deep in the heart of the forest, these two parallel falls only appear after a light rain. It feels like stepping into a fantasy movie. Perfect for a quiet picnic.

4. Shadow Basin Falls
Named for the way the sun only hits the water for one hour a day. This spot is a favorite for photographers looking for moody, dramatic shots. The trail is steep, so bring your best hiking boots!

5. Serenity Chute
A hidden gem located near the main campsite area. It’s a short but "off-path" scramble. Most people walk right past the entrance without noticing the small trail marker near the old oak tree.

Respect the Wild:
Because these spots are "hidden," they don't have trash cans or paved paths. Please remember to Leave No Trace. Pack out what you pack in so these spots stay secret and beautiful for the next explorer!`,
      category: 'Destinations',
      tags: ['Hiking', 'Nature', 'HiddenGems', 'Waterfalls', 'Adventure'],
      author: admin._id,
      authorName: 'Admin',
      authorRole: 'admin',
      image: 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=1200&q=80'
    });

    await newBlog.save();
    console.log('Trendy blog post added successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding blog:', err);
    process.exit(1);
  }
};

seedBlog();
