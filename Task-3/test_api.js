const axios = require('axios');

async function testRegister() {
    try {
        const response = await axios.post('http://localhost:5000/api/auth/register', {
            username: 'testuser_test',
            email: 'test_test@example.com',
            password: 'password123'
        });
        console.log('SUCCESS:', response.data);
    } catch (err) {
        console.log('FAILURE:', err.response?.status, err.response?.data);
    }
}

testRegister();
