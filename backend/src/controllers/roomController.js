import Room from '../models/Room.js';

export const getAllRooms = (req, res) => {
  try {
    const rooms = Room.getAll();
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getRoomById = (req, res) => {
  try {
    const room = Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }
    res.json(room);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getRoomsByHotelId = (req, res) => {
  try {
    const rooms = Room.findByHotelId(req.params.hotelId);
    res.json(rooms);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const checkRoomAvailability = (req, res) => {
  try {
    const { room_id, check_in, check_out } = req.query;

    if (!room_id || !check_in || !check_out) {
      return res.status(400).json({ error: 'Room ID, check-in, and check-out dates are required' });
    }

    const availableRooms = Room.checkAvailability(room_id, check_in, check_out);
    res.json({ available: availableRooms > 0, availableRooms });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createRoom = (req, res) => {
  try {
    const { hotel_id, type, price_per_night, capacity, available_rooms } = req.body;

    if (!hotel_id || !type || !price_per_night || !capacity) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const room = Room.create({
      hotel_id,
      type,
      price_per_night: parseFloat(price_per_night),
      capacity: parseInt(capacity),
      available_rooms: available_rooms ? parseInt(available_rooms) : 1
    });

    res.status(201).json({ message: 'Room created successfully', room });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateRoom = (req, res) => {
  try {
    const { type, price_per_night, capacity, available_rooms } = req.body;

    const existingRoom = Room.findById(req.params.id);
    if (!existingRoom) {
      return res.status(404).json({ error: 'Room not found' });
    }

    const room = Room.update(req.params.id, {
      type,
      price_per_night: parseFloat(price_per_night),
      capacity: parseInt(capacity),
      available_rooms: parseInt(available_rooms)
    });

    res.json({ message: 'Room updated successfully', room });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteRoom = (req, res) => {
  try {
    const room = Room.findById(req.params.id);
    if (!room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    Room.delete(req.params.id);
    res.json({ message: 'Room deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
