import sql from "mssql";

const baseConfig = {
  user: "sa",
  password: "DevShorten@2026!",
  server: "sqlserver", // Docker service name
  port: 1433,
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
  pool: {
    max: 15,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

export const ensureDatabaseExists = async () => {
  const masterConfig = { ...baseConfig, database: "master" };
  let retryCount = 0;
  const maxRetries = 10;

  while (retryCount < maxRetries) {
    try {
      const pool = await sql.connect(masterConfig);
      await pool.request().query(`
                IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'UrlShortenerDB')
                BEGIN
                    CREATE DATABASE UrlShortenerDB;
                END
            `);
      await pool.close();
      console.log("✔ Database 'UrlShortenerDB' ensured.");
      return; // Success
    } catch (err) {
      retryCount++;
      console.log(
        `SQL Server booting... (Attempt ${retryCount}/${maxRetries})`,
      );
      await new Promise((res) => setTimeout(res, 5000)); // Wait 5s
    }
  }
  throw new Error("Could not connect to SQL Server after multiple retries.");
};

export const getAppPool = async () => {
  const appConfig = { ...baseConfig, database: "UrlShortenerDB" };
  return sql.connect(appConfig);
};
