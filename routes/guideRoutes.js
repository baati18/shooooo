import express from 'express';
const router = express.Router();

// Guide route stubs
router.get('/', async (req, res) => res.json({ message: 'List guides' }));
export default router;
