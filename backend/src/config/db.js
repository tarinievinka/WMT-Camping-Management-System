const mongoose = require('mongoose');
const dns = require('dns');

const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('MONGO_URI is not set in environment');
    process.exit(1);
  }

  try {
    if (process.env.MONGO_DNS_OVERRIDE !== 'false') {
      dns.setServers(['8.8.8.8', '1.1.1.1']);
      console.log('Overrode DNS servers to 8.8.8.8, 1.1.1.1 for SRV resolution');
    }
  } catch (dnsErr) {
    console.warn('Failed to override DNS servers:', dnsErr && dnsErr.message ? dnsErr.message : dnsErr);
  }

  try {
    mongoose.set('bufferCommands', false);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000, // 10s for initial connection
      socketTimeoutMS: 45000,
    });
    console.log('✅ MongoDB connected successfully');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message || err);
    
    if (err.name === 'MongooseServerSelectionError' || err.message.includes('Could not connect to any servers')) {
      console.log('\n>>> DIAGNOSIS: This is likely an IP Whitelist issue in MongoDB Atlas.');
      console.log('>>> ACTION: Go to https://cloud.mongodb.com/ and add your current IP to Network Access.');
    }

    // Start retry loop in background but DON'T block the entire server start
    console.log('⚠️ Server will continue to start, but DB features will fail until connected.');
    
    const retryConnection = () => {
      setTimeout(async () => {
        console.log('🔄 Retrying MongoDB connection...');
        try {
          await mongoose.connect(uri);
          console.log('✅ MongoDB connected successfully (after retry)');
        } catch (retryErr) {
          retryConnection();
        }
      }, 5000);
    };
    
    retryConnection();
  }
};

module.exports = connectDB;
