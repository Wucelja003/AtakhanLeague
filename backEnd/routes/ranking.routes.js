import express from 'express';
import { getRankings } from '../controllers/ranking.controller.js';

const router = express.Router();

// Public leaderboard
router.get('/', getRankings);

export default router;
