import express from 'express';
import {
  getAllReservations,
  getReservationById,
  getUserReservations,
  createReservation,
  updateReservationStatus,
  deleteReservation
} from '../controllers/reservationController.js';
import { authenticate, isAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticate, isAdmin, getAllReservations);
router.get('/my-reservations', authenticate, getUserReservations);
router.get('/:id', authenticate, getReservationById);
router.post('/', authenticate, createReservation);
router.patch('/:id/status', authenticate, updateReservationStatus);
router.delete('/:id', authenticate, deleteReservation);

export default router;
