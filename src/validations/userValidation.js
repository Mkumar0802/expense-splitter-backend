import Joi from "joi";

export const createUserSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  phoneNumber: Joi.string()
    .pattern(/^[0-9]{10}$/)
    .optional(),
});
