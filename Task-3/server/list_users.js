const db = require('./db');

async function listUsers() {
    try {
        const [rows] = await db.execute('SELECT id, username, email FROM users');
        if (rows.length === 0) {
            console.log('No users found.');
        } else {
            console.log('Registered Users:');
            rows.forEach(user => {
                console.log(`- Username: ${user.username}, Email: ${user.email}`);
            });
        }
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

listUsers();
