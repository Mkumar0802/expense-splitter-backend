import prisma from "../config/db.js";

export const getAllParticipations = async (req, res, next) => {
  try {
    const participations = await prisma.participation.findMany({
      include: { user: true, expense: true },
    });
    res.status(200).json(participations);
  } catch (err) {
    next(err);
  }
};
