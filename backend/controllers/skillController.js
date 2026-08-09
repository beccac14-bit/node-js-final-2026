const dataSource = require('../config/data-source');
const skill = require('../entities/skill');
const skillRepository = dataSource.getRepository('Skill');

// GET /api/coaches/skill 取得教練技能列表
const getSkills = async (req, res) => {
  
  const skills = await skillRepository.find(); // 等於 GET

  res.status(200).json({
    status: 'success',
    data: skills,
  });
};

// POST /api/coaches/skill 新增教練技能
const postSkills = async (req, res) => {
  
  // 1. 檢查是否有重複
  const { name } = req.body;
  const existingSkill = await skillRepository.findOneBy({ name });

  if (existingSkill) {
    return res.status(409).json({
      status: 'failed',
      message: '資料重複',
    });
  }  
  
  // 2. 無重複，新增技能
  const newSkill = skillRepository.create({ name: req.body.name }); // 要傳進去物件而非字串，和 enities 定義的相同
  const savedSkill = await skillRepository.save(newSkill); 
  // create 完（把一個普通物件「轉型」成 TypeORM 認得的 Entity 實例）後要 save，資料才會真正存入

  res.status(200).json({
    status: 'success',
    data: savedSkill,
  });
};

// DELETE /api/coaches/skill/{skillId} 刪除教練技能
  // 使用軟刪除

const deleteSkills = async (req, res) => {
  
  // 1. 檢查有無此 id
  const { skillId } = req.params;
  const existingSkill = await skillRepository.findOneBy({ id: skillId });

  if ( !existingSkill ) {
    return res.status(400).json({
      status: 'failed',
      message: 'ID錯誤',
    });
  }  
  
  // 2. 無重複，新增技能

  await skillRepository.softDelete( skillId );
  const softDeletedSkill = await skillRepository.findOne({
    where: { id: skillId },
    withDeleted: true,
  });

  res.status(200).json({
    status: 'success',
    data: { "raw": [], 
      "affected": 1
    },
  });
} 

module.exports = {
  getSkills,
  postSkills,
  deleteSkills
};