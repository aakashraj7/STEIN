/**
 * Simple request body validator middleware factory.
 * Takes an array of required field names and returns middleware
 * that rejects requests missing any of them.
 */
export function validateRequest(requiredFields = []) {
  return (req, res, next) => {
    const missing = requiredFields.filter((f) => req.body[f] === undefined || req.body[f] === null);
    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        error: { message: `Missing required fields: ${missing.join(', ')}` },
      });
    }
    next();
  };
}
