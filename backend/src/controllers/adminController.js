import User from '../models/User.js';
import db from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';
import bcrypt from 'bcryptjs';

export const getAllUsers = (req, res) => {
  try {
    const users = User.getAll();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (!['user', 'admin', 'hotel_manager'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const existingUser = User.findByEmail(email);
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = User.create({
      name,
      email,
      password: hashedPassword,
      role
    });

    res.status(201).json({ message: 'User created successfully', user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateUserRole = (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!role || !['user', 'admin', 'hotel_manager'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const user = User.findById(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const stmt = db.prepare('UPDATE users SET role = ? WHERE id = ?');
    stmt.run(role, id);

    const updatedUser = User.findById(id);
    res.json({ message: 'User role updated successfully', user: updatedUser });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteUser = (req, res) => {
  try {
    const { id } = req.params;

    const user = User.findById(id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.id === req.userId) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    User.delete(id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const assignHotelManager = (req, res) => {
  try {
    const { user_id, hotel_id } = req.body;

    if (!user_id || !hotel_id) {
      return res.status(400).json({ error: 'User ID and Hotel ID are required' });
    }

    const user = User.findById(user_id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (user.role !== 'hotel_manager') {
      return res.status(400).json({ error: 'User must have hotel_manager role' });
    }

    const checkStmt = db.prepare(`
      SELECT * FROM hotel_managers WHERE user_id = ? AND hotel_id = ?
    `);
    const existing = checkStmt.get(user_id, hotel_id);

    if (existing) {
      return res.status(400).json({ error: 'Manager already assigned to this hotel' });
    }

    const id = uuidv4();
    const stmt = db.prepare(`
      INSERT INTO hotel_managers (id, user_id, hotel_id)
      VALUES (?, ?, ?)
    `);
    stmt.run(id, user_id, hotel_id);

    res.status(201).json({ message: 'Hotel manager assigned successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const removeHotelManager = (req, res) => {
  try {
    const { user_id, hotel_id } = req.body;

    if (!user_id || !hotel_id) {
      return res.status(400).json({ error: 'User ID and Hotel ID are required' });
    }

    const stmt = db.prepare(`
      DELETE FROM hotel_managers WHERE user_id = ? AND hotel_id = ?
    `);
    const result = stmt.run(user_id, hotel_id);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    res.json({ message: 'Hotel manager removed successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getHotelManagers = (req, res) => {
  try {
    const { hotelId } = req.params;

    const stmt = db.prepare(`
      SELECT u.id, u.name, u.email, u.role, hm.created_at as assigned_at
      FROM hotel_managers hm
      JOIN users u ON hm.user_id = u.id
      WHERE hm.hotel_id = ?
    `);
    const managers = stmt.all(hotelId);

    res.json(managers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getUserHotels = (req, res) => {
  try {
    const { userId } = req.params;

    const stmt = db.prepare(`
      SELECT h.id, h.name, h.location, hm.created_at as assigned_at
      FROM hotel_managers hm
      JOIN hotels h ON hm.hotel_id = h.id
      WHERE hm.user_id = ?
    `);
    const hotels = stmt.all(userId);

    res.json(hotels);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
