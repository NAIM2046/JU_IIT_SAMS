const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/db.js');
const authRoutes = require('./routes/authRoutes.js');
const scheduleRoutes = require('./routes/scheduleRoutes.js');
const classAndSubRoutes = require('./routes/classAndSubRoutes.js'); // Assuming you have this route defined
const attendanceRoutes = require('./routes/attendanceRoutes.js');
const performanceRoutes = require('./routes/PerformanceRoute.js') ;
const classHistoryRoutes = require('./routes/classHistoryRoutes') ; // Assuming you have this route defined
const startCronJob = require('./cron/autoInsertPendingClasses.js'); 
const noticeRoutes = require('./routes/NoticeRoutes.js');
const examRoutes = require('./routes/examRoutes.js');
const{ startCronJobUpdata} = require("./cron/Monthly_update.js") ;
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World!');
});
app.use('/uploads', express.static('uploads'));


app.use('/api/auth', authRoutes);
app.use('/api', scheduleRoutes);
app.use('/api' , classAndSubRoutes) ; // Assuming you have classAndSubRoutes defined
app.use('/api/attendance', attendanceRoutes);
app.use('/api/performance' , performanceRoutes) ;
app.use ('/api/classHistory' , classHistoryRoutes) ;
app.use('/api', noticeRoutes); // Assuming you have classHistroyRoute defined
app.use('/api/performance' , performanceRoutes);
app.use('/api/exam', examRoutes);


connectDB().then(() => {
  app.listen(port, () => {
    console.log(`✅ Server running at http://localhost:${port}`);
  });
  startCronJob(); // Start the cron job
  startCronJobUpdata(); // Start the monthly update cron job
});
