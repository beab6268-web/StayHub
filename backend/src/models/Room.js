import db from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

class Room {
  static create({ hotel_id, type, price_per_night, capacity, available_rooms = 1 }) {
    const id = uuidv4();
    const stmt = db.prepare(`
      INSERT INTO rooms (id, hotel_id, type, price_per_night, capacity, available_rooms)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    stmt.run(id, hotel_id, type, price_per_night, capacity, available_rooms);
    return this.findById(id);
  }

  static findById(id) {
    const stmt = db.prepare('SELECT * FROM rooms WHERE id = ?');
    return stmt.get(id);
  }

  static findByHotelId(hotel_id) {
    const stmt = db.prepare('SELECT * FROM rooms WHERE hotel_id = ?');
    return stmt.all(hotel_id);
  }

  static getAll() {
    const stmt = db.prepare('SELECT * FROM rooms');
    return stmt.all();
  }

  static update(id, { type, price_per_night, capacity, available_rooms }) {
    const stmt = db.prepare(`
      UPDATE rooms
      SET type = ?, price_per_night = ?, capacity = ?, available_rooms = ?
      WHERE id = ?
    `);
    stmt.run(type, price_per_night, capacity, available_rooms, id);
    return this.findById(id);
  }

  static delete(id) {
    const stmt = db.prepare('DELETE FROM rooms WHERE id = ?');
    return stmt.run(id);
  }

  static checkAvailability(room_id, check_in, check_out) {
    const stmt = db.prepare(`
      SELECT available_rooms FROM rooms WHERE id = ?
    `);
    const room = stmt.get(room_id);

    if (!room) return 0;

    const bookingsStmt = db.prepare(`
      SELECT COUNT(*) as count FROM reservations
      WHERE room_id = ?
        AND status = 'active'
        AND (
          (check_in <= ? AND check_out > ?) OR
          (check_in < ? AND check_out >= ?) OR
          (check_in >= ? AND check_out <= ?)
        )
    `);

    const bookings = bookingsStmt.get(room_id, check_in, check_in, check_out, check_out, check_in, check_out);
    return room.available_rooms - bookings.count;
  }
}

export default Room;
