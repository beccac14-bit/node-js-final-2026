const { EntitySchema } = require('typeorm')

module.exports = new EntitySchema({
  name: 'Course',
  tableName: 'COURSE',
  columns: {
     id: { 
          primary: true,
          type: 'uuid',
          generated: 'uuid',
          nullable: false },
     coach_id: { 
          type: 'uuid',
          nullable: false },
     skill_id: { 
          type: 'uuid',
          nullable: false }, 
     name: { 
          type: 'varchar',
          length: 100,
          nullable: false },
     description: { 
          type: 'text',
         nullable: false },             
     start_at: { 
          type: 'timestamp',
         nullable: false },
     end_at: { 
          type: 'timestamp',
         nullable: false },
     max_participants: { 
          type: 'integer',
         nullable: false },    
     meeting_url: { 
          type: 'varchar',
          length: 2048,
          nullable: true },
     created_at: { 
          type: 'timestamp',
         createDate: true,
          nullable: false },
     updated_at: { 
          type: 'timestamp',
         updateDate: true,
          nullable: false }
     }
  ,
  // 關聯寫在 relations
  relations: {
    coach: {
      target: 'Coach',                    // 指向哪個 entity（用它的 name）
      type: 'many-to-one',              
      joinColumn: { name: 'coach_id' },   // 資料庫實際的外來鍵欄位名
    },
    skill: {
      target: 'Skill',
      type: 'many-to-one',
      joinColumn: { name: 'skill_id' },
    },
  },
})
