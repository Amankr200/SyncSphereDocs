
const mongoose = require('mongoose');
require('dotenv').config();

async function checkCollections() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to:', mongoose.connection.name);

        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('Collections:', collections.map(c => c.name));

        const User = mongoose.model('User', new mongoose.Schema({ email: String }));
        const userCount = await User.countDocuments();
        console.log('User count:', userCount);

        const Document = mongoose.model('Document', new mongoose.Schema({ title: String }));
        const docCount = await Document.countDocuments();
        console.log('Document count:', docCount);

        if (userCount > 0) {
            const users = await User.find().limit(5);
            console.log('Latest users:', users.map(u => u.email));
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkCollections();
