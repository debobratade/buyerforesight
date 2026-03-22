const Joi = require("joi");

const ROLES = ["user", "admin", "moderator"];

const schemas = {
  create: Joi.object({
    name:  Joi.string().max(100).required().messages({
      "any.required": "name is required",
      "string.empty": "name cannot be empty",
    }),
    email: Joi.string().email().required().messages({
      "any.required": "email is required",
      "string.email": "must be a valid email address",
    }),
    age:  Joi.number().integer().min(1).max(120).optional(),
    role: Joi.string().valid(...ROLES).optional().messages({
      "any.only": `role must be one of: ${ROLES.join(", ")}`,
    }),
  }),

  update: Joi.object({
    name:  Joi.string().max(100).optional(),
    email: Joi.string().email().optional().messages({
      "string.email": "must be a valid email address",
    }),
    age:  Joi.number().integer().min(1).max(120).optional(),
    role: Joi.string().valid(...ROLES).optional().messages({
      "any.only": `role must be one of: ${ROLES.join(", ")}`,
    }),
  }),

  listQuery: Joi.object({
    search: Joi.string().optional(),
    sort:   Joi.string().optional(),
    order:  Joi.string().valid("asc", "desc").optional().messages({
      "any.only": "order must be asc or desc",
    }),
  }),
};

const validate = (schema, source = "body") => (req, res, next) => {
  const { error } = schema.validate(req[source], { abortEarly: false });
  if (error) {
    const errors = error.details.map(d => d.message);
    return res.status(400).send({ status: false, msg: errors[0], errors });
  }
  next();
};

module.exports = {
  validateCreate:    validate(schemas.create),
  validateUpdate:    validate(schemas.update),
  validateListQuery: validate(schemas.listQuery, "query"),
};
