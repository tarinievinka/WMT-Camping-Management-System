require('dotenv').config(); // Load variables from .env
const path = require('path');
const express = require('express');
const cors = require('cors');
const app = express();
const connectDB = require('./src/config/db');

// Routes Imports
const paymentRoute = require('./src/routes/payment-route/paymentRoute');
const feedbackRoute = require('./src/routes/feedback-route/feedbackRoute');
const equipmentRouter = require('./src/routes/Equipment-route/EquipmentRoute');
const notifyRoute = require('./src/routes/Notify-route/NotifyRoute');
const userRoute = require('./src/routes/user-routes/userRoutes');
const guideRoute = require("./src/routes/guide-routes/guideRoute");
const guideBookingRoute = require("./src/routes/guide-booking-routes/guideBookingRoute");
const campsiteRoute = require('./src/routes/campsite-route/campsiteRoutes');
const reservationRoute = require('./src/routes/reservation-routes/reservations');
const customerNotificationRoute = require('./src/routes/customer-notification-route/CustomerNotificationRoute');
const ticketRoute = require('./src/routes/ticket-routes/ticketRoutes');
const blogRoute = require('./src/routes/blog-route/blogRoutes');
const purchaseRoute = require('./src/routes/Equipment-route/purchaseRoutes');

const port = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: [
    process.env.FRONTEND_URL || 'http://localhost:3000', 
    'http://127.0.0.1:3000',
    'http://localhost:8081' // Added for Expo Web
  ],
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Simple error handler for JSON parsing
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'Invalid JSON: ' + err.message });
  }
  next();
});

// Routes
app.get('/', (req, res) => {
  res.send('Server running with .env port!');
});

app.use('/api/payment', paymentRoute);
app.use('/api/feedback', feedbackRoute);
app.use('/api/equipment', equipmentRouter);
app.use('/api/notify', notifyRoute);
app.use('/api', userRoute);
app.use('/api/guides', guideRoute);
app.use('/api/guide-bookings', guideBookingRoute);
app.use('/api/campsites', campsiteRoute);
app.use('/api/reservations', reservationRoute);
app.use('/api/customer-notifications', customerNotificationRoute);
app.use('/api/tickets', ticketRoute);
app.use('/api/blogs', blogRoute);
app.use('/api/purchases', purchaseRoute);

const start = async () => {
  try {
    await connectDB();
    const server = app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
    });

    server.on('error', (err) => {
      if (err && err.code === 'EADDRINUSE') {
        console.error(`Port ${port} is already in use. Free the port or set a different PORT in .env`);
        process.exit(1);
      }
      console.error('Server error:', err);
      process.exit(1);
    });
  } catch (err) {
    console.error('Database connection failed:', err);
    process.exit(1);
  }
};

start();