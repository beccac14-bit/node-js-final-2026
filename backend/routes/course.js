const express = require('express');
const router = express.Router();

const courseController = require('../controllers/courseController');

router.get('/', adminController.getCourseList);

module.exports = router;
