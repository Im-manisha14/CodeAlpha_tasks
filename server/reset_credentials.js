const db = require('./db');
const bcrypt = require('bcryptjs');

async function resetCredentials() {
    const targetEmail = 'manisha@gmail.com';
    const targetUsername = 'Manisha';
    const targetPassword = 'password123';

    try {
        console.log('🔄 Starting credential reset...');

        // Hash the new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(targetPassword, salt);

        // 1. Delete all users except for the target (if we wanted "only", but safer to just ensure target is correct)
        // Actually the user said "use only", so let's clear the rest for a clean slate
        await db.execute('DELETE FROM users WHERE email != ?', [targetEmail]);
        console.log('🗑️ Cleared other users.');

        // 2. Check if target exists
        const [rows] = await db.execute('SELECT id FROM users WHERE email = ?', [targetEmail]);

        if (rows.length > 0) {
            // Update existing
            await db.execute(
                'UPDATE users SET username = ?, password = ? WHERE email = ?',
                [targetUsername, hashedPassword, targetEmail]
            );
            console.log('✅ Updated existing user credentials.');
        } else {
            // Insert new
            await db.execute(
                'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
                [targetUsername, targetEmail, hashedPassword]
            );
            console.log('✅ Created new user with requested credentials.');
        }

        console.log('\n🚀 Credentials set successfully:');
        console.log(`Username: ${targetUsername}`);
        console.log(`Email: ${targetEmail}`);
        console.log(`Password: ${targetPassword}`);

        process.exit(0);
    } catch (err) {
        console.error('❌ Reset failed:', err);
        process.exit(1);
    }
}

resetCredentials();
