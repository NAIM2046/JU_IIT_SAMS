const { MongoClient } = require('mongodb');
require('dotenv').config();

const client = new MongoClient(`mongodb+srv://iedujuiedu:0HpUbnU3LAAQWmo7@cluster0.jzegk54.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`);
let db;

const connectDB = async () => {
  await client.connect();
  db = client.db('schoolManagement');
  console.log('✅ MongoDB Connected');
};

const getDB = () => db;

module.exports = { connectDB, getDB };
