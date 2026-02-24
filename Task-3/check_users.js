const db = require('./server/db');

async function checkUsers() {
    console.log('Checking registered users (Active DB)...');
    try {
        const [rows] = await db.execute('SELECT id, username, email FROM users');
        if (rows.length === 0) {
            console.log('No users found in the database.');
        } else {
            console.log('Registered Users:');
            rows.forEach((row) => {
                console.log(`- ID: ${row.id}, Username: ${row.username}, Email: ${row.email}`);
            });
        }
        process.exit(0);
    } catch (err) {
        console.error('Error reading users:', err.message);
        process.exit(1);
    }
}

checkUsers();
