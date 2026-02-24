const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'server', 'database.sqlite');
const db = new sqlite3.Database(dbPath);

console.log('Checking registered users...');

db.all('SELECT id, username, email FROM users', [], (err, rows) => {
    if (err) {
        console.error('Error reading users:', err.message);
    } else {
        if (rows.length === 0) {
            console.log('No users found in the database.');
        } else {
            console.log('Registered Users:');
            rows.forEach((row) => {
                console.log(`- ID: ${row.id}, Username: ${row.username}, Email: ${row.email}`);
            });
        }
    }
    db.close();
});
