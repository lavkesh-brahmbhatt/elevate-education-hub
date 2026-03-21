const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const { authenticateJWT, restrictTo } = require('../middleware/authMiddleware');
const identifyTenant = require('../middleware/tenantMiddleware');
const materialController = require('../controllers/material.controller');

const router = express.Router();

// MULTER SETUP
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1e9) + path.extname(file.originalname);
    cb(null, uniqueName);
  }
});

const upload = multer({ storage: storage });

// ROUTES
// 1. Upload Material (Only Admin or Teacher)
router.post('/upload', 
  authenticateJWT, 
  identifyTenant, 
  restrictTo('ADMIN', 'TEACHER'), 
  upload.single('file'), 
  materialController.uploadMaterial
);

// 2. Get All Materials (For all authenticated users of that tenant)
router.get('/', authenticateJWT, identifyTenant, materialController.getMaterials);

// 3. Delete Material (Admin or Owner)
router.delete('/:id', authenticateJWT, identifyTenant, restrictTo('ADMIN', 'TEACHER'), materialController.deleteMaterial);

module.exports = router;
