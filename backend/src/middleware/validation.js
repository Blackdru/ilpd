const Joi = require('joi');

const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.details.map(detail => detail.message)
      });
    }
    
    next();
  };
};

// Validation schemas
const schemas = {
  register: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    name: Joi.string().min(2).max(50).required()
  }),

  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),

  updateProfile: Joi.object({
    name: Joi.string().min(2).max(50),
    email: Joi.string().email()
  }),

  pdfOperation: Joi.object({
    fileIds: Joi.array().items(Joi.string().uuid()).min(1).required(),
    operation: Joi.string().valid('merge', 'split', 'compress', 'convert').required(),
    options: Joi.object().optional()
  })
};

module.exports = {
  validateRequest,
  schemas
};