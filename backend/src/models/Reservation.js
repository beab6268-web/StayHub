import db from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

class Reservation {
  static create({ user_id, hotel_id, room_id, check_in, check_out, guests, total_price }) {
    const id = uuidv4();
    const stmt = db.prepare(`
      INSERT INTO reservations (id, user_id, hotel_id, room_id, check_in, check_out, guests, total_price, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active')
    `);
    stmt.run(id, user_id, hotel_id, room_id, check_in, check_out, guests, total_price);
    return this.findById(id);
  }

  static findById(id) {
    const stmt = db.prepare(`
      SELECT r.*, h.name as hotel_name, h.location, ro.type as room_type
      FROM reservations r
      JOIN hotels h ON r.hotel_id = h.id
      JOIN rooms ro ON r.room_id = ro.id
      WHERE r.id = ?
    `);
    return stmt.get(id);
  }

  static findByUserId(user_id) {
    const stmt = db.prepare(`
      SELECT r.*, h.name as hotel_name, h.location, h.image_url, ro.type as room_type
      FROM reservations r
      JOIN hotels h ON r.hotel_id = h.id
      JOIN rooms ro ON r.room_id = ro.id
      WHERE r.user_id = ?
      ORDER BY r.created_at DESC
    `);
    return stmt.all(user_id);
  }

  static getAll() {
    const stmt = db.prepare(`
      SELECT r.*, h.name as hotel_name, h.location, ro.type as room_type, u.name as user_name, u.email as user_email
      FROM reservations r
      JOIN hotels h ON r.hotel_id = h.id
      JOIN rooms ro ON r.room_id = ro.id
      JOIN users u ON r.user_id = u.id
      ORDER BY r.created_at DESC
    `);
    return stmt.all();
  }

  static updateStatus(id, status) {
    const stmt = db.prepare('UPDATE reservations SET status = ? WHERE id = ?');
    stmt.run(status, id);
    return this.findById(id);
  }

  static delete(id) {
    const stmt = db.prepare('DELETE FROM reservations WHERE id = ?');
    return stmt.run(id);
  }
}

export default Reservation;
