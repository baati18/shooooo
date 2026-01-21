import express from 'express';
import Booking from '../models/Booking.js';
import User from '../models/User.js';
import { authenticateToken } from '../middleware/auth.js';
import sendEmail from '../utils/emailService.js';

const router = express.Router();

// Public booking endpoint (used by client)
router.post('/public', async (req, res) => {
	try {
		const {
			guestName,
			guestEmail,
			guestPhone,
			destination,
			travelers,
			travelDate,
			duration,
			totalPrice,
			specialRequirements
		} = req.body;

		if (!guestName || !guestEmail || !destination) {
			return res.status(400).json({ message: 'Missing required fields' });
		}

		const booking = new Booking({
			userId: null,
			destination,
			travelers: travelers || 1,
			travelDate: travelDate ? new Date(travelDate) : undefined,
			duration: duration || 1,
			totalPrice: totalPrice || 0,
			specialRequirements: specialRequirements || '',
			guestName,
			guestEmail,
			guestPhone
		});

		await booking.save();

		// send confirmation email if configured
		await sendEmail({
			to: guestEmail,
			subject: 'Booking Received - Somalia Tourism',
			html: `<p>Hi ${guestName},</p><p>Thank you for your booking request for ${destination}. We will contact you shortly to confirm details.</p>`
		}).catch(() => {});

		res.status(201).json({ message: 'Booking submitted', booking });
	} catch (err) {
		console.error('Public booking error', err);
		res.status(500).json({ message: 'Server error' });
	}
});

// Protected: create booking for authenticated user
router.post('/', authenticateToken, async (req, res) => {
	try {
		const { destination, travelers, travelDate, duration, totalPrice, specialRequirements } = req.body;
		const booking = new Booking({
			userId: req.user.userId,
			destination,
			travelers,
			travelDate: travelDate ? new Date(travelDate) : undefined,
			duration,
			totalPrice,
			specialRequirements
		});
		await booking.save();
		const user = await User.findById(req.user.userId);
		if (user) {
			await sendEmail({ to: user.email, subject: 'Booking Confirmation', html: `<p>Your booking for ${destination} was created.</p>` }).catch(() => {});
		}
		res.status(201).json({ booking });
	} catch (err) {
		console.error('Create booking', err);
		res.status(500).json({ message: 'Server error' });
	}
});

// Get bookings for authenticated user
router.get('/', authenticateToken, async (req, res) => {
	try {
		const bookings = await Booking.find({ userId: req.user.userId }).sort({ createdAt: -1 });
		res.json(bookings);
	} catch (err) {
		console.error('Get bookings', err);
		res.status(500).json({ message: 'Server error' });
	}
});

// Admin: get all bookings
router.get('/admin/all', authenticateToken, async (req, res) => {
	try {
		if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied' });
		const bookings = await Booking.find().sort({ createdAt: -1 }).populate('userId', 'name email');
		res.json(bookings);
	} catch (err) {
		console.error('Admin bookings', err);
		res.status(500).json({ message: 'Server error' });
	}
});

// Admin: update booking status
router.put('/:id/status', authenticateToken, async (req, res) => {
	try {
		if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied' });
		const { status } = req.body;
		const booking = await Booking.findByIdAndUpdate(req.params.id, { status }, { new: true }).populate('userId', 'name email');
		if (!booking) return res.status(404).json({ message: 'Booking not found' });
		if (booking.userId && booking.userId.email) {
			await sendEmail({ to: booking.userId.email, subject: `Booking Status: ${status}`, html: `<p>Your booking status changed to ${status}.</p>` }).catch(() => {});
		}
		res.json({ booking });
	} catch (err) {
		console.error('Update booking status', err);
		res.status(500).json({ message: 'Server error' });
	}
});

export default router;
