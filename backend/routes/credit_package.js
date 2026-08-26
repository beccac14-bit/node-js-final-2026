const express = require('express');
const router = express.Router();

const creditPackageController = require('../controllers/creditPackageController');
const checkPackageBody = require('../middlewares/checkPackageBody');
const checkPackageId = require('../middlewares/checkPackageId');
const verifyToken = require('../middlewares/verifyToken');


router.get('/', creditPackageController.getPackages);
router.post('/', checkPackageBody, creditPackageController.postPackages);
router.delete('/:creditPackageId', checkPackageId, creditPackageController.deletePackages);
router.post('/:creditPackageId', verifyToken, checkPackageId, creditPackageController.userBuyPackage);
 

module.exports = router;
