const db = require('./db');
async function clear() {
    try {
        await db.execute('DELETE FROM users WHERE email = ?', ['manisha@gmail.com']);
        console.log('Successfully cleared manisha@gmail.com to allow re-registration.');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
clear();
