const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkConnection() {
    console.log("--- MySQL Diagnostic ---");
    console.log(`Connecting to: ${process.env.DB_HOST}:${process.env.DB_PORT || 3306}`);
    console.log(`User: ${process.env.DB_USER}`);
    console.log(`Database: ${process.env.DB_NAME}`);

    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASS,
            database: process.env.DB_NAME
        });
        console.log("✅ SUCCESS: Connected to database!");
        await connection.end();
    } catch (err) {
        console.log("❌ FAILURE: Could not connect.");
        console.log("Error Code:", err.code);
        console.log("Message:", err.message);

        if (err.code === 'ECONNREFUSED') {
            console.log("\nTIP: It looks like your database server is NOT running. Please ensure your PostgreSQL (or MySQL) service is STARTED.");
        } else if (err.code === 'ER_BAD_DB_ERROR') {
            console.log("\nTIP: The database exists but the tables might not be created. Try running 'node setup.js'.");
        } else if (err.code === 'ER_ACCESS_DENIED_ERROR') {
            console.log(`\nTIP: Check your credentials in the .env file. Current user in .env: ${process.env.DB_USER}`);
        }
    }
}

checkConnection();
