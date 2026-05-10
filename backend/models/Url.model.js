const { sql, poolPromise } = require("../config/db.config");
const { encode } = require("../utils/Encoder.util");

const createShortUrl = async (longUrl, userId = null) => {
  // 1. Wait for the pool to be ready
  const pool = await poolPromise;

  // 2. Attach the transaction to THIS pool
  const transaction = new sql.Transaction(pool);

  try {
    await transaction.begin();
    const request = new sql.Request(transaction);

    // Step 1: Insert to get the ID
    const result = await request
      .input("longUrl", sql.VarChar, longUrl)
      .input("userId", sql.Int, userId).query(`
                INSERT INTO URLs (long_url, user_id, created_at) 
                OUTPUT inserted.id 
                VALUES (@longUrl, @userId, GETDATE())
            `);

    const newId = result.recordset[0].id;
    const shortCode = encode(newId);

    // Step 2: Update with Short Code
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
module.exports = { createShortUrl, getLongUrl };
