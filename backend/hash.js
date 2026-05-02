const bcrypt = require('bcryptjs');

async function run() {
    const hash = await bcrypt.hash("123456", 10);
    console.log("Hashed password:");
    console.log(hash);
}

run();
