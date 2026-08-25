const { EntitySchema } = require('typeorm')

module.exports = new EntitySchema({
  name: 'Coach',
  tableName: 'COACH',
  columns: {
    id: { 
      primary: true,
      type: 'uuid',
      generated: 'uuid',
      nullable: false },
    user_id: { 
      type: "uuid", 
      nullable: false, 
      unique: true },
    experience_years: { 
      type: 'integer',
      nullable: false },
    description: { 
      type: 'text',
      nullable: false },    
    profile_image_url: { 
      type: "varchar", 
      length: 2048, 
      nullable: true },
    created_at: { 
      type: 'timestamp',
      createDate: true,
      nullable: false },
    updated_at: { 
      type: 'timestamp',
      updateDate: true,
      nullable: false },
     }
  ,
  // 關聯寫在 relations
  relations: {
    user: {
      target: 'User',                    // 指向哪個 entity（用它的 name，這裡是大寫 User）
      type: 'one-to-one',               
      joinColumn: { name: 'user_id' },   // 資料庫實際的外來鍵欄位名
    },
    CoachLinkSkill: {
      target: 'CoachLinkSkill',
      type: 'one-to-many',
      inverseSide: 'coach'
    }
  },
})
