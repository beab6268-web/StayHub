import express from 'express';
import {
  getAllHotels,
  getHotelById,
  searchHotels,
  createHotel,
  updateHotel,
  deleteHotel
} from '../controllers/hotelController.js';
import { authenticate, isAdmin } from '../middleware/auth.js';
import { upload } from '../utils/upload.js';

const router = express.Router();

router.get('/', getAllHotels);
router.get('/search', searchHotels);
router.get('/:id', getHotelById);
router.post('/', authenticate, isAdmin, upload.single('image'), createHotel);
router.put('/:id', authenticate, isAdmin, upload.single('image'), updateHotel);
router.delete('/:id', authenticate, isAdmin, deleteHotel);

export default router;
