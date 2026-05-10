import { sql, poolPromise } from "../config/db.config.js";
import { encode } from "../utils/Encoder.util.js";

const createShortUrl = async (longUrl, userId = null) => {
  const pool = await poolPromise;

  const transaction = new sql.Transaction(pool);

  try {
    await transaction.begin();
    const request = new sql.Request(transaction);

    const result = await request
      .input("longUrl", sql.VarChar, longUrl)
      .input("userId", sql.Int, userId).query(`
                INSERT INTO URLs (long_url, user_id, created_at, created_by) 
                OUTPUT inserted.id 
                VALUES (@longUrl, @userId, GETDATE(), @userId)
            `);

    const newId = result.recordset[0].id;
    const shortCode = encode(newId);

    await request
      .input("id", sql.Int, newId)
      .input("shortCode", sql.VarChar, shortCode)
      .query(`UPDATE URLs SET short_code = @shortCode WHERE id = @id`);

    await transaction.commit();
    return { id: newId, shortCode, longUrl };
  } catch (err) {
    if (transaction) await transaction.rollback();
    throw err;
  }
};
const getLongUrl = async (shortCode) => {
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("shortCode", sql.VarChar, shortCode)
      .query("SELECT long_url FROM URLs WHERE short_code = @shortCode");

    return result.recordset.length > 0 ? result.recordset[0].long_url : null;
  } catch (err) {
    console.error("SQL error", err);
    throw err;
  }
};
export { createShortUrl, getLongUrl };
