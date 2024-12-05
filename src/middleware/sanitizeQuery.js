// src/middleware/sanitizeQuery.js
import validator from 'validator';
const { escape } = validator;

// Middleware to sanitize MongoDB queries
const sanitizeQuery = (req, res, next) => {
  // Sanitize query parameters
  if (req.query) {
    Object.keys(req.query).forEach(key => {
      if (typeof req.query[key] === 'string') {
        req.query[key] = escape(req.query[key]);
      }
    });
  }

  // Sanitize request body if it exists
  if (req.body) {
    Object.keys(req.body).forEach(key => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = escape(req.body[key]);
      }
    });
  }

  next();
};

export default sanitizeQuery;
