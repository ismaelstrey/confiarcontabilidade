import type { Request, Response, NextFunction } from 'express';
interface JwtPayload {
    userId: string;
    email: string;
    role: string;
    iat: number;
    exp: number;
}
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                email: string;
                name: string;
                role: string;
                isActive: boolean;
            };
        }
    }
}
export declare const authenticate: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const authorize: (...roles: string[]) => (req: Request, res: Response, next: NextFunction) => void;
export declare const optionalAuth: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const authorizeOwnerOrAdmin: (userIdParam?: string) => (req: Request, res: Response, next: NextFunction) => void;
export declare const generateTokens: (user: {
    id: string;
    email: string;
    role: string;
}) => {
    accessToken: any;
    refreshToken: any;
};
export declare const verifyRefreshToken: (token: string) => JwtPayload;
declare const _default: {
    authenticate: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    authorize: (...roles: string[]) => (req: Request, res: Response, next: NextFunction) => void;
    optionalAuth: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    authorizeOwnerOrAdmin: (userIdParam?: string) => (req: Request, res: Response, next: NextFunction) => void;
};
export default _default;
//# sourceMappingURL=auth.d.ts.map