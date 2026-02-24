const db = require('./db');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

async function check() {
    console.log('--- Active Database Configuration ---');
    console.log('DB_TYPE from .env:', process.env.DB_TYPE);
    console.log('DB_HOST:', process.env.DB_HOST);
    console.log('DB_USER:', process.env.DB_USER);
    console.log('DB_NAME:', process.env.DB_NAME);

    try {
        // The wrapper in db.js handles the connection
        // We can check the internal state if we modify db.js or just perform a query
        const [rows] = await db.execute('SELECT 1 as connection_test');
        console.log('✅ Database query successful.');

        // Try to determine the mode by checking if we are using Postgres or SQLite/MySQL
        // Based on db.js, it logs "✅ PostgreSQL connected" or "✅ MySQL connected" or "✅ SQLite connected"
    } catch (err) {
        console.error('❌ Database query failed:', err.message);
    }
}

check();
