// server/server.js
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Load env variables
dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// ✅ CORS setup to allow Vite and other frontend origins
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:3000', // React
  'http://localhost:5173' // Vite
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked for origin: ${origin}`));
    }
  },
  credentials: true
}));

// ✅ Body parser
app.use(express.json());

// ✅ MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/somali_tourism')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// ✅ Health route
app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// ✅ Routes
import authRoutes from './routes/authRoutes.js';
import destinationRoutes from './routes/destinationRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import activityRoutes from './routes/activityRoutes.js';
import guideRoutes from './routes/guideRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

app.use('/api/auth', authRoutes);
app.use('/api/destinations', destinationRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/guides', guideRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/admin', adminRoutes);

// ✅ Root
app.get('/', (req, res) => res.json({
  message: 'Somalia Tourism API (modularized)',
  version: '1.0.0'
}));

// ✅ 404 handler
app.use((req, res) => res.status(404).json({ message: 'Endpoint not found' }));

// ✅ Global error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// ✅ Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

export default app;
