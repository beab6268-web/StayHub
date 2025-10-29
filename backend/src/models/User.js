import db from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

class User {
  static create({ name, email, password, role = 'user' }) {
    const id = uuidv4();
    const stmt = db.prepare(`
      INSERT INTO users (id, name, email, password, role)
      VALUES (?, ?, ?, ?, ?)
    `);
    stmt.run(id, name, email, password, role);
    return { id, name, email, role };
  }

  static findByEmail(email) {
    const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
    return stmt.get(email);
  }

  static findById(id) {
    const stmt = db.prepare('SELECT id, name, email, role, created_at FROM users WHERE id = ?');
    return stmt.get(id);
  }

  static getAll() {
    const stmt = db.prepare('SELECT id, name, email, role, created_at FROM users');
    return stmt.all();
  }

  static update(id, { name, email }) {
    const stmt = db.prepare('UPDATE users SET name = ?, email = ? WHERE id = ?');
    stmt.run(name, email, id);
    return this.findById(id);
  }

  static delete(id) {
    const stmt = db.prepare('DELETE FROM users WHERE id = ?');
    return stmt.run(id);
  }
}

export default User;
