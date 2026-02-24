const db = require('./db');
async function audit() {
    try {
        const [rows] = await db.execute('SELECT id, username, email FROM users');
        console.log('Current Users:', rows);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
audit();
