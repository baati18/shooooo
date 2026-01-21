import express from 'express';
import ContactMessage from '../models/ContactMessage.js';
import NewsletterSubscriber from '../models/NewsletterSubscriber.js';
import sendEmail from '../utils/emailService.js';

const router = express.Router();

// Submit contact form
router.post('/', async (req, res) => {
	try {
		const { name, email, subject, message } = req.body;
		if (!name || !email || !message) return res.status(400).json({ message: 'Missing fields' });

		const contact = new ContactMessage({ name, email, subject: subject || 'No subject', message });
		await contact.save();

		// notify admin
		await sendEmail({ to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER, subject: `New contact: ${subject || 'No subject'}`, html: `<p>From: ${name} (${email})</p><p>${message}</p>` }).catch(() => {});

		res.status(201).json({ message: 'Message sent' });
	} catch (err) {
		console.error('Contact submit', err);
		res.status(500).json({ message: 'Server error' });
	}
});

// Newsletter subscribe endpoint
router.post('/newsletter/subscribe', async (req, res) => {
	try {
		const { email } = req.body;
		if (!email) return res.status(400).json({ message: 'Email required' });
		const exists = await NewsletterSubscriber.findOne({ email });
		if (exists) return res.status(400).json({ message: 'Already subscribed' });
		const sub = new NewsletterSubscriber({ email });
		await sub.save();
		await sendEmail({ to: email, subject: 'Subscribed', html: '<p>Thanks for subscribing</p>' }).catch(() => {});
		res.status(201).json({ message: 'Subscribed' });
	} catch (err) {
		console.error('Newsletter subscribe', err);
		res.status(500).json({ message: 'Server error' });
	}
});

export default router;
