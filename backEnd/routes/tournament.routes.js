import express from 'express';
import { getBracket, getGroups } from '../controllers/tournament.controller.js';

const router = express.Router();

router.get('/bracket', getBracket);
router.get('/groups', getGroups); // public

export default router;
