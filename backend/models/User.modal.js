import { sql, poolPromise } from "../config/db.config.js";
const createUser = async (username, email, passwordHash) => {
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("username", sql.VarChar, username)
      .input("email", sql.VarChar, email)
      .input("passwordHash", sql.VarChar, passwordHash).query(`
                INSERT INTO Users (username, email, password_hash)
                OUTPUT inserted.id, inserted.username, inserted.email
                VALUES (@username, @email, @passwordHash)
            `);
    return result.recordset[0];
  } catch (err) {
    console.error("SQL Error in createUser:", err);
    throw err;
  }
};

const findUserByEmail = async (email) => {
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("email", sql.VarChar, email)
      .query("SELECT * FROM Users WHERE email = @email");

    return result.recordset[0];
  } catch (err) {
    console.error("SQL Error in findUserByEmail:", err);
    throw err;
  }
};

export { createUser, findUserByEmail };
