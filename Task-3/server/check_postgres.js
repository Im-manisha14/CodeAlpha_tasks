const { Client } = require('pg');
require('dotenv').config();

async function checkPostgres() {
    // Try connecting to 'postgres' database first to see if server is alive
    const client = new Client({
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASS,
        database: 'postgres',
    });

    try {
        await client.connect();
        console.log('✅ Connected to PostgreSQL server (postgres database).');

        const res = await client.query("SELECT datname FROM pg_database WHERE datname = 'task2codealpha'");
        if (res.rows.length > 0) {
            console.log('✅ Found database "task2codealpha".');
        } else {
            console.log('❌ Database "task2codealpha" NOT found.');
            console.log('Attempting to create "task2codealpha"...');
            await client.query('CREATE DATABASE task2codealpha');
            console.log('✅ Created "task2codealpha" successfully.');
        }
        await client.end();
        process.exit(0);
    } catch (err) {
        console.error('❌ Failed to connect to PostgreSQL server:', err.message);
        await client.end().catch(() => { });
        process.exit(1);
    }
}

checkPostgres();
