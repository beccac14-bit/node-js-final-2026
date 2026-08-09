const { EntitySchema } = require('typeorm')

module.exports = new EntitySchema({
  name: 'Credit_package',
  tableName: 'CREDIT_PACKAGE',
  columns: {
    id: { 
        primary: true,
        type: 'uuid',
        generated: 'uuid',
        nullable: false },
    name: { 
        type: 'varchar',
        length: 50,
        nullable: false,
        unique: true },
    credit_amount: {
        type: 'integer',
        nullable: false
    },
    price: {
        type: 'integer',
        nullable: false
    },
    createdAt: {
        type: 'timestamp',
        createDate: true,
        nullable: false,
    },
    updatedAt: {
        type: 'timestamp',
        updateDate: true,
        nullable: false,
    },
        },
})
