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

  static findByHotelId(hotel_id) {
    const stmt = db.prepare(`
      SELECT r.*, h.name as hotel_name, h.location, ro.type as room_type, u.name as user_name, u.email as user_email
      FROM reservations r
      JOIN hotels h ON r.hotel_id = h.id
      JOIN rooms ro ON r.room_id = ro.id
      JOIN users u ON r.user_id = u.id
      WHERE r.hotel_id = ?
      ORDER BY r.created_at DESC
    `);
    return stmt.all(hotel_id);
  }

  static findByHotelIdForManager(hotel_id, user_id) {
    const authStmt = db.prepare(`
      SELECT * FROM hotel_managers
      WHERE user_id = ? AND hotel_id = ?
    `);
    const assignment = authStmt.get(user_id, hotel_id);

    if (!assignment) {
      return [];
    }

    return this.findByHotelId(hotel_id);
  }

  static findAlternativeTimes(room_id, requested_check_in, requested_check_out, days_range = 7) {
    const room = db.prepare('SELECT * FROM rooms WHERE id = ?').get(room_id);

    if (!room) {
      return { error: 'Room not found', suggestions: [] };
    }

    const requestedCheckIn = new Date(requested_check_in);
    const requestedCheckOut = new Date(requested_check_out);
    const stayDuration = Math.ceil((requestedCheckOut - requestedCheckIn) / (1000 * 60 * 60 * 24));

    const conflictingReservations = db.prepare(`
      SELECT check_in, check_out FROM reservations
      WHERE room_id = ?
        AND status = 'active'
        AND (
          (check_in <= ? AND check_out > ?) OR
          (check_in < ? AND check_out >= ?) OR
          (check_in >= ? AND check_out <= ?)
        )
      ORDER BY check_in
    `).all(room_id, requested_check_in, requested_check_in, requested_check_out, requested_check_out, requested_check_in, requested_check_out);

    if (conflictingReservations.length === 0) {
      return { available: true, suggestions: [] };
    }

    const suggestions = [];
    const startDate = new Date(requestedCheckIn);
    startDate.setDate(startDate.getDate() - days_range);
    const endDate = new Date(requestedCheckIn);
    endDate.setDate(endDate.getDate() + days_range);

    const allReservations = db.prepare(`
      SELECT check_in, check_out FROM reservations
      WHERE room_id = ?
        AND status = 'active'
        AND check_out >= ?
        AND check_in <= ?
      ORDER BY check_in
    `).all(room_id, startDate.toISOString().split('T')[0], endDate.toISOString().split('T')[0]);

    for (let dayOffset = -days_range; dayOffset <= days_range; dayOffset++) {
      if (dayOffset === 0) continue;

      const altCheckIn = new Date(requestedCheckIn);
      altCheckIn.setDate(altCheckIn.getDate() + dayOffset);
      const altCheckOut = new Date(altCheckIn);
      altCheckOut.setDate(altCheckOut.getDate() + stayDuration);

      const altCheckInStr = altCheckIn.toISOString().split('T')[0];
      const altCheckOutStr = altCheckOut.toISOString().split('T')[0];

      const hasConflict = allReservations.some(res => {
        return (
          (res.check_in <= altCheckInStr && res.check_out > altCheckInStr) ||
          (res.check_in < altCheckOutStr && res.check_out >= altCheckOutStr) ||
          (res.check_in >= altCheckInStr && res.check_out <= altCheckOutStr)
        );
      });

      if (!hasConflict) {
        suggestions.push({
          check_in: altCheckInStr,
          check_out: altCheckOutStr,
          days_difference: Math.abs(dayOffset)
        });

        if (suggestions.length >= 5) break;
      }
    }

    return {
      available: false,
      conflicting_reservations: conflictingReservations,
      suggestions: suggestions.sort((a, b) => a.days_difference - b.days_difference)
    };
  }
}

export default Reservation;
