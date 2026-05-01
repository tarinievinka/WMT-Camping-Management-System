const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = "mongodb://admin:wmt12345@ac-8l73k13-shard-00-00.9mpvmcu.mongodb.net:27017,ac-8l73k13-shard-00-01.9mpvmcu.mongodb.net:27017,ac-8l73k13-shard-00-02.9mpvmcu.mongodb.net:27017/?ssl=true&replicaSet=atlas-9jm6p6-shard-0&authSource=admin&appName=Cluster0";

async function testConnection() {
    console.log('Testing connection to:', uri.replace(/\/\/.*@/, '//****:****@'));
    const client = new MongoClient(uri, {
        serverSelectionTimeoutMS: 5000,
    });

    try {
        await client.connect();
        console.log('Successfully connected to MongoDB Atlas');
        await client.db('admin').command({ ping: 1 });
        console.log('Ping successful');
    } catch (err) {
        console.error('Connection failed with error:');
        console.error(err);
        if (err.message.includes('IP address')) {
            console.log('\n>>> CLUE: This looks like an IP Whitelist issue.');
        }
    } finally {
        await client.close();
    }
}

testConnection();
