// routes/destinationRoutes.js
import express from 'express';
import Destination from '../models/Destination.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// ✅ Public Routes

// Popular destinations - PLACE FIRST
router.get('/popular', async (req, res) => {
  try {
    const popular = await Destination.find().sort({ rating: -1 }).limit(6);
    res.json(popular);
  } catch (err) {
    console.error('Popular destinations', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Search destinations
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.status(400).json({ message: 'Query required' });
    const results = await Destination.find({
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { region: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } }
      ]
    });
    res.json(results);
  } catch (err) {
    console.error('Search destinations', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all destinations
router.get('/', async (req, res) => {
  try {
    const destinations = await Destination.find().sort({ name: 1 });
    res.json(destinations);
  } catch (err) {
    console.error('Get destinations', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single destination by ID
router.get('/:id', async (req, res) => {
  try {
    const dest = await Destination.findById(req.params.id);
    if (!dest) return res.status(404).json({ message: 'Destination not found' });
    res.json(dest);
  } catch (err) {
    console.error('Get destination', err);
    res.status(500).json({ message: 'Server error' });
  }
});


// ✅ Admin Routes (protected)
router.post('/', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied' });
    const dest = new Destination(req.body);
    await dest.save();
    res.status(201).json({ message: 'Destination created', dest });
  } catch (err) {
    console.error('Create destination', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied' });
    const dest = await Destination.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!dest) return res.status(404).json({ message: 'Destination not found' });
    res.json({ message: 'Destination updated', dest });
  } catch (err) {
    console.error('Update destination', err);
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') return res.status(403).json({ message: 'Access denied' });
    const dest = await Destination.findByIdAndDelete(req.params.id);
    if (!dest) return res.status(404).json({ message: 'Destination not found' });
    res.json({ message: 'Destination deleted' });
  } catch (err) {
    console.error('Delete destination', err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
