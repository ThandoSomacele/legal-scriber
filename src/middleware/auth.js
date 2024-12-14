// src/middleware/auth.js
import jwt from 'jsonwebtoken';
import logger from '../utils/logger.js';

export default function auth(req, res, next) {
  try {
    // Get token from header and handle different formats
    const authHeader = req.header('Authorization');

    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'No authorization token provided',
      });
    }

    // Extract token whether it's "Bearer <token>" or just "<token>"
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Invalid authorization format',
      });
    }

    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Set user data in request
      req.user = { id: decoded.id };

      // Log successful authentication for debugging
      logger.debug('Token verified successfully', {
        userId: decoded.id,
        path: req.path,
      });

      next();
    } catch (error) {
      // Handle different JWT errors
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Token has expired',
        });
      }

      return res.status(401).json({
        success: false,
        message: 'Token is not valid',
      });
    }
  } catch (error) {
    logger.error('Authentication error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during authentication',
    });
  }
}
