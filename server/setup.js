const db = require('./db');
const fs = require('fs');
const path = require('path');

const setupDatabase = async () => {
    try {
        const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
        const statements = schema.split(';').filter(s => s.trim());

        console.log("Starting database setup...");
        for (let statement of statements) {
            if (statement.trim()) {
                await db.execute(statement);
            }
        }
        console.log("✅ Database initialized successfully.");
    } catch (err) {
        console.error("❌ Setup failed:", err);
    }
};

setupDatabase();
