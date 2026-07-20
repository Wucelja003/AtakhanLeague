import express from 'express';
import { getBracket } from '../controllers/tournament.controller.js';

const router = express.Router();

router.get('/bracket', getBracket); // public

export default router;
