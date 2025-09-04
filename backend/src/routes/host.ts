import { Router } from 'express';
import { HostController } from '../controllers/host.controller';

const router = Router();
const hostController = new HostController();

// Generate new host key
router.post('/key', hostController.generateKey);

// Get current host key
router.get('/key', hostController.getCurrentKey);

// Renew host key
router.put('/key', hostController.renewKey);

// Validate host key
router.post('/validate', hostController.validateKey);

// Host controls
router.post('/skip', hostController.skipSong);
router.delete('/songs/:songId', hostController.removeSong);

export default router;
