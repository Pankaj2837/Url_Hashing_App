require('dotenv').config();
const sql = require('mssql');

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    server: process.env.DB_SERVER,
    options: {
        encrypt: false, 
        trustServerCertificate: true 
    }
};

async function runTest() {
    try {
        console.log("Attempting to connect to SQL Server...");
        const pool = await sql.connect(config);
        console.log("✅ Connection Successful!");

        const result = await pool.request().query("SELECT DB_NAME() AS CurrentDB, GETDATE() AS ServerTime");
        console.table(result.recordset);

        await pool.close();
        console.log("Connection closed safely.");
    } catch (err) {
        console.error("❌ Connection Failed!");
        console.error("Error Message:", err.message);
    }
}

runTest();