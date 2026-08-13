const { EntitySchema } = require('typeorm')

module.exports = new EntitySchema({
  name: 'User',
  tableName: 'USER',
  columns: {
    id: { primary: true,
         type: 'uuid',
          generated: 'uuid',
           nullable: false },
    name: { type: 'varchar',
         length: 100,
          nullable: false },
    email: { type: 'varchar',
            length: 100,
         nullable: false,
           unique: true},
    password: { type: 'varchar',
               length: 225,
         nullable: false },
    role: { type: 'varchar',
           length: 50,
           nullable: false },
    created_at: { type: 'timestamp',
         createDate: true,
          nullable: false },
    updated_at: { type: 'timestamp',
         updateDate: true,
          nullable: false }
     }
  },
})
