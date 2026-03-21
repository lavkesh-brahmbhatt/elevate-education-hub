const Tenant = require('../models/Tenant');

const identifyTenant = async (req, res, next) => {
  try {
    const tenantIdentifier = req.headers['x-tenant-id'];

    if (!tenantIdentifier) {
      return res.status(400).json({ message: 'x-tenant-id header is missing' });
    }

    const tenant = await Tenant.findOne({ subdomain: tenantIdentifier });

    if (!tenant) {
      return res.status(404).json({ message: 'Tenant not found' });
    }

    req.tenantId = tenant._id;
    console.log("Tenant:", req.tenantId);
    next();
  } catch (err) {
    res.status(500).json({ message: 'Server error identifying tenant' });
  }
};

module.exports = identifyTenant;
