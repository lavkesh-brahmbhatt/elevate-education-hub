const mongoose = require('mongoose');

const tenantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  subdomain: { type: String, required: true, unique: true },
  adminDetails: {
    contactName: { type: String },
    contactEmail: { type: String }
  },
  address: { type: String },
  phone:   { type: String },
  email:   { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Tenant', tenantSchema);
