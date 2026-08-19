const express = require('express');
const router = express.Router();

const coachController = require('../controllers/coachController');

router.get('/', coachController.getCoachesList);
router.get('/:coachId', coachController.getSpecificCoach);
router.get('/:coachId/courses', coachController.getSpecificCoachCourseList);

module.exports = router;
