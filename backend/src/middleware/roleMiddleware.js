import React from 'react';
  
  const RoleMiddleware = () =>  {
	return (
	  <div>
	  </div>
	);
  }
  
  export default RoleMiddleware;
  const requireRole = (roles) => (req, res, next) => {
  if (!req.user) {
    res.status(401);
    throw new Error('Not authorized');
  }
  const allowed = Array.isArray(roles) ? roles : [roles];
  if (!allowed.includes(req.user.role)) {
    res.status(403);
    throw new Error(`Access denied, requires role: ${allowed.join(' or ')}`);
  }
  next();
};

module.exports = { requireRole };
