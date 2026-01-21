import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  destinationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Destination' },
  rating: Number,
  comment: String,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Review', reviewSchema);
