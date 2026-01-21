import mongoose from 'mongoose';

const contactMessageSchema = new mongoose.Schema({
  name: String,
  email: String,
  subject: String,
  message: String,
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('ContactMessage', contactMessageSchema);
