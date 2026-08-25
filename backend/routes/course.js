const express = require('express');
const router = express.Router();

const courseController = require('../controllers/courseController');
const verifyToken = require('../middlewares/verifyToken');

router.get('/', courseController.getCourseList);
router.post('/:courseId', verifyToken, courseController.postCourse);
router.delete('/:courseId', verifyToken, courseController.cancellBookedCourse);

module.exports = router;
