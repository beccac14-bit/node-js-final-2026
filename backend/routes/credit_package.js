const express = require('express');
const router = express.Router();

const creditPackageController = require('../controllers/creditPackageController');

router.get('/', creditPackageController.getPackages);

module.exports = router;