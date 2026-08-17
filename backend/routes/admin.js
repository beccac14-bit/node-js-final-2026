const express = require('express');
const router = express.Router();

const adminController = require('../controllers/adminController');
const verifyToken = require('../middlewares/verifyToken');


router.get('/', verifyToken, adminController.getCoachProfile);
router.put('/', verifyToken, adminController.putCoachProfile);
router.get('/courses', verifyToken, adminController.getCoachCourses);
router.post('/courses', verifyToken, adminController.postCoachCourses);
router.post('/:userId', adminController.postAdminCoaches);
router.get('/courses/:courseId', verifyToken, adminController.getCoachSpecificCourse);
router.put('/courses/:courseId', verifyToken, adminController.putCoachSpecificCourse);





 

module.exports = router;
