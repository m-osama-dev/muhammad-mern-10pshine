// Wraps an async route handler so we don't have to write try-catch
// in every single controller function. Any error or rejected promise
// just gets passed along to the error handling middleware.
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

module.exports = asyncHandler;
