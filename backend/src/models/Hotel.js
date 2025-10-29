import db from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

class Hotel {
  static create({ name, description, location, image_url, rating = 0, amenities = [] }) {
    const id = uuidv4();
    const stmt = db.prepare(`
      INSERT INTO hotels (id, name, description, location, image_url, rating, amenities)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(id, name, description, location, image_url, rating, JSON.stringify(amenities));
    return this.findById(id);
  }

  static findById(id) {
    const stmt = db.prepare('SELECT * FROM hotels WHERE id = ?');
    const hotel = stmt.get(id);
    if (hotel) {
      hotel.amenities = JSON.parse(hotel.amenities);
    }
    return hotel;
  }

  static getAll() {
    const stmt = db.prepare('SELECT * FROM hotels');
    const hotels = stmt.all();
    return hotels.map(hotel => ({
      ...hotel,
      amenities: JSON.parse(hotel.amenities)
    }));
  }

  static search({ location, rating }) {
    let query = 'SELECT * FROM hotels WHERE 1=1';
    const params = [];

    if (location) {
      query += ' AND location LIKE ?';
      params.push(`%${location}%`);
    }

    if (rating) {
      query += ' AND rating >= ?';
      params.push(rating);
    }

    const stmt = db.prepare(query);
    const hotels = stmt.all(...params);
    return hotels.map(hotel => ({
      ...hotel,
      amenities: JSON.parse(hotel.amenities)
    }));
  }

  static update(id, { name, description, location, image_url, rating, amenities }) {
    const stmt = db.prepare(`
      UPDATE hotels
      SET name = ?, description = ?, location = ?, image_url = ?, rating = ?, amenities = ?
      WHERE id = ?
    `);
    stmt.run(name, description, location, image_url, rating, JSON.stringify(amenities), id);
    return this.findById(id);
  }

  static delete(id) {
    const stmt = db.prepare('DELETE FROM hotels WHERE id = ?');
    return stmt.run(id);
  }

  static getManagedHotels(userId) {
    const stmt = db.prepare(`
      SELECT h.* FROM hotels h
      INNER JOIN hotel_managers hm ON h.id = hm.hotel_id
      WHERE hm.user_id = ?
    `);
    const hotels = stmt.all(userId);
    return hotels.map(hotel => ({
      ...hotel,
      amenities: JSON.parse(hotel.amenities)
    }));
  }
}

export default Hotel;
