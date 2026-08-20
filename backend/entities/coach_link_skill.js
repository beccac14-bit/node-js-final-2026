const { EntitySchema } = require('typeorm')

module.exports = new EntitySchema({
  name: 'CoachLinkSkill',
  tableName: 'COACH_LINK_SKILL',
  columns: {
    id: {
      type: 'uuid',
      primary: true,
      nullable: false,
      generated: 'uuid'
    },
    coach_id: {
      type: 'uuid',
      nullable: false
    },
    skill_id: {
      type: 'uuid',
      nullable: false
    },
    created_at: {
      type: 'timestamp',
      createDate: true,
      nullable: false
    }
  },
  uniques: [{
    name: 'coach_link_skill_unique',
    columns: ['coach_id', 'skill_id']
  }],
  relations: {
    coach: {
      target: 'Coach',
      type: 'many-to-one',
      inverseSide: 'CoachLinkSkill',
      joinColumn: {
        name: 'coach_id',
        onDelete: 'CASCADE'
      },
      cascade: false
    },
    skill: {
      target: 'Skill',
      type: 'many-to-one',
      joinColumn: {
        name: 'skill_id',
        onDelete: 'CASCADE'
      },
      cascade: false
    }
  }
})
