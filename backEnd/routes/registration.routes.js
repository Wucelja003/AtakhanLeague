import express from 'express';
import {
  registerTeam,
  registerIndividual,
  listIndividuals,
  getMyRegistration,
  cancelTeam,
  cancelIndividual,
} from '../controllers/registration.controller.js';
import { verifyToken } from '../utils/verifyUser.js';

const router = express.Router();

router.post('/team', verifyToken, registerTeam);
router.post('/individual', verifyToken, registerIndividual);
router.delete('/team', verifyToken, cancelTeam);
router.delete('/individual', verifyToken, cancelIndividual);
router.get('/me', verifyToken, getMyRegistration);
router.get('/individuals', listIndividuals); // public — read-only

export default router;
