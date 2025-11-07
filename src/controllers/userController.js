import prisma from "../config/db.js";
import logger from "../config/logger.js";

export const getUsers = async (req, res, next) => {
  try {
    const users = await prisma.user.findMany();
    res.status(200).json({ success: true, data: users });
  } catch (err) {
    logger.error(err.message);
    next(err);
  }
};

export const createUser = async (req, res, next) => {
  try {
    const { name, phoneNumber } = req.body;
    const user = await prisma.user.create({ data: { name, phoneNumber } });
    res.status(201).json({ success: true, data: user });
  } catch (err) {
    logger.error(err.message);
    next(err);
  }
};
