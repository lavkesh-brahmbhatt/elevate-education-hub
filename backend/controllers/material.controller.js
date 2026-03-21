const Material = require('../models/Material');
const path = require('path');
const fs = require('fs');

// Ensure the upload directory exists
const UPLOAD_DIR = path.join(__dirname, '../uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

exports.uploadMaterial = async (req, res) => {
    try {
        console.log("Upload attempt:", req.body);
        if (!req.file) {
            console.error("No file in request");
            return res.status(400).json({ error: "No file uploaded" });
        }

        const { title, className, subject } = req.body;
        const tenantId = req.tenantId; 
        const userId = req.user.userId;
        const role = req.user.role;

        console.log("User Info:", { userId, role, tenantId });

        // Construct fileUrl: e.g. /uploads/filename
        const fileUrl = `/uploads/${req.file.filename}`;

        const material = new Material({
            title,
            fileUrl,
            uploadedBy: userId, 
            role,
            className,
            subject,
            tenantId
        });

        await material.save();
        console.log("Material saved successfully");
        res.status(201).json(material);
    } catch (err) {
        console.error("Upload error details:", err);
        res.status(500).json({ error: err.message });
    }
};

exports.getMaterials = async (req, res) => {
    try {
        const { className, subject } = req.query;
        let query = { tenantId: req.tenantId }; // from identifyTenant middleware

        if (className) query.className = className;
        if (subject) query.subject = subject;

        const materials = await Material.find(query).sort({ createdAt: -1 });
        res.json(materials);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.deleteMaterial = async (req, res) => {
    try {
        // Only Admin or the uploader can delete
        const material = await Material.findOne({ _id: req.params.id, tenantId: req.tenantId });
        if (!material) return res.status(404).json({ message: 'Material not found' });

        // Admin or same owner!
        if (req.user.role !== 'ADMIN' && material.uploadedBy.toString() !== req.user.userId.toString()) {
            return res.status(403).json({ message: "Access denied." });
        }

        // Remove from DB
        await Material.deleteOne({ _id: req.params.id });

        // Remove from File System
        const filePath = path.join(__dirname, '../', material.fileUrl);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        res.json({ message: 'Deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};
