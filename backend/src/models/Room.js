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

  static searchAvailable({ location, check_in, check_out, guests, capacity }) {
    let query = `
      SELECT r.*, h.name as hotel_name, h.location, h.rating, h.image_url,
        r.available_rooms - COALESCE((
          SELECT COUNT(*) FROM reservations res
          WHERE res.room_id = r.id
            AND res.status = 'active'
            AND (
              (res.check_in <= ? AND res.check_out > ?) OR
              (res.check_in < ? AND res.check_out >= ?) OR
              (res.check_in >= ? AND res.check_out <= ?)
            )
        ), 0) as available_count
      FROM rooms r
      INNER JOIN hotels h ON r.hotel_id = h.id
      WHERE 1=1
    `;

    const params = [check_in, check_in, check_out, check_out, check_in, check_out];

    if (location) {
      query += ' AND h.location LIKE ?';
      params.push(`%${location}%`);
    }

    if (capacity) {
      query += ' AND r.capacity >= ?';
      params.push(capacity);
    }

    if (guests) {
      query += ' AND r.capacity >= ?';
      params.push(guests);
    }

    query += ' HAVING available_count > 0';

    const stmt = db.prepare(query);
    return stmt.all(...params);
  }
}

export default Room;
