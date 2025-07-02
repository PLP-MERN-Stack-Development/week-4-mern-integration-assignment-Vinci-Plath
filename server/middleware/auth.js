import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import ErrorResponse from '../utils/errorResponse.js';

// Protect routes
export const protect = async (req, res, next) => {
  let token;
  console.log('Auth headers:', req.headers.authorization);

  if (
    req.headers.authorization && 
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
    console.log('Token found in Authorization header');
  }

  // Make sure token exists
  if (!token) {
    console.log('No token found in request');
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }

  try {
    console.log('Verifying token...');
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Token verified, user ID:', decoded.id);
    
    const user = await User.findById(decoded.id);
    if (!user) {
      console.log('No user found with ID:', decoded.id);
      return next(new ErrorResponse('User no longer exists', 401));
    }
    
    console.log('User found:', user.username);
    req.user = user;
    next();
  } catch (err) {
    console.error('Token verification failed:', err.message);
    return next(new ErrorResponse('Not authorized to access this route', 401));
  }
};

// Grant access to specific roles
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(
          `User role ${req.user.role} is not authorized to access this route`,
          403
        )
      );
    }
    next();
  };
};
