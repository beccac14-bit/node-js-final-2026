const express = require('express');
const router = express.Router();

const courseController = require('../controllers/courseController');

router.get('/', courseController.getCourseList);

module.exports = router;
