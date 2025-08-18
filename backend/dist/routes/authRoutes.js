"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middlewares/auth");
const router = (0, express_1.Router)();
router.post('/register', (req, res) => {
    res.status(501).json({
        success: false,
        message: 'Endpoint não implementado ainda',
        endpoint: 'POST /auth/register',
    });
});
router.post('/login', (req, res) => {
    res.status(501).json({
        success: false,
        message: 'Endpoint não implementado ainda',
        endpoint: 'POST /auth/login',
    });
});
router.post('/refresh-token', (req, res) => {
    res.status(501).json({
        success: false,
        message: 'Endpoint não implementado ainda',
        endpoint: 'POST /auth/refresh-token',
    });
});
router.post('/logout', auth_1.authenticate, (req, res) => {
    res.status(501).json({
        success: false,
        message: 'Endpoint não implementado ainda',
        endpoint: 'POST /auth/logout',
    });
});
router.get('/me', auth_1.authenticate, (req, res) => {
    res.status(501).json({
        success: false,
        message: 'Endpoint não implementado ainda',
        endpoint: 'GET /auth/me',
    });
});
router.post('/forgot-password', (req, res) => {
    res.status(501).json({
        success: false,
        message: 'Endpoint não implementado ainda',
        endpoint: 'POST /auth/forgot-password',
    });
});
router.post('/reset-password', (req, res) => {
    res.status(501).json({
        success: false,
        message: 'Endpoint não implementado ainda',
        endpoint: 'POST /auth/reset-password',
    });
});
exports.default = router;
//# sourceMappingURL=authRoutes.js.map