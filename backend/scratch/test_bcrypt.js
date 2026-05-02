const bcrypt = require('bcryptjs');
const crypto = require('crypto');

async function test() {
    const tempPassword = crypto.randomBytes(4).toString('hex');
    console.log('Plain text password:', tempPassword);
    
    const hashedPassword = await bcrypt.hash(tempPassword, 10);
    console.log('Hashed password:', hashedPassword);
    
    const isMatch = await bcrypt.compare(tempPassword, hashedPassword);
    console.log('Match result:', isMatch);
    
    // Test with a hardcoded one to be sure
    const pass = 'abc12345';
    const hash = await bcrypt.hash(pass, 10);
    const match = await bcrypt.compare(pass, hash);
    console.log('Hardcoded match:', match);
}

test().catch(console.error);
