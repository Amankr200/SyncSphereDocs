
const axios = require('axios');

async function testInvalidRegister() {
    try {
        console.log('Attempting to register with short password...');
        const res = await axios.post('http://localhost:3001/api/auth/register', {
            name: 'Short PW',
            email: 'short' + Date.now() + '@example.com',
            password: '123'
        });
        console.log('Success (Unexpected):', res.data);
    } catch (err) {
        console.log('Caught Error:');
        if (err.response) {
            console.log('Status:', err.response.status);
            console.log('Data:', JSON.stringify(err.response.data, null, 2));
        } else {
            console.log('Error Message:', err.message);
        }
    }
}

testInvalidRegister();
