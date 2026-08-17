require('dotenv').config();
const { DataSource } = require('typeorm');
const skill = require('../entities/skill');
const creditPackage = require('../entities/credit_package');
const user = require('../entities/user');
const coach = require('../entities/coach');
const coach_link_skill = require('../entities/coach_link_skill');
const course = require('../entities/course');
const course_booking = require('../entities/course_booking');


const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  synchronize: process.env.DB_SYNCHRONIZE === 'true',
    // .env 裡的 DB_SYNCHRONIZE=true 讀進來是字串 "true"，要用 === 'true' 轉成布林值。
    // 這個設定打開後，TypeORM 會根據我們寫的 Entity 自動建立資料表，剛好對應作業要求的「啟動時要把空資料庫的表建好」
  ssl: process.env.DB_ENABLE_SSL === 'true',
  entities: [ skill, creditPackage, user, coach, coach_link_skill, course, course_booking ],
});

module.exports = dataSource;