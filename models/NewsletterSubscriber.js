import mongoose from 'mongoose';

const newsletterSubscriberSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  subscribedAt: { type: Date, default: Date.now }
});

export default mongoose.model('NewsletterSubscriber', newsletterSubscriberSchema);
