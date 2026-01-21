import express from 'express';
const router = express.Router();

// Authentication routes removed per request; keep stubbed routes here.
router.get('/', (req, res) => res.json({ message: 'Auth routes are disabled' }));

export default router;
