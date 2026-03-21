const express = require('express');
const { authenticateJWT } = require('../middleware/authMiddleware');
const identifyTenant = require('../middleware/tenantMiddleware');
const complaintController = require('../controllers/complaint.controller');

const router = express.Router();

// ALL roles can create and see their complaints
router.post('/', authenticateJWT, identifyTenant, complaintController.createComplaint);
router.get('/', authenticateJWT, identifyTenant, complaintController.getComplaints);

// ONLY Admin/Teacher can resolve
const { restrictTo } = require('../middleware/authMiddleware');
router.put('/:id/resolve', authenticateJWT, identifyTenant, restrictTo('ADMIN', 'TEACHER'), complaintController.resolveComplaint);

module.exports = router;
