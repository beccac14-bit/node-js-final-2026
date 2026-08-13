const express = require('express');
const router = express.Router();

const userPackageController = require('../controllers/userController');
// 待改 const checkPackageBody = require('../middlewares/checkPackageBody');


// router.get('/', creditPackageController.getPackages);
router.post('/', userController.postUsersSignup);
router.post('/', userController.postUsersLogin);
// router.delete('/:creditPackageId', checkPackageId, creditPackageController.deletePackages);

 

module.exports = router;
