import express from 'express';
import ContactMessage from '../models/ContactMessage.js';
import Booking from '../models/Booking.js';
import User from '../models/User.js';
import NewsletterSubscriber from '../models/NewsletterSubscriber.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Get contact messages (admin)
router.get('/messages', authenticateToken, async (req, res) => {
	try {
		if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied' });
		const messages = await ContactMessage.find().sort({ createdAt: -1 });
		res.json(messages);
	} catch (err) {
		console.error('Admin messages', err);
		res.status(500).json({ message: 'Server error' });
	}
});

router.put('/messages/:id/read', authenticateToken, async (req, res) => {
	try {
		if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied' });
		const msg = await ContactMessage.findByIdAndUpdate(req.params.id, { read: true }, { new: true });
		if (!msg) return res.status(404).json({ message: 'Message not found' });
		res.json({ message: 'Marked as read', msg });
	} catch (err) {
		console.error('Mark message read', err);
		res.status(500).json({ message: 'Server error' });
	}
});

// Admin stats
router.get('/stats', authenticateToken, async (req, res) => {
	try {
		if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied' });
		const totalUsers = await User.countDocuments();
		const totalBookings = await Booking.countDocuments();
		const pendingBookings = await Booking.countDocuments({ status: 'pending' });
		const confirmedBookings = await Booking.countDocuments({ status: 'confirmed' });
		const totalMessages = await ContactMessage.countDocuments();
		const unreadMessages = await ContactMessage.countDocuments({ read: false });
		const newsletterSubscribers = await NewsletterSubscriber.countDocuments();

		res.json({ totalUsers, totalBookings, pendingBookings, confirmedBookings, totalMessages, unreadMessages, newsletterSubscribers });
	} catch (err) {
		console.error('Admin stats', err);
		res.status(500).json({ message: 'Server error' });
	}
});

// List users
router.get('/users', authenticateToken, async (req, res) => {
	try {
		if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied' });
		const users = await User.find().select('-password').sort({ createdAt: -1 });
		res.json(users);
	} catch (err) {
		console.error('Admin users', err);
		res.status(500).json({ message: 'Server error' });
	}
});

export default router;
