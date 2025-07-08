const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/db.js');
const authRoutes = require('./routes/authRoutes.js');
const scheduleRoutes = require('./routes/scheduleRoutes.js');
const classAndSubRoutes = require('./routes/classAndSubRoutes.js'); // Assuming you have this route defined
const attendanceRoutes = require('./routes/attendanceRoutes.js');
const performanceRoutes = require('./routes/PerformanceRoute.js');
const classHistoryRoutes = require('./routes/classHistoryRoutes'); // Assuming you have this route defined
const startCronJob = require('./cron/autoInsertPendingClasses.js');
const noticeRoutes = require('./routes/NoticeRoutes.js');
const examRoutes = require('./routes/examRoutes.js');
const messageRoute = require('./routes/messageRoutes.js');
const InCourseMarkRoutes = require('./routes/InCourseMarkRoutes.js')
const { startCronJobUpdata } = require("./cron/Monthly_update.js");
const http = require("http");
const { Server } = require("socket.io");

require('dotenv').config();


const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*"
  }
});


const onlineUsers = {};

io.on("connection", (socket) => {
  console.log("user connected", socket.id);

  socket.on("user-connected", (userId) => {
    console.log("user id", userId);

    if (!userId) {
      console.log("Invalid UserId received.");
      return;
    }
    onlineUsers[userId] = socket.id;
    console.log("onlineUsers", onlineUsers);
    io.emit("online-users", Object.keys(onlineUsers));
  })


  socket.on("join-room", (roomId) => {
    console.log("roomId from Join room", roomId);
    socket.join(roomId);
  });


  socket.on("send-message", ({ message, roomId }) => {
    // console.log("messaage from send message", message);
    socket.to(roomId).emit("receive-message", message);
  })

  socket.on("disconnect", () => {
    console.log("user disconnected", socket.id);
    const userId = Object.keys(onlineUsers).find(key => onlineUsers[key] === socket.id);
    if (userId) {
      delete onlineUsers[userId];
    }

    io.emit("online-users", Object.keys(onlineUsers));
  })
});


const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello World!');
});

app.use('/uploads', express.static('uploads'));


app.use('/api/auth', authRoutes);
app.use('/api', scheduleRoutes);
app.use('/api', classAndSubRoutes); // Assuming you have classAndSubRoutes defined
app.use('/api/attendance', attendanceRoutes);
app.use('/api/performance', performanceRoutes);
app.use('/api/incoursemark' ,InCourseMarkRoutes ) ;
app.use('/api/classHistory', classHistoryRoutes);
app.use('/api', noticeRoutes); // Assuming you have classHistroyRoute defined
app.use('/api/performance', performanceRoutes);
app.use('/api/exam', examRoutes);
app.use('/api/message', messageRoute);


connectDB().then(() => {
  server.listen(port, () => {
    console.log(`✅ Server running at http://localhost:${port}`);
  });
  startCronJob(); // Start the cron job
  startCronJobUpdata(); // Start the monthly update cron job
});
