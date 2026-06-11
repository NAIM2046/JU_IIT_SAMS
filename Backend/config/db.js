const { MongoClient } = require('mongodb');
require('dotenv').config();

const client = new MongoClient(`mongodb+srv://20223656652naim_db_user:mqohGnd9bk7tNmgh@cluster0.zgd1dpt.mongodb.net/?appName=Cluster0`);
let db;

const connectDB = async () => {
  await client.connect();
  db = client.db('JU_IIT');
  console.log('✅ MongoDB Connected');
};

const getDB = () => db;

module.exports = { connectDB, getDB };
