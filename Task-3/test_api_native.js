const http = require('http');

const data = JSON.stringify({
    username: 'test_native_user',
    email: 'test_native@example.com',
    password: 'password123'
});

const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/auth/register',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = http.request(options, (res) => {
    let responseBody = '';
    res.on('data', (chunk) => responseBody += chunk);
    res.on('end', () => {
        console.log('STATUS:', res.statusCode);
        console.log('BODY:', responseBody);
    });
});

req.on('error', (err) => {
    console.error('ERROR:', err.message);
});

req.write(data);
req.end();
