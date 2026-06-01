import express from 'express';
import { getRoster, addMember, removeMember } from '../controllers/team.controller.js';
import { verifyToken } from '../utils/verifyUser.js';

const router = express.Router();

router.get('/roster', verifyToken, getRoster);
router.post('/member', verifyToken, addMember);
router.delete('/member/:id', verifyToken, removeMember);

export default router;
