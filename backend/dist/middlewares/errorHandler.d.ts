import type { Request, Response, NextFunction } from 'express';
export interface CustomError extends Error {
    statusCode?: number;
    code?: string;
    details?: any;
}
export declare class AppError extends Error {
    readonly statusCode: number;
    readonly code: string;
    readonly details?: any;
    readonly isOperational: boolean;
    constructor(message: string, statusCode?: number, code?: string, details?: any, isOperational?: boolean);
}
export declare const errorHandler: (error: CustomError, req: Request, res: Response, next: NextFunction) => void;
export declare const asyncHandler: (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => (req: Request, res: Response, next: NextFunction) => void;
export declare const createValidationError: (message: string, details?: any) => AppError;
export declare const createUnauthorizedError: (message?: string) => AppError;
export declare const createForbiddenError: (message?: string) => AppError;
export declare const createNotFoundError: (message?: string) => AppError;
export declare const createConflictError: (message: string, details?: any) => AppError;
export declare const createDatabaseError: (message: string, details?: any) => AppError;
export declare const createTooManyRequestsError: (message?: string) => AppError;
//# sourceMappingURL=errorHandler.d.ts.map