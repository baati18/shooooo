import express from 'express';
const router = express.Router();

// Activity route stubs
router.get('/', async (req, res) => res.json({ message: 'List activities' }));
export default router;
