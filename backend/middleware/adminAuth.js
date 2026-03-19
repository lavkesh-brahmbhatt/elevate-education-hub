// Step 8: Admin Isolation Middleware

const restrictToAdmin = (req, res, next) => {
  // We assume authenticateJWT middleware was already called before this,
  // which means `req.user` exists and the `tenantId` is already verified!

  if (!req.user) {
    return res.status(401).json({ message: "You are not logged in!" });
  }

  // Ensure they are an Admin role
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ message: "Access denied. School Admins only." });
  }

  // ✅ Since the previous `authenticateJWT` verified that:
  // (req.user.tenantId === req.tenantId)
  // We are formally isolated. School A's Admin cannot execute actions on School B's API Endpoint!
  next();
};

/**
 * Super Admin (SaaS Owner) Isolation Middleware
 * This middleware isolates the Global Admin who manages all Tenants 
 * and shouldn't be tied to a specific school.
 */
const restrictToSuperAdmin = (req, res, next) => {
  if (req.user.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ message: "Access denied. SaaS Super Admins only." });
  }
  // Global Admins bypass the x-tenant-id check entirely because they query the Tenant model directly
  next();
};

module.exports = { restrictToAdmin, restrictToSuperAdmin };
