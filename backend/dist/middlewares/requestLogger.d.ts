import type { Request, Response, NextFunction } from 'express';
export declare const requestLogger: (req: Request, res: Response, next: NextFunction) => void;
export declare const requestBodyLogger: (req: Request, res: Response, next: NextFunction) => void;
export declare const requestHeaderLogger: (req: Request, res: Response, next: NextFunction) => void;
export default requestLogger;
//# sourceMappingURL=requestLogger.d.ts.map