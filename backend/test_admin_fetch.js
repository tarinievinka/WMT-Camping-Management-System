async function testAdminFetch() {
    // 1. Login as admin
    const loginData = {
        email: 'admin@campsmart.com',
        password: 'password123' // I assume this is the password for the admin
    };

    try {
        const loginRes = await fetch('http://127.0.0.1:5000/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(loginData),
        });

        const loginResult = await loginRes.json();
        if (!loginRes.ok) {
            console.error('Admin Login failed:', loginResult.error);
            return;
        }

        const token = loginResult.token;
        console.log('Admin logged in successfully.');

        // 2. Fetch all users
        const usersRes = await fetch('http://127.0.0.1:5000/api', {
            headers: { Authorization: `Bearer ${token}` },
        });

        const users = await usersRes.json();
        console.log(`\nFound ${users.length} users via API:`);
        users.forEach(u => console.log(`- ${u.name} (${u.email}) [${u.role}] - Active: ${u.isActive}`));

    } catch (err) {
        console.error('Error:', err.message);
    }
}

testAdminFetch();
