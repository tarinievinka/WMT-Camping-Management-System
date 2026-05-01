const dns = require('dns');

async function testResolution(hostname) {
    console.log(`Resolving ${hostname}...`);
    try {
        const addresses = await dns.promises.resolve4(hostname);
        console.log(`Resolved to: ${addresses.join(', ')}`);
    } catch (err) {
        console.error(`Failed to resolve ${hostname}: ${err.message}`);
    }
}

async function run() {
    console.log('--- System Default DNS ---');
    await testResolution('ac-8l73k13-shard-00-01.9mpvmcu.mongodb.net');
    
    console.log('\n--- Overriding DNS to 8.8.8.8 ---');
    try {
        dns.setServers(['8.8.8.8']);
        await testResolution('ac-8l73k13-shard-00-01.9mpvmcu.mongodb.net');
    } catch (e) {
        console.error('Failed to set servers:', e.message);
    }
}

run();
