import mongoose from 'mongoose';

const destinationSchema = new mongoose.Schema({
  name: String,
  region: String,
  description: String,
  highlights: [String],
  bestTime: String,
  climate: String,
  rating: Number,
  price: Number,
  imageUrl: String,
  activities: [String]
});

export default mongoose.model('Destination', destinationSchema);
