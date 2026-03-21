const express = require('express');
const { authenticateJWT, restrictTo } = require('../middleware/authMiddleware');
const identifyTenant = require('../middleware/tenantMiddleware');
const noticeController = require('../controllers/notice.controller');

const router = express.Router();

// ANY user can see notices
router.get('/', authenticateJWT, identifyTenant, noticeController.getNotices);

// ADMIN and TEACHER can create/delete notices
router.post('/', authenticateJWT, identifyTenant, restrictTo('ADMIN', 'TEACHER'), noticeController.createNotice);
router.delete('/:id', authenticateJWT, identifyTenant, restrictTo('ADMIN', 'TEACHER'), noticeController.deleteNotice);

module.exports = router;
