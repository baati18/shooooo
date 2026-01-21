import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  destination: String,
  travelers: Number,
  travelDate: Date,
  duration: Number,
  totalPrice: Number,
  status: { type: String, default: 'pending' },
  specialRequirements: String,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Booking', bookingSchema);
