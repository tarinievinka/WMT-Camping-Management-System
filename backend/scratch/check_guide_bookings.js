const axios = require('axios');

async function checkGuideBookings() {
    try {
        const res = await axios.get('http://localhost:5000/api/guide-bookings/display');
        console.log('Guide Bookings Sample:', JSON.stringify(res.data.slice(0, 2), null, 2));
    } catch (err) {
        console.error('Error fetching guide bookings:', err.message);
    }
}

checkGuideBookings();
