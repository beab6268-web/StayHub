import express from 'express';
import {
  getAllUsers,
  createUser,
  updateUserRole,
  deleteUser,
  assignHotelManager,
  removeHotelManager,
  getHotelManagers,
  getUserHotels
} from '../controllers/adminController.js';
import { authenticate, isAdmin } from '../middleware/auth.js';

const router = express.Router();

router.get('/users', authenticate, isAdmin, getAllUsers);
router.post('/users', authenticate, isAdmin, createUser);
router.put('/users/:id/role', authenticate, isAdmin, updateUserRole);
router.delete('/users/:id', authenticate, isAdmin, deleteUser);
router.post('/hotel-managers/assign', authenticate, isAdmin, assignHotelManager);
router.post('/hotel-managers/remove', authenticate, isAdmin, removeHotelManager);
router.get('/hotel-managers/:hotelId', authenticate, isAdmin, getHotelManagers);
router.get('/users/:userId/hotels', authenticate, isAdmin, getUserHotels);

export default router;
