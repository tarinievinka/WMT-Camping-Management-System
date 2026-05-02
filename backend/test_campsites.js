const axios = require('axios');

async function test() {
    try {
        console.log('Logging in...');
        const loginRes = await axios.post('http://localhost:5000/api/users/login', {
            email: 'campowner@mail.com',
            password: 'password123'
        });
        const token = loginRes.data.token;
        console.log('Token acquired:', token.slice(0, 10));

        console.log('Creating campsite...');
        const createRes = await axios.post('http://localhost:5000/api/campsites/add', {
            name: 'Test Campsite ' + Date.now(),
            location: 'Test Location',
            pricePerNight: 50,
            capacity: 5
        }, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Created:', createRes.data.data._id, 'Owner:', createRes.data.data.ownerId);

        console.log('Fetching /mine...');
        const mineRes = await axios.get('http://localhost:5000/api/campsites/mine', {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Mine length:', mineRes.data.data.length);
        if (mineRes.data.data.length > 0) {
            console.log('First campsite Owner:', mineRes.data.data[0].ownerId);
        }
    } catch (e) {
        console.error(e.response ? e.response.data : e.message);
    }
}
test();
