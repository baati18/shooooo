import express from 'express';
const router = express.Router();

// Review route stubs
router.post('/', async (req, res) => res.json({ message: 'Create review' }));
export default router;
