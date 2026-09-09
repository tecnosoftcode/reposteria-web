// backend/src/models/Token.js
const db = require('../config/database').pool;

class Token {
  static async saveToken(token, userId = null) {
    try {
      const [result] = await db.execute(
        'INSERT INTO tokens (token, user_id, updated_at) VALUES (?, ?, NOW()) ON DUPLICATE KEY UPDATE updated_at = NOW(), user_id = COALESCE(?, user_id)',
        [token, userId, userId]
      );
      return result;
    } catch (error) {
      console.error('❌ Error en saveToken:', error.message);
      throw error;
    }
  }

  static async getAllTokens() {
    try {
      const [rows] = await db.execute('SELECT token FROM tokens');
      return rows.map(row => row.token);
    } catch (error) {
      console.error('❌ Error en getAllTokens:', error.message);
      throw error;
    }
  }

  static async deleteToken(token) {
    try {
      const [result] = await db.execute('DELETE FROM tokens WHERE token = ?', [token]);
      return result;
    } catch (error) {
      console.error('❌ Error en deleteToken:', error.message);
      throw error;
    }
  }
}

module.exports = Token;