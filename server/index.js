const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const chatRoutes = require('./routes/chat');
const reportRoutes = require('./routes/reports');
const userRoutes = require('./routes/users');

const app = express();

// Allow requests from any origin (including Vercel deployed previews)
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/users', userRoutes);

app.get('/', (req, res) => res.send('Welcome to the DEO Chatbot API! The server is running successfully. 🚀'));
app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date() }));

async function startServer() {
  let mongoUri = process.env.MONGO_URI;

  // If no MONGO_URI or it's a local URI and MongoDB isn't running, use in-memory
  if (!mongoUri || mongoUri.includes('localhost') || mongoUri.includes('127.0.0.1')) {
    try {
      await mongoose.connect(mongoUri || 'mongodb://localhost:27017/dept_chatbot', { serverSelectionTimeoutMS: 2000 });
      console.log('✅ Connected to local MongoDB');
    } catch {
      console.log('⚠️  Local MongoDB not found, starting in-memory MongoDB...');
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      mongoUri = mongod.getUri();
      await mongoose.connect(mongoUri);
      console.log('✅ In-memory MongoDB started:', mongoUri);

      // Auto-seed in-memory DB
      console.log('🌱 Seeding demo data...');
      try {
        const seed = require('./seed');  // we'll make seed export a function
        await seed();
        console.log('✅ Demo data seeded successfully!');
      } catch (e) {
        console.error('Seed error:', e.message);
      }
    }
  } else {
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB Atlas');
  }

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 DataBot server running on http://localhost:${PORT}`);
    console.log(`📊 API available at http://localhost:${PORT}/api`);
  });
}

startServer().catch(err => {
  console.error('❌ Server startup error:', err);
  process.exit(1);
});
// restarted for Atlas
