import express from 'express';
import {
  getRegistrations,
  togglePayment,
  cancelRegistration,
  moveMember,
  seedBracket,
  setMatchResult,
  upsertRanking,
  deleteRanking,
  syncPlayers,
  refreshRanks,
} from '../controllers/admin.controller.js';
import { verifyToken, verifyAdmin } from '../utils/verifyUser.js';

const router = express.Router();

// Every admin route requires a logged-in ADMIN user.
router.use(verifyToken, verifyAdmin);

router.get('/registrations', getRegistrations);
router.post('/payment/toggle', togglePayment);
router.delete('/registration/:type/:id', cancelRegistration);
router.patch('/team/member/:id', moveMember);
router.post('/bracket/seed', seedBracket);
router.post('/match/:code/result', setMatchResult);
router.post('/ranking', upsertRanking);
router.post('/ranking/sync-players', syncPlayers);
router.post('/ranking/refresh-ranks', refreshRanks);
router.delete('/ranking/:id', deleteRanking);

export default router;
