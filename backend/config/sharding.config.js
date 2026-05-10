import sql from "mssql";
import "dotenv/config";
import HashRing from "hashring";
/* ----------------This is sharding configuration file----------------
 * In a production environment, you would have multiple SQL Server instances (or databases) to distribute the load.
 * This file demonstrates how to set up connection pools for each shard and a simple consistent hashing mechanism to route requests.
 * For simplicity, we are using the first character of the short code to determine the shard, but in a real application, you would use a more robust hashing strategy.
 * 
 * Note: Ensure that each shard (database) has the same schema for the URLs table.
 * 
 * In this example, we have two shards: UrlShard_0 and UrlShard_1. You can add more shards by updating the shardDatabases array and ensuring they are properly set up in your SQL Server.
 * The getPoolForCode function uses a simple modulo-based distribution to determine which shard to query based on the short code. In a real-world scenario, you might want to use a more sophisticated consistent hashing algorithm to minimize data movement when adding or removing shards.
 * 
 * Remember to update your .env file with the correct database names for each shard.
 
// Template for Shard Configuration
const createConfig = (dbName) => ({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: dbName, // Different database for each shard
  server: process.env.DB_SERVER,
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
  port: 1433,
});

// Define your Shards (In production, these would be different IP addresses)
const shardDatabases = ["UrlShard_0", "UrlShard_1"];

// Initialize an array of connection pools
const shardPools = shardDatabases.map((dbName) => {
  const config = createConfig(dbName);
  return new sql.ConnectionPool(config)
    .connect()
    .then((pool) => {
      console.log(`Connected to Shard: ${dbName}`);
      return pool;
    })
    .catch((err) => console.error(`Shard ${dbName} Connection Failed:`, err));
});


//  * THE SHARDING LOGIC
//  * Uses Consistent Hashing logic to pick a shard based on the Short Code.
 

const getPoolForCode = async (shortCode) => {
  // Use the ASCII value of the first character to determine the shard index
  // This is a simple modulo-based distribution
  const index = shortCode.charCodeAt(0) % shardPools.length;
  return await shardPools[index];
};
*/

/* From the above template, 
we have implemented a simple sharding mechanism based on the first character of the short code. 
In a real-world application, you would want to use a more robust hashing strategy to 
ensure an even distribution of data across shards and minimize the impact of adding or removing shards. 
The getPoolForCode function is responsible for determining which shard to query based on the short code, 
and it returns the appropriate connection pool for that shard. Make sure to update your .env file with the 
correct database names for each shard and ensure that each shard has the same schema for the URLs table. */

// Define your Shard Configurations

// This is your working configuration from db.config.js
const baseConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
  options: {
    encrypt: true,
    trustServerCertificate: true,
  },
  port: 1433,
};
const shardConfigs = {
  "shard-0": {
    ...baseConfig,
    database: process.env.DB_NAME,
  },
  "shard-1": {
    ...baseConfig,
    database: process.env.DB_NAME,
  },
};

const ring = new HashRing(Object.keys(shardConfigs));
const pools = {};
Object.keys(shardConfigs).forEach((shardKey) => {
  pools[shardKey] = new sql.ConnectionPool(shardConfigs[shardKey])
    .connect()
    .then((pool) => {
      console.log(` ${shardKey} Connected to Ring`);
      return pool;
    })
    .catch((err) => console.error(` ${shardKey} Connection Failed:`, err));
});
const getPoolForCode = async (shortCode) => {
  const assignedShardKey = ring.get(shortCode); // Finds the closest node on the ring
  return await pools[assignedShardKey];
};

export { getPoolForCode };
