const express = require('express');
const router = express.Router();

const creditPackageController = require('../controllers/creditPackageController');
const checkPackageBody = require('../middlewares/checkPackageBody');
const checkPackageId = require('../middlewares/checkPackageId');


router.get('/', creditPackageController.getPackages);
router.post('/', checkPackageBody, creditPackageController.postPackages);
router.delete('/:creditPackageId', checkPackageId, creditPackageController.deletePackages);

 


module.exports = router;