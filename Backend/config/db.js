const { MongoClient } = require('mongodb');
require('dotenv').config();

const client = new MongoClient(`mongodb+srv://${process.env.DB_USER2}:${process.env.DB_PASS2}@cluster0.rxtq2m7.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`);
let db;

const connectDB = async () => {
  await client.connect();
  db = client.db('JU_IIT');
  console.log('✅ MongoDB Connected');
};

const getDB = () => db;

module.exports = { connectDB, getDB };
