// backend/src/models/Token.js
const db = require('../config/database');

class Token {
  static async saveToken(token, userId = null) {
    try {
      console.log('📝 Guardando token en DB...');
      
      const sql = `
        INSERT INTO tokens (token, user_id, updated_at) 
        VALUES (?, ?, NOW()) 
        ON DUPLICATE KEY UPDATE 
        updated_at = NOW(),
        user_id = COALESCE(?, user_id)
      `;
      
      const [result] = await db.pool.execute(sql, [token, userId, userId]);
      console.log('✅ Token guardado correctamente');
      return result;
    } catch (error) {
      console.error('❌ Error en saveToken:', error.message);
      throw error;
    }
  }

  static async getAllTokens() {
    try {
      const [rows] = await db.pool.execute('SELECT token FROM tokens');
      return rows.map(row => row.token);
    } catch (error) {
      console.error('❌ Error en getAllTokens:', error.message);
      throw error;
    }
  }

  static async getTokensByUser(userId) {
    try {
      const [rows] = await db.pool.execute('SELECT token FROM tokens WHERE user_id = ?', [userId]);
      return rows.map(row => row.token);
    } catch (error) {
      console.error('❌ Error en getTokensByUser:', error.message);
      throw error;
    }
  }

  static async deleteToken(token) {
    try {
      const [result] = await db.pool.execute('DELETE FROM tokens WHERE token = ?', [token]);
      return result;
    } catch (error) {
      console.error('❌ Error en deleteToken:', error.message);
      throw error;
    }
  }
}

module.exports = Token;