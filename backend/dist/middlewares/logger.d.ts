import winston from 'winston';
export declare const logger: winston.Logger;
export declare const logStream: {
    write: (message: string) => void;
};
export declare const logPerformance: (operation: string, startTime: number, metadata?: any) => void;
export declare const logDatabaseQuery: (query: string, duration: number, params?: any) => void;
export declare const logAuth: (action: string, userId?: string, metadata?: any) => void;
export declare const logFileUpload: (filename: string, size: number, userId?: string) => void;
export declare const logEmail: (action: string, to: string, subject?: string, error?: any) => void;
export declare const logCache: (action: string, key: string, hit?: boolean, ttl?: number) => void;
export default logger;
//# sourceMappingURL=logger.d.ts.map