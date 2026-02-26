
const mongoose = require('mongoose');
require('dotenv').config();

async function checkUser() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const User = mongoose.model('User', new mongoose.Schema({ email: String }));
        const user = await User.findOne({ email: 'bpit@gmail.com' });
        console.log('User exists:', !!user);
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkUser();
