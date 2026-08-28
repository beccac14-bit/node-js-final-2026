const express = require('express');
const cors = require('cors');
const app = express();

const AppDataSource = require('./config/data-source');
const errorHandler = require('./middlewares/errorHandler');
const skillRouter = require('./routes/skill');
const packageRouter = require('./routes/credit_package');
const userRouter = require('./routes/user');
const adminRouter = require('./routes/admin');
const coachRouter = require('./routes/coach');
const courseRouter = require('./routes/course');

app.use(cors());
app.use(express.json());

// GET 取得教練技能列表、POST 新增教練技能、DELETE 刪除教練技能
app.use('/api/coaches/skill', skillRouter);

// GET 取得購買方案列表、POST 新增購買方案、DELETE 刪除購買方案、POST 購買堂數方案（需登入）
app.use('/api/credit-package', packageRouter);

// POST 註冊新會員帳號、POST 會員登入、GET 取得個人資料、PUT 更新本人的暱稱、PUT 修改本人的登入密碼
// GET 取得本人的購買方案紀錄、GET 取得本人的課表與剩餘堂數
app.use('/api/users', userRouter);

// POST 將指定使用者升級為教練、GET 取得教練本人的後台資料（含技能清單）、PUT 更新教練本人的後台資料（含整批更換技能）
// GET 取得教練本人開設的全部課程列表、POST 教練開設新課程
// GET 取得單一課程詳情、PUT 更新單一課程
// GET 取得教練本人指定月份的營收統計
app.use('/api/admin/coaches', adminRouter);

// GET 取得指定教練「未結束」的課程列表（公開，不用登入）
// GET 取得單一教練詳細資料（公開，不用登入）、GET 取得教練分頁列表 /api/coaches（公開，不用登入）
app.use('/api/coaches', coachRouter);

// GET 取得全站「進行中」的課程列表（公開，不用登入）、POST 報名課程
// DELETE 取消課程報名（軟刪除：紀錄保留、標記取消、堂數自動歸還）
app.use('/api/courses', courseRouter);





app.get('/healthcheck', (req, res) => {
  res.type('text/plain').send('OK');
});

app.use((req, res, next) => {
  res.status(404).json({
    status: 'error',
    message: '找不到路由',
  })
  return;
});


app.use(errorHandler);

const port = process.env.PORT || 8080;

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
