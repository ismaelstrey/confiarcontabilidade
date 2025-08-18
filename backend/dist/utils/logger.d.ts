import * as winston from 'winston';
declare const logger: winston.Logger;
export declare const logAuth: (message: string, userId?: string, metadata?: Record<string, any>) => void;
export declare const logRequest: (message: string, metadata?: Record<string, any>) => void;
export declare const logDatabase: (message: string, metadata?: Record<string, any>) => void;
export declare const logSystem: (message: string, metadata?: Record<string, any>) => void;
export default logger;
//# sourceMappingURL=logger.d.ts.map