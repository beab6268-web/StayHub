import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import db from '../config/database.js';

export const authenticate = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

export const isAdmin = (req, res, next) => {
  if (req.userRole !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

export const isAdminOrHotelManager = (req, res, next) => {
  if (req.userRole !== 'admin' && req.userRole !== 'hotel_manager') {
    return res.status(403).json({ error: 'Admin or hotel manager access required' });
  }
  next();
};

export const canManageHotel = (req, res, next) => {
  if (req.userRole === 'admin') {
    return next();
  }

  if (req.userRole === 'hotel_manager') {
    const hotelId = req.params.id || req.params.hotelId || req.body.hotel_id;

    if (!hotelId) {
      return res.status(400).json({ error: 'Hotel ID is required' });
    }

    const stmt = db.prepare(`
      SELECT * FROM hotel_managers
      WHERE user_id = ? AND hotel_id = ?
    `);
    const assignment = stmt.get(req.userId, hotelId);

    if (!assignment) {
      return res.status(403).json({ error: 'You do not have permission to manage this hotel' });
    }

    return next();
  }

  return res.status(403).json({ error: 'Insufficient permissions' });
};

export const canManageRoom = (req, res, next) => {
  if (req.userRole === 'admin') {
    return next();
  }

  if (req.userRole === 'hotel_manager') {
    const roomId = req.params.id;
    const hotelIdFromBody = req.body.hotel_id;

    let hotelId = hotelIdFromBody;

    if (roomId && !hotelIdFromBody) {
      const roomStmt = db.prepare('SELECT hotel_id FROM rooms WHERE id = ?');
      const room = roomStmt.get(roomId);

      if (!room) {
        return res.status(404).json({ error: 'Room not found' });
      }

      hotelId = room.hotel_id;
    }

    if (!hotelId) {
      return res.status(400).json({ error: 'Hotel ID is required' });
    }

    const stmt = db.prepare(`
      SELECT * FROM hotel_managers
      WHERE user_id = ? AND hotel_id = ?
    `);
    const assignment = stmt.get(req.userId, hotelId);

    if (!assignment) {
      return res.status(403).json({ error: 'You do not have permission to manage rooms for this hotel' });
    }

    return next();
  }

  return res.status(403).json({ error: 'Insufficient permissions' });
};
