const { sql, poolPromise } = require("../config/db.config");

/**
 * Creates a new user in the database
 */
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

    // Returns the created user (id, username, email)
    return result.recordset[0];
  } catch (err) {
    console.error("SQL Error in createUser:", err);
    throw err;
  }
};

/**
 * Finds a user by their email address
 */
const findUserByEmail = async (email) => {
  try {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input("email", sql.VarChar, email)
      .query("SELECT * FROM Users WHERE email = @email");

    // Returns the user object if found, otherwise undefined
    return result.recordset[0];
  } catch (err) {
    console.error("SQL Error in findUserByEmail:", err);
    throw err;
  }
};

module.exports = {
  createUser,
  findUserByEmail,
};
