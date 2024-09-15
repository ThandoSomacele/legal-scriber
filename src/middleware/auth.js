import jwt from 'jsonwebtoken';

export default function (req, res, next) {
  // Get token from header
  const token = req.header('Authorization')?.split(' ')[1];

  // Check if no token
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id }; // Only set the id in the req.user object
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
}
