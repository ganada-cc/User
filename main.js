//connect database
require('dotenv').config({ path: './config/database.env' });
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
const port = process.env.PORT || 3000,
    express = require("express"),
    cors = require("cors")
    app = express(),
    fs = require("fs"),
    layouts = require("express-ejs-layouts"),
    usersRouter = require('./routes/usersRoute'),
    sanitizeHtml = require('sanitize-html');

const cookieParser = require('cookie-parser');

app.set("view engine", "ejs");

app.use(express.static("public/"));
app.use('/uploads',express.static("uploads/"));
app.use(layouts);
// app.use(express.urlencoded());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

//라우터 등록
app.use('/users', usersRouter);

// 로그인
app.get("/", (req,res) => {
    res.render("users/login");
});


// 헬스 체크 라우트
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

app.get('/ready', async (req, res) => {
  try {
    const conn = await pool.getConnection();
    await conn.query('SELECT 1');
    conn.release();
    res.status(200).send('Ready');
  } catch (err) {
    res.status(500).send('DB Not Ready');
  }
});

app.listen(port, () => {
  const dir = "./uploads";
  if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
  }
  console.log(`서버 실행 중6 on port ${port}`);
});