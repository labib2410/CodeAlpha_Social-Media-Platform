const mysql = require('mysql2/promise');

let connection;

const connectDB = async () => {
    try {
        connection = await mysql.createConnection({
            host: '127.0.0.1',
            user: 'root',
            password: '',
            database: 'socialmediaapp'
        });

        console.log('✅ Connected to MySQL database');
    } catch (err) {
        console.error('❌ Database connection failed:', err);
    }
};

module.exports = connectDB;
module.exports.getConnection = () => connection;
