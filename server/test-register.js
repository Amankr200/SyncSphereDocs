
const axios = require('axios');

async function testRegister() {
    try {
        console.log('Attempting to register user...');
        const res = await axios.post('http://localhost:3001/api/auth/register', {
            name: 'Test Agent',
            email: 'agent' + Date.now() + '@example.com',
            password: 'password123'
        });
        console.log('Registration successful! Token:', res.data.token);
    } catch (err) {
        console.error('Registration failed:');
        if (err.response) {
            console.error('Status:', err.response.status);
            console.error('Data:', JSON.stringify(err.response.data, null, 2));
        } else {
            console.error('Error:', err.message);
        }
    }
}

testRegister();
