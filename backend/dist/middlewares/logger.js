"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logCache = exports.logEmail = exports.logFileUpload = exports.logAuth = exports.logDatabaseQuery = exports.logPerformance = exports.logStream = exports.logger = void 0;
const winston_1 = __importDefault(require("winston"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const logDir = process.env.LOG_FILE_PATH || './logs';
if (!fs_1.default.existsSync(logDir)) {
    fs_1.default.mkdirSync(logDir, { recursive: true });
}
const logFormat = winston_1.default.format.combine(winston_1.default.format.timestamp({
    format: 'YYYY-MM-DD HH:mm:ss',
}), winston_1.default.format.errors({ stack: true }), winston_1.default.format.json());
const consoleFormat = winston_1.default.format.combine(winston_1.default.format.colorize(), winston_1.default.format.timestamp({
    format: 'HH:mm:ss',
}), winston_1.default.format.printf(({ timestamp, level, message, ...meta }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(meta).length > 0) {
        msg += ` ${JSON.stringify(meta, null, 2)}`;
    }
    return msg;
}));
const transports = [];
if (process.env.NODE_ENV !== 'production') {
    transports.push(new winston_1.default.transports.Console({
        format: consoleFormat,
        level: process.env.LOG_LEVEL || 'info',
    }));
}
transports.push(new winston_1.default.transports.File({
    filename: path_1.default.join(logDir, 'error.log'),
    level: 'error',
    format: logFormat,
    maxsize: parseInt(process.env.LOG_MAX_SIZE || '20971520'),
    maxFiles: parseInt(process.env.LOG_MAX_FILES || '5'),
}), new winston_1.default.transports.File({
    filename: path_1.default.join(logDir, 'combined.log'),
    format: logFormat,
    maxsize: parseInt(process.env.LOG_MAX_SIZE || '20971520'),
    maxFiles: parseInt(process.env.LOG_MAX_FILES || '5'),
}), new winston_1.default.transports.File({
    filename: path_1.default.join(logDir, 'access.log'),
    level: 'http',
    format: logFormat,
    maxsize: parseInt(process.env.LOG_MAX_SIZE || '20971520'),
    maxFiles: parseInt(process.env.LOG_MAX_FILES || '5'),
}));
exports.logger = winston_1.default.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: logFormat,
    defaultMeta: {
        service: 'contabilidade-igrejinha-api',
        environment: process.env.NODE_ENV || 'development',
    },
    transports,
    exitOnError: false,
});
if (process.env.NODE_ENV === 'production' && process.env.VERBOSE_LOGGING === 'true') {
    exports.logger.add(new winston_1.default.transports.Console({
        format: consoleFormat,
        level: 'warn',
    }));
}
exports.logStream = {
    write: (message) => {
        exports.logger.http(message.trim());
    },
};
const logPerformance = (operation, startTime, metadata) => {
    const duration = Date.now() - startTime;
    exports.logger.info(`Performance: ${operation}`, {
        duration: `${duration}ms`,
        operation,
        ...metadata,
    });
};
exports.logPerformance = logPerformance;
const logDatabaseQuery = (query, duration, params) => {
    if (process.env.NODE_ENV === 'development' && process.env.DEBUG === 'true') {
        exports.logger.debug('Database Query', {
            query,
            duration: `${duration}ms`,
            params,
        });
    }
};
exports.logDatabaseQuery = logDatabaseQuery;
const logAuth = (action, userId, metadata) => {
    exports.logger.info(`Auth: ${action}`, {
        action,
        userId,
        timestamp: new Date().toISOString(),
        ...metadata,
    });
};
exports.logAuth = logAuth;
const logFileUpload = (filename, size, userId) => {
    exports.logger.info('File Upload', {
        filename,
        size: `${(size / 1024 / 1024).toFixed(2)}MB`,
        userId,
        timestamp: new Date().toISOString(),
    });
};
exports.logFileUpload = logFileUpload;
const logEmail = (action, to, subject, error) => {
    if (error) {
        exports.logger.error(`Email Error: ${action}`, {
            action,
            to,
            subject,
            error: error.message,
            stack: error.stack,
        });
    }
    else {
        exports.logger.info(`Email: ${action}`, {
            action,
            to,
            subject,
            timestamp: new Date().toISOString(),
        });
    }
};
exports.logEmail = logEmail;
const logCache = (action, key, hit, ttl) => {
    exports.logger.debug(`Cache: ${action}`, {
        action,
        key,
        hit,
        ttl,
        timestamp: new Date().toISOString(),
    });
};
exports.logCache = logCache;
exports.default = exports.logger;
//# sourceMappingURL=logger.js.map