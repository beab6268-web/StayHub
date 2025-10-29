import express from 'express';
import {
  getAllHotels,
  getHotelById,
  searchHotels,
  createHotel,
  updateHotel,
  deleteHotel,
  getManagedHotels
} from '../controllers/hotelController.js';
import { authenticate, isAdmin, canManageHotel, isAdminOrHotelManager } from '../middleware/auth.js';
import { upload } from '../utils/upload.js';

const router = express.Router();

router.get('/', getAllHotels);
router.get('/search', searchHotels);
router.get('/managed/my-hotels', authenticate, isAdminOrHotelManager, getManagedHotels);
router.get('/:id', getHotelById);
router.post('/', authenticate, isAdmin, upload.single('file'), createHotel);
router.put('/:id', authenticate, canManageHotel, upload.single('file'), updateHotel);
router.delete('/:id', authenticate, isAdmin, deleteHotel);

export default router;
