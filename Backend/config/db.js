const { MongoClient } = require('mongodb');
require('dotenv').config();

const client = new MongoClient(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hotdvau.mongodb.net/?appName=Cluster0`);
let db;

const connectDB = async () => {
  await client.connect();
  db = client.db('schoolManagement');
  console.log('✅ MongoDB Connected');
};

const getDB = () => db;

module.exports = { connectDB, getDB };
