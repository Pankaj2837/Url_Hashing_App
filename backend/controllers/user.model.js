const { sql, poolPromise } = require("../config/db.config");

const createUser = async (username, email, passwordHash) => {
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
};

const findUserByEmail = async (email) => {
  const pool = await poolPromise;
  const result = await pool
    .request()
    .input("email", sql.VarChar, email)
    .query("SELECT * FROM Users WHERE email = @email");
  return result.recordset[0];
};

module.exports = { createUser, findUserByEmail };
