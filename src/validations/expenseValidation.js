import Joi from "joi";

export const createExpenseSchema = Joi.object({
  title: Joi.string().min(3).max(100).required(),
  amount: Joi.number().positive().required(),
  payerId: Joi.number().integer().required(),
  participantIds: Joi.array().items(Joi.number().integer()).min(1).required(),
});
