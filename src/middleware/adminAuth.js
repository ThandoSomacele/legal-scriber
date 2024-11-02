// src/middleware/adminAuth.js

import User from '../models/User.js';

export const adminAuth = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user || user.role !== 'admin') {
      return res.status(403).json({
        message: 'Admin access required'
      });
    }
    
    next();
  } catch (error) {
    console.error('Admin auth error:', error);
    res.status(500).json({ message: 'Error checking admin status' });
  }
};

// Usage in routes:
// router.get('/admin/dashboard', [auth, adminAuth], adminController.getDashboard);
