const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');
const verifyToken = require('../middlewares/verifyToken');

router.post('/signup', userController.postUsersSignup);
router.post('/login', userController.postUsersLogin);
router.get('/profile', verifyToken, userController.getUsersProfile);
router.put('/profile', verifyToken, userController.putUsersProfile);
router.put('/password', verifyToken, userController.putUsersPassword);
router.get('/credit-package', verifyToken, userController.getUserCreditPackage);
router.get('/courses', verifyToken, userController.getUserBookedCoursesAndLeftCredits);





 

module.exports = router;
