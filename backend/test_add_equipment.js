async function testAddEquipment() {
    const loginData = {
        email: 'admin@camping.com',
        password: 'password123'
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

        const equipmentData = {
            name: "Test Tent",
            description: "A test tent",
            rentalPrice: 1000,
            salePrice: 1000,
            stockQuantity: 10,
            category: "Other",
            condition: "New",
            availabilityStatus: "Available",
            images: ['https://images.unsplash.com/photo-1504215680045-29eee485e9be?auto=format&fit=crop&w=800&q=80']
        };

        const addRes = await fetch('http://127.0.0.1:5000/api/equipment/add', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}` 
            },
            body: JSON.stringify(equipmentData),
        });

        const addResult = await addRes.json();
        console.log('Add Result:', addResult);

    } catch (err) {
        console.error('Error:', err.message);
    }
}

testAddEquipment();
