const mongoose = require('mongoose');
const dns = require('dns');

const connectDB = async () => {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('MONGO_URI is not set in environment');
    process.exit(1);
  }

  try {
    // In some Windows or corporate networks Node's DNS resolver may fail SRV lookups.
    // Optionally override DNS servers for this process to public resolvers to
    // ensure SRV records for MongoDB Atlas can be resolved. Set
    // `MONGO_DNS_OVERRIDE=false` in the environment to skip this.
    try {
      if (process.env.MONGO_DNS_OVERRIDE !== 'false') {
        dns.setServers(['8.8.8.8', '1.1.1.1']);
        console.log('Overrode DNS servers to 8.8.8.8,1.1.1.1 for SRV resolution');
      }
    } catch (dnsErr) {
      console.warn('Failed to override DNS servers:', dnsErr && dnsErr.message ? dnsErr.message : dnsErr);
    }
    // Mongoose 7+ and 9+ use sensible defaults; do not pass deprecated connection options
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log(' MongoDB connected successfully');
  } catch (err) {
    console.error(' MongoDB connection error:', err.message || err);
    
    if (err.name === 'MongooseServerSelectionError' || err.message.includes('Could not connect to any servers')) {
      console.log('\n>>> DIAGNOSIS: This is likely an IP Whitelist issue in MongoDB Atlas.');
      console.log('>>> ACTION: Go to https://cloud.mongodb.com/ and add your current IP to Network Access.');
    }

    console.log(' Current MONGO_URI:', uri.replace(/\/\/.*@/, '//****:****@'));
    
    // Retry logic
    if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
        setTimeout(() => {
          console.log(' Retrying MongoDB connection...');
          connectDB();
        }, 5000);
    }
  }
};

module.exports = connectDB;
