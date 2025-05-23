//connect database
require('dotenv').config({path: "./config/database.env"});
const mysql = require('mysql2/promise');
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PW,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    waitForConnections: true,
    insecureAuth: true,
    charset: 'utf8mb4'
});

module.exports = pool;  //모듈로 내보내기

// 기본 설정
const port = 3000,
    express = require("express"),
    cors = require("cors")
    app = express(),
    fs = require("fs"),
    layouts = require("express-ejs-layouts"),
    //calendarRouter = require('./routes/calendarRoute'),
    usersRouter = require('./routes/usersRoute'),
    sanitizeHtml = require('sanitize-html'),
    puppeteer = require('puppeteer');

const cookieParser = require('cookie-parser');

app.set("view engine", "ejs");

app.use(express.static("public/"));
app.use('/uploads',express.static("uploads/"));
app.use(layouts);
app.use(express.urlencoded());
app.use(express.json());
app.use(cookieParser());

//라우터 등록
//app.use('/calendar', calendarRouter);
app.use('/users', usersRouter);

// root - 로그인
app.get("/", (req,res) => {
    res.render("users/login");
});

app.listen(port,() => {
  const dir = "./uploads";
  if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
  }
  console.log("서버 실행 중");
  }
);