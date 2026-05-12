import jwt from 'jsonwebtoken';
import { env } from '../config/env';
export const authentifierJWT = (req, res, next) => {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
    if (!token) {
        res.status(401).json({ message: 'Acces refuse : token manquant' });
        return;
    }
    try {
        const decoded = jwt.verify(token, env.JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch (_error) {
        res.status(401).json({ message: 'Token invalide ou expire' });
    }
};
