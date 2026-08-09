const express = require('express');
const router = express.Router();

const skillController = require('../controllers/skillController');
const checkSkillBody = require('../middlewares/checkSkillBody');
const checkSkillIdBody = require('../middlewares/checkSkillIdBody');


router.get('/', skillController.getSkills);
router.post('/', checkSkillBody, skillController.postSkills);
router.delete('/:skillId', checkSkillIdBody, skillController.deleteSkills);



module.exports = router; 