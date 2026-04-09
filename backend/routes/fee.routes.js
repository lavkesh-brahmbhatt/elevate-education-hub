const express = require('express');
const { authenticateJWT, restrictTo } = require('../middleware/authMiddleware');
const identifyTenant = require('../middleware/tenantMiddleware');
const feeController = require('../controllers/fee.controller');

const router = express.Router();

// GET all fees (with role-based filter in controller)
router.get('/', authenticateJWT, identifyTenant, feeController.getFees);

// GET stats / summary (ADMIN only)
router.get('/summary', authenticateJWT, identifyTenant, restrictTo('ADMIN'), feeController.getFeeSummary);

// ADMIN: create/update fee
router.post('/', authenticateJWT, identifyTenant, restrictTo('ADMIN'), feeController.createFee);
router.put('/:id', authenticateJWT, identifyTenant, restrictTo('ADMIN'), feeController.updateFee);

module.exports = router;
