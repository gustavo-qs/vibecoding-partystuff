import { Router } from 'express';
import { SongController } from '../controllers/song.controller';

const router = Router();
const songController = new SongController();

// Add song to queue
router.post('/', songController.addSong);

// Get queue status
router.get('/queue', songController.getQueue);

// Get all songs
router.get('/', songController.getAllSongs);

// Get specific song
router.get('/:id', songController.getSong);

// Remove song (host only - would need auth middleware)
router.delete('/:id', songController.removeSong);

export default router;
