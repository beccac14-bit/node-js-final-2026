const express = require('express');
const router = express.Router();

const skillController = require('../controllers/skillController');
const checkSkillBody = require('../middlewares/checkSkillBody');
const checkSkillId = require('../middlewares/checkSkillId');


router.get('/', skillController.getSkills);
router.post('/', checkSkillBody, skillController.postSkills);
router.delete('/:skillId', checkSkillId, skillController.deleteSkills);



module.exports = router; 