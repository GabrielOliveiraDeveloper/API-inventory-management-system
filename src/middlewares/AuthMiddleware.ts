import { type Request, type Response, type NextFunction } from 'express';
import jwt from 'jsonwebtoken';


export interface CustomRequest extends Request {
    userId?: string;
    userRole?: string;
}

interface TokenPayload {
    userId: string | number;
    role: string;
    iat: number;
    exp: number;
}

const authMiddleware = (
    req: CustomRequest, 
    res: Response, 
    next: NextFunction
) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ message: 'Token não fornecido' });
    }

    const parts = authHeader.split(' ');

    if (parts.length !== 2 || parts[0] !== 'Bearer' || !parts[1]) {
        return res.status(401).json({ message: 'Erro no formato do token' });
    }
    
    const token = parts[1];

    try {
        const secret = process.env.JWT_SECRET;
        
        if (!secret) {
            throw new Error('JWT_SECRET não está definida nas variáveis de ambiente');
        }
        
        const decoded = jwt.verify(token, secret) as unknown as TokenPayload;

        req.userId = String(decoded.userId);
        req.userRole = decoded.role;

        return next();
    } catch (err) {
        return res.status(401).json({ message: 'Token inválido ou expirado' });
    }
};

export default authMiddleware;