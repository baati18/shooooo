import mongoose from 'mongoose';

const guideSchema = new mongoose.Schema({
  name: String,
  bio: String,
  languages: [String],
  phone: String,
  rating: Number
});

export default mongoose.model('Guide', guideSchema);
