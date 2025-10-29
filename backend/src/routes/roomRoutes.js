import express from 'express';
import {
  getAllRooms,
  getRoomById,
  getRoomsByHotelId,
  checkRoomAvailability,
  createRoom,
  updateRoom,
  deleteRoom
} from '../controllers/roomController.js';
import { authenticate, isAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getAllRooms);
router.get('/availability', checkRoomAvailability);
router.get('/hotel/:hotelId', getRoomsByHotelId);
router.get('/:id', getRoomById);
router.post('/', authenticate, isAdmin, createRoom);
router.put('/:id', authenticate, isAdmin, updateRoom);
router.delete('/:id', authenticate, isAdmin, deleteRoom);

export default router;
