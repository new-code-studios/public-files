const Joi = require('joi');

const schemas = {
  register: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    username: Joi.string().alphanum().min(3).max(30).required()
  }),
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),
  verify: Joi.object({
    property_url: Joi.string().uri().required(),
    method: Joi.string().valid('dns', 'meta_tag', 'file_upload').required()
  }),
  performance: Joi.object({
    property: Joi.string().required(),
    days: Joi.number().default(30),
    startRow: Joi.number().default(0)
  }),
  deployment: Joi.object({
    app_name: Joi.string().required(),
    description: Joi.string().optional(),
    git_repo: Joi.string().optional(),
    property_url: Joi.string().uri().required(),
    target_platform: Joi.string().valid('vercel', 'netlify', 'cloudflare', 'aws', 'gcp').required()
  })
};

exports.validateInput = (schemaName) => {
  return (req, res, next) => {
    const schema = schemas[schemaName];
    if (!schema) {
      return next();
    }

    const { error, value } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.details.map(d => ({ path: d.path.join('.'), message: d.message }))
      });
    }

    req.body = value;
    next();
  };
};
