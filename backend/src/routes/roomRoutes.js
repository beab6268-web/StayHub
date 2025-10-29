import express from 'express';
import {
  getAllRooms,
  getRoomById,
  getRoomsByHotelId,
  checkRoomAvailability,
  searchAvailableRooms,
  createRoom,
  updateRoom,
  deleteRoom
} from '../controllers/roomController.js';
import { authenticate, canManageRoom } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getAllRooms);
router.get('/availability', checkRoomAvailability);
router.get('/search/available', searchAvailableRooms);
router.get('/hotel/:hotelId', getRoomsByHotelId);
router.get('/:id', getRoomById);
router.post('/', authenticate, canManageRoom, createRoom);
router.put('/:id', authenticate, canManageRoom, updateRoom);
router.delete('/:id', authenticate, canManageRoom, deleteRoom);

export default router;
