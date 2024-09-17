import jwt from 'jsonwebtoken';

export default function (req, res, next) {
  // Get token from header
  const token = req.header('Authorization')?.replace('Bearer ', '');

  // Check if no token
  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id }; // Set the user id in the request object
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
}
