import express from 'express';
import { fetchHistoricalData } from '../controllers/chartController.js';

const router = express.Router();

router.get('/', fetchHistoricalData);

export default router;