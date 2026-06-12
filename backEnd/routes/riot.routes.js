import express from 'express';
import { getMyStats } from '../controllers/riot.controller.js';
import { verifyToken } from '../utils/verifyUser.js';

const router = express.Router();

router.get('/me', verifyToken, getMyStats);

export default router;
