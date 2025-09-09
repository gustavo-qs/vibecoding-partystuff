import { Router } from 'express';
import { SongController } from '../controllers/song.controller';

const router = Router();
const songController = new SongController();

// Add song to queue
router.post('/', songController.addSong.bind(songController));

// Get queue status
router.get('/queue', songController.getQueue.bind(songController));

// Get all songs
router.get('/', songController.getAllSongs.bind(songController));

// Get specific song
router.get('/:id', songController.getSong.bind(songController));

// Remove song (host only - would need auth middleware)
router.delete('/:id', songController.removeSong.bind(songController));

export default router;
