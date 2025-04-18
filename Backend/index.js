const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/db.js');
const authRoutes = require('./routes/authRoutes.js');
const scheduleRoutes = require('./routes/scheduleRoutes.js');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use('/api/auth', authRoutes);
app.use('/api', scheduleRoutes);

connectDB().then(() => {
  app.listen(port, () => {
    console.log(`✅ Server running at http://localhost:${port}`);
  });
});
