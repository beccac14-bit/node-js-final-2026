const express = require('express');
const cors = require('cors');
const app = express();

const AppDataSource = require('./config/data-source');
const errorHandler = require('./middlewares/errorHandler');
const skillRouter = require('./routes/skill');
const packageRouter = require('./routes/credit_package');
const userRouter = require('./routes/user');

app.use(cors());
app.use(express.json());

// GET 取得教練技能列表、POST 新增教練技能、DELETE 刪除教練技能
app.use('/api/coaches/skill', skillRouter);

// GET 取得購買方案列表、POST 新增購買方案、DELETE 刪除購買方案
app.use('/api/credit-package', packageRouter);

// POST 註冊新會員帳號、會員登入、GET 取得個人資料、PUT 更新本人的暱稱、PUT 修改本人的登入密碼
app.use('/api/users', userRouter);







app.get('/healthcheck', (req, res) => {
  res.type('text/plain').send('OK');
});


app.use(errorHandler);

const port = process.env.PORT;

AppDataSource.initialize()
  .then(() => {
    console.log('資料庫連線成功');
    app.listen(port, () => {
      console.log(`Server 啟動於 http://localhost:${port}`);
    });
  })
  .catch((err) => {
    console.error('資料庫連線失敗，服務不啟動：', err.message);
    process.exit(1);
  });