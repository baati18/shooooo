import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  phone: String,
  country: String,
  role: { type: String, default: 'user' },
  walletBalance: { type: Number, default: 0 },
  isVerified: { type: Boolean, default: false },
  verificationToken: String,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('User', userSchema);
