import express from 'express';
import {
  getRegistrations,
  togglePayment,
  cancelRegistration,
  seedBracket,
  setMatchResult,
} from '../controllers/admin.controller.js';
import { verifyToken, verifyAdmin } from '../utils/verifyUser.js';

const router = express.Router();

// Every admin route requires a logged-in ADMIN user.
router.use(verifyToken, verifyAdmin);

router.get('/registrations', getRegistrations);
router.post('/payment/toggle', togglePayment);
router.delete('/registration/:type/:id', cancelRegistration);
router.post('/bracket/seed', seedBracket);
router.post('/match/:code/result', setMatchResult);

export default router;
