import { errorHandler } from "./error.js";
import jwt, { decode } from 'jsonwebtoken';
import { prisma } from '../db.js';

export const verifyToken = (req,res,next) => {
    const token = req.cookies.access_token;

    if(!token) return next(errorHandler(401, 'Unathoraized'));

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if(err) return next(errorHandler(403, 'Forbidden'));

        req.user = user;
        next();
    });
};

// Gate admin-only routes. Must run AFTER verifyToken (needs req.user.id).
export const verifyAdmin = async (req, res, next) => {
    try {
        const user = await prisma.user.findUnique({ where: { id: req.user.id } });
        if (!user || user.role !== 'ADMIN') return next(errorHandler(403, 'Admin access only'));
        next();
    } catch (err) {
        next(err);
    }
};