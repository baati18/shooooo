import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
  name: String,
  description: String,
  duration: String,
  price: Number,
  destinationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Destination' }
});

export default mongoose.model('Activity', activitySchema);
