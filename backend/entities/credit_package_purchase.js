const { EntitySchema } = require('typeorm');

module.exports = new EntitySchema({
  name: 'CreditPackagePurchase',
  tableName: 'CREDIT_PACKAGE_PURCHASE',
  columns: {
    id: {
      primary: true,
      type: 'uuid',
      generated: 'uuid',
      nullable: false,
    },
    user_id: {
      type: 'uuid',
      nullable: false,
    },
    package_id: {
      type: 'uuid',
      nullable: false,
    },
    buy_at: {
      type: 'timestamp',
      createDate: true,
      nullable: false,
    },
  },
  relations: {
    user: {
      target: 'User',
      type: 'many-to-one',
      joinColumn: { name: 'user_id' },
    },
    package: {
      target: 'Credit_package',
      type: 'many-to-one',
      joinColumn: { name: 'package_id' },
    },
  },
});
