
const mongoose = require('mongoose');
require('dotenv').config();

async function listDatabases() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const admin = mongoose.connection.db.admin();
        const dbs = await admin.listDatabases();
        console.log('Databases in cluster:', dbs.databases.map(db => db.name));
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

listDatabases();
