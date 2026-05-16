import sql from "mssql";
import "dotenv/config";

const dbConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  server: process.env.DB_SERVER,
  pool: {
    max: 15,
    min: 0,
    idleTimeoutMillis: 30000,
  },
  options: {
    encrypt: true,
    trustServerCertificate: true,
    enableArithAbort: true,
  },
  port: 1433,
};

// Don't connect immediately - just export config and sql
// Connection will be established after database is ensured to exist
let poolPromise = null;

const getPoolPromise = async () => {
  if (!poolPromise) {
    poolPromise = new sql.ConnectionPool(dbConfig).connect();
  }
  return poolPromise;
};

export { sql, getPoolPromise };
