import Reservation from '../models/Reservation.js';
import Room from '../models/Room.js';
import db from '../config/database.js';

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
    const transformed = reservations.map(r => ({
      id: r.id,
      user_id: r.user_id,
      hotel_id: r.hotel_id,
      room_id: r.room_id,
      check_in: r.check_in,
      check_out: r.check_out,
      guests: r.guests,
      total_price: r.total_price,
      status: r.status,
      created_at: r.created_at,
      hotel: {
        name: r.hotel_name,
        location: r.location,
        image_url: r.image_url
      },
      room: {
        type: r.room_type
      }
    }));
    res.json(transformed);
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

    const isOwner = existingReservation.user_id === req.userId;
    const isAdminUser = req.userRole === 'admin';

    let isHotelManager = false;
    if (req.userRole === 'hotel_manager') {
      const stmt = db.prepare(`
        SELECT * FROM hotel_managers
        WHERE user_id = ? AND hotel_id = ?
      `);
      const assignment = stmt.get(req.userId, existingReservation.hotel_id);
      isHotelManager = !!assignment;
    }

    if (!isAdminUser && !isOwner && !isHotelManager) {
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

export const getHotelReservations = (req, res) => {
  try {
    const { hotelId } = req.params;

    if (req.userRole === 'admin') {
      const reservations = Reservation.findByHotelId(hotelId);
      return res.json(reservations);
    }

    if (req.userRole === 'hotel_manager') {
      const reservations = Reservation.findByHotelIdForManager(hotelId, req.userId);
      return res.json(reservations);
    }

    res.status(403).json({ error: 'Access denied' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getAlternativeTimeSuggestions = (req, res) => {
  try {
    const { roomId } = req.params;
    const { check_in, check_out, days_range = 7 } = req.query;

    if (!check_in || !check_out) {
      return res.status(400).json({ error: 'Check-in and check-out dates are required' });
    }

    const alternatives = Reservation.findAlternativeTimes(
      roomId,
      check_in,
      check_out,
      parseInt(days_range)
    );

    res.json(alternatives);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
