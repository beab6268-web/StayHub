import Reservation from '../models/Reservation.js';
import Room from '../models/Room.js';

export const getAllReservations = (req, res) => {
  try {
    const reservations = Reservation.getAll();
    res.json(reservations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getReservationById = (req, res) => {
  try {
    const reservation = Reservation.findById(req.params.id);
    if (!reservation) {
      return res.status(404).json({ error: 'Reservation not found' });
    }

    if (req.userRole !== 'admin' && reservation.user_id !== req.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(reservation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getUserReservations = (req, res) => {
  try {
    const reservations = Reservation.findByUserId(req.userId);
    res.json(reservations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createReservation = (req, res) => {
  try {
    const { hotel_id, room_id, check_in, check_out, guests, total_price } = req.body;

    if (!hotel_id || !room_id || !check_in || !check_out || !guests || !total_price) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const availableRooms = Room.checkAvailability(room_id, check_in, check_out);
    if (availableRooms <= 0) {
      return res.status(400).json({ error: 'No rooms available for the selected dates' });
    }

    const reservation = Reservation.create({
      user_id: req.userId,
      hotel_id,
      room_id,
      check_in,
      check_out,
      guests: parseInt(guests),
      total_price: parseFloat(total_price)
    });

    res.status(201).json({ message: 'Reservation created successfully', reservation });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateReservationStatus = (req, res) => {
  try {
    const { status } = req.body;

    if (!status || !['active', 'cancelled', 'completed'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const existingReservation = Reservation.findById(req.params.id);
    if (!existingReservation) {
      return res.status(404).json({ error: 'Reservation not found' });
    }

    if (req.userRole !== 'admin' && existingReservation.user_id !== req.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const reservation = Reservation.updateStatus(req.params.id, status);
    res.json({ message: 'Reservation status updated successfully', reservation });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteReservation = (req, res) => {
  try {
    const reservation = Reservation.findById(req.params.id);
    if (!reservation) {
      return res.status(404).json({ error: 'Reservation not found' });
    }

    if (req.userRole !== 'admin' && reservation.user_id !== req.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    Reservation.delete(req.params.id);
    res.json({ message: 'Reservation deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
