import React from 'react';
  
  const AsyncHandler = () =>  {
	return (
	  <div>
	  </div>
	);
  }
  
  export default AsyncHandler;
  const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

module.exports = asyncHandler;
