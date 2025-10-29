import express from 'express';
import {
  getAllReservations,
  getReservationById,
  getUserReservations,
  getHotelReservations,
  createReservation,
  updateReservationStatus,
  deleteReservation,
  getAlternativeTimeSuggestions
} from '../controllers/reservationController.js';
import { authenticate, isAdmin, isAdminOrHotelManager } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, isAdmin, getAllReservations);
router.get('/my-reservations', authenticate, getUserReservations);
router.get('/hotel/:hotelId', authenticate, isAdminOrHotelManager, getHotelReservations);
router.get('/alternatives/:roomId', getAlternativeTimeSuggestions);
router.get('/:id', authenticate, getReservationById);
router.post('/', authenticate, createReservation);
router.patch('/:id/status', authenticate, updateReservationStatus);
router.delete('/:id', authenticate, deleteReservation);

export default router;
