import { Router } from 'express';
import { HostController } from '../controllers/host.controller';

const router = Router();
const hostController = new HostController();

// Generate new host key
router.post('/key', hostController.generateKey.bind(hostController));

// Get current host key
router.get('/key', hostController.getCurrentKey.bind(hostController));

// Renew host key
router.put('/key', hostController.renewKey.bind(hostController));

// Validate host key
router.post('/validate', hostController.validateKey.bind(hostController));

// Host controls
router.post('/skip', hostController.skipSong.bind(hostController));
router.delete('/songs/:songId', hostController.removeSong.bind(hostController));

export default router;
