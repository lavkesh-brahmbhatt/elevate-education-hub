const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analytics.controller');
const identifyTenant = require('../middleware/tenantMiddleware');

const { authenticateJWT, restrictTo } = require('../middleware/authMiddleware');

// Lock down analytics for Admins only
router.get('/class-performance', restrictTo('ADMIN'), analyticsController.getClassPerformance);
router.get('/top-students', restrictTo('ADMIN'), analyticsController.getTopStudents);
router.get('/subject-performance', restrictTo('ADMIN'), analyticsController.getSubjectPerformance);
router.get('/pass-fail', restrictTo('ADMIN'), analyticsController.getPassFailStats);
router.get('/summary', restrictTo('ADMIN'), analyticsController.getSummaryStats);

module.exports = router;
