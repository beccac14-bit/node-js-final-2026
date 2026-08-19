const { EntitySchema } = require('typeorm')

module.exports = new EntitySchema({
  name: 'CourseBooking',
  tableName: 'COURSE_BOOKING',
  columns: {
   id: {
      primary: true,
      type: 'uuid',
      generated: 'uuid',
      nullable: false },
   user_id: { 
      type: 'uuid',
      nullable: false },
   course_id:{ 
      type: 'uuid',
      nullable: false },
   booking_at: {
      type: 'timestamp',
      createDate: true,
      name: 'booking_at',
      nullable: false
    },
   cancelled_at: { 
      type: 'timestamp',
      nullable: true }
     }
  ,
  // 關聯寫在 relations
  relations: {
    user: {
      target: 'User',                    // 指向哪個 entity（用它的 name，這裡是大寫 User）
      type: 'many-to-one',               // 站在 Coursebooking 的角度
      joinColumn: { name: 'user_id' },   // 資料庫實際的外來鍵欄位名
    },
    course: {
      target: 'Course',
      type: 'many-to-one',
      joinColumn: { name: 'course_id' },
    },
  },
})
