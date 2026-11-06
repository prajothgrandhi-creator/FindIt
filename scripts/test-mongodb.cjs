const { MongoClient } = require("mongodb");

const client = new MongoClient(process.env.MONGODB_URI);

async function testConnection() {
  try {
    await client.connect();

    const db = client.db(process.env.MONGODB_DB_NAME || "findit");
    const result = await db.command({ ping: 1 });

    console.log("MongoDB Atlas ping successful:", result.ok === 1);
    console.log("Database:", db.databaseName);
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exitCode = 1;
  } finally {
    await client.close();
  }
}

testConnection();
