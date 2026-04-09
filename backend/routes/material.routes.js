const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const { authenticateJWT, restrictTo } = require('../middleware/authMiddleware');
const identifyTenant = require('../middleware/tenantMiddleware');
const materialController = require('../controllers/material.controller');

const router = express.Router();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: { 
    folder: 'academy-os/materials', 
    resource_type: 'auto' 
  }
});

const upload = multer({ storage });

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
