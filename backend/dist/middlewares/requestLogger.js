"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestHeaderLogger = exports.requestBodyLogger = exports.requestLogger = void 0;
const logger_1 = require("./logger");
const requestLogger = (req, res, next) => {
    const startTime = Date.now();
    const requestData = {
        method: req.method,
        url: req.originalUrl || req.url,
        ip: req.ip || req.connection.remoteAddress || 'unknown',
        userAgent: req.get('User-Agent'),
        referer: req.get('Referer'),
    };
    if (req.user?.id) {
        requestData.userId = req.user.id;
    }
    const originalEnd = res.end;
    res.end = function (chunk, encoding, callback) {
        const endTime = Date.now();
        const responseTime = endTime - startTime;
        requestData.statusCode = res.statusCode;
        requestData.responseTime = responseTime;
        const contentLengthHeader = res.get('Content-Length');
        requestData.contentLength = contentLengthHeader ? parseInt(contentLengthHeader, 10) : undefined;
        let logLevel = 'info';
        if (res.statusCode >= 400 && res.statusCode < 500) {
            logLevel = 'warn';
        }
        else if (res.statusCode >= 500) {
            logLevel = 'error';
        }
        const message = `${requestData.method} ${requestData.url} ${requestData.statusCode} - ${responseTime}ms`;
        logger_1.logger.log(logLevel, message, {
            type: 'request',
            ...requestData,
            timestamp: new Date().toISOString(),
        });
        if (responseTime > 1000) {
            logger_1.logger.warn('Slow Request Detected', {
                type: 'performance',
                ...requestData,
                threshold: '1000ms',
                timestamp: new Date().toISOString(),
            });
        }
        if (res.statusCode >= 500) {
            logger_1.logger.error('Server Error Response', {
                type: 'server_error',
                ...requestData,
                timestamp: new Date().toISOString(),
            });
        }
        return originalEnd.call(this, chunk, encoding, callback);
    };
    if (process.env.DEBUG === 'true') {
        logger_1.logger.debug('Incoming Request', {
            type: 'request_start',
            method: requestData.method,
            url: requestData.url,
            ip: requestData.ip,
            userAgent: requestData.userAgent,
            timestamp: new Date().toISOString(),
        });
    }
    next();
};
exports.requestLogger = requestLogger;
const requestBodyLogger = (req, res, next) => {
    if (process.env.NODE_ENV === 'development' && process.env.DEBUG === 'true') {
        const sensitiveFields = ['password', 'token', 'secret', 'key', 'authorization'];
        const body = { ...req.body };
        Object.keys(body).forEach(key => {
            if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
                body[key] = '[REDACTED]';
            }
        });
        if (Object.keys(body).length > 0) {
            logger_1.logger.debug('Request Body', {
                type: 'request_body',
                method: req.method,
                url: req.originalUrl || req.url,
                body,
                timestamp: new Date().toISOString(),
            });
        }
    }
    next();
};
exports.requestBodyLogger = requestBodyLogger;
const requestHeaderLogger = (req, res, next) => {
    if (process.env.NODE_ENV === 'development' && process.env.DEBUG === 'true') {
        const importantHeaders = {
            'content-type': req.get('Content-Type'),
            'accept': req.get('Accept'),
            'authorization': req.get('Authorization') ? '[PRESENT]' : '[NOT_PRESENT]',
            'x-forwarded-for': req.get('X-Forwarded-For'),
            'x-real-ip': req.get('X-Real-IP'),
        };
        const filteredHeaders = Object.fromEntries(Object.entries(importantHeaders).filter(([, value]) => value !== undefined));
        if (Object.keys(filteredHeaders).length > 0) {
            logger_1.logger.debug('Request Headers', {
                type: 'request_headers',
                method: req.method,
                url: req.originalUrl || req.url,
                headers: filteredHeaders,
                timestamp: new Date().toISOString(),
            });
        }
    }
    next();
};
exports.requestHeaderLogger = requestHeaderLogger;
exports.default = exports.requestLogger;
//# sourceMappingURL=requestLogger.js.map