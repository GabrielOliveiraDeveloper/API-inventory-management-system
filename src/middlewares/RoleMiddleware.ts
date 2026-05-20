import { type Response, type NextFunction } from 'express';
import { type CustomRequest } from './AuthMiddleware.js';

const requireRole = (...allowedRoles: string[]) => {
    return (req: CustomRequest, res: Response, next: NextFunction) => {
        const role = req.userRole;

        if (!role || !allowedRoles.includes(role)) {
            return res.status(403).json({ 
                message: 'Acesso negado: permissão insuficiente' 
            });
        }

        return next();
    };
};

export default requireRole;